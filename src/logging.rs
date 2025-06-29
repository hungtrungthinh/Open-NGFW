use std::collections::HashMap;
use std::fs::{self, File, OpenOptions};
use std::io::{self, BufRead, BufReader, BufWriter, Write};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use tokio::time::{interval, sleep};
use flate2::write::GzEncoder;
use flate2::Compression;
use uuid::Uuid;
use serde_json::{json, Value};
use anyhow::Result;

// ============================================================================
// LOG TYPES AND STRUCTURES
// ============================================================================

/// Types of logs supported by the system
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum LogType {
    Traffic,
    Threat,
    System,
}

/// Log entry structure
#[derive(Debug, Clone)]
pub struct LogEntry {
    pub timestamp: DateTime<Utc>,
    pub log_type: LogType,
    pub data: Value,
}

/// Log metadata for indexing and querying
#[derive(Debug, Clone)]
pub struct LogMetadata {
    pub timestamp: DateTime<Utc>,
    pub log_type: LogType,
    pub source_ip: Option<String>,
    pub destination_ip: Option<String>,
    pub user: Option<String>,
    pub action: Option<String>,
    pub severity: Option<String>,
}

/// Configuration for log rotation
#[derive(Debug, Clone)]
pub struct RotationConfig {
    pub interval: RotationInterval,
    pub max_file_size: usize,
    pub max_files: usize,
    pub compression: bool,
    pub compression_level: u32,
}

/// Rotation intervals
#[derive(Debug, Clone)]
pub enum RotationInterval {
    Hourly,
    Daily,
    Weekly,
    Monthly,
}

/// Configuration for log retention
#[derive(Debug, Clone)]
pub struct RetentionConfig {
    pub traffic_logs: Duration,
    pub threat_logs: Duration,
    pub system_logs: Duration,
}

/// Configuration for performance tuning
#[derive(Debug, Clone)]
pub struct PerformanceConfig {
    pub buffer_size: usize,
    pub flush_interval: Duration,
    pub max_memory: usize,
}

/// Main log configuration
#[derive(Debug, Clone)]
pub struct LogConfig {
    pub base_path: PathBuf,
    pub rotation: RotationConfig,
    pub retention: RetentionConfig,
    pub performance: PerformanceConfig,
}

/// Log writer for a specific log type
struct LogWriter {
    file: BufWriter<File>,
    current_file: PathBuf,
    bytes_written: usize,
    config: LogConfig,
}

/// Index for fast log querying
struct Index {
    entries: Vec<IndexEntry>,
}

/// Index entry for a log record
#[derive(Debug, Clone)]
struct IndexEntry {
    timestamp: DateTime<Utc>,
    file_path: PathBuf,
    offset: u64,
    length: u64,
    metadata: LogMetadata,
}

/// Query filter for log searches
#[derive(Debug, Clone)]
pub struct Filter {
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub log_types: Option<Vec<LogType>>,
    pub source_ip: Option<String>,
    pub destination_ip: Option<String>,
    pub user: Option<String>,
    pub action: Option<String>,
    pub severity: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Main log manager
pub struct LogManager {
    config: LogConfig,
    writers: HashMap<LogType, Arc<Mutex<LogWriter>>>,
    indexes: HashMap<String, Arc<Mutex<Index>>>,
    tx: mpsc::Sender<LogEntry>,
    rx: mpsc::Receiver<LogEntry>,
}

impl LogManager {
    /// Create a new log manager
    pub async fn new(config: LogConfig) -> Result<Self> {
        // Create base directory
        fs::create_dir_all(&config.base_path)?;

        // Create subdirectories for each log type
        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System] {
            let type_path = config.base_path.join(log_type_to_string(log_type));
            fs::create_dir_all(&type_path)?;
        }

        // Initialize writers and indexes
        let writers = Self::initialize_writers(&config).await?;
        let indexes = Self::initialize_indexes(&config.base_path)?;

        // Create channel for async logging
        let (tx, rx) = mpsc::channel(1000);

        let mut manager = Self {
            config,
            writers,
            indexes,
            tx,
            rx,
        };

        // Start background tasks
        manager.start_background_tasks().await;

        Ok(manager)
    }

    /// Initialize log writers for each log type
    async fn initialize_writers(config: &LogConfig) -> Result<HashMap<LogType, Arc<Mutex<LogWriter>>>> {
        let mut writers = HashMap::new();

        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System] {
            let type_path = config.base_path.join(log_type_to_string(log_type));
            let current_file = Self::get_current_log_file(&type_path, log_type)?;
            
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&current_file)?;
            
            let writer = LogWriter {
                file: BufWriter::new(file),
                current_file,
                bytes_written: 0,
                config: config.clone(),
            };

            writers.insert(log_type.clone(), Arc::new(Mutex::new(writer)));
        }

        Ok(writers)
    }

    /// Initialize indexes for fast querying
    fn initialize_indexes(_base_path: &Path) -> io::Result<HashMap<String, Arc<Mutex<Index>>>> {
        let mut indexes = HashMap::new();
        
        // Initialize indexes for each log type
        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System] {
            let index_name = log_type_to_string(log_type);
            indexes.insert(index_name, Arc::new(Mutex::new(Index { entries: Vec::new() })));
        }

        Ok(indexes)
    }

    /// Get current log file path
    fn get_current_log_file(type_path: &Path, log_type: &LogType) -> Result<PathBuf> {
        let now = Utc::now();
        let type_str = log_type_to_string(log_type);
        
        let year = now.format("%Y").to_string();
        let month = now.format("%m").to_string();
        let day = now.format("%d").to_string();
        let hour = now.format("%H").to_string();

        let log_file = type_path
            .join(&year)
            .join(&month)
            .join(&day)
            .join(format!("{}_{}-{}-{}_{}.log", type_str, &year, &month, &day, &hour));

        // Create directory structure
        if let Some(parent) = log_file.parent() {
            fs::create_dir_all(parent)?;
        }

        Ok(log_file)
    }

    /// Start background tasks for rotation and cleanup
    async fn start_background_tasks(&mut self) {
        let config = self.config.clone();
        let writers = self.writers.clone();
        let indexes = self.indexes.clone();

        // Start rotation task
        tokio::spawn(async move {
            let mut interval = interval(config.rotation.interval.to_duration());
            loop {
                interval.tick().await;
                if let Err(e) = Self::rotate_logs(&writers, &config).await {
                    eprintln!("Log rotation error: {}", e);
                }
            }
        });

        // Start cleanup task
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(3600)); // Every hour
            loop {
                interval.tick().await;
                if let Err(e) = Self::cleanup_old_logs(&config).await {
                    eprintln!("Log cleanup error: {}", e);
                }
            }
        });

        // Start processing task
        let mut rx = std::mem::replace(&mut self.rx, mpsc::channel(1000).1);
        let writers = self.writers.clone();
        tokio::spawn(async move {
            while let Some(entry) = rx.recv().await {
                if let Err(e) = Self::write_log_entry(&writers, entry).await {
                    eprintln!("Log write error: {}", e);
                }
            }
        });
    }

    /// Rotate log files
    async fn rotate_logs(
        writers: &HashMap<LogType, Arc<Mutex<LogWriter>>>,
        config: &LogConfig,
    ) -> Result<()> {
        for (log_type, writer_arc) in writers {
            let mut writer = writer_arc.lock().unwrap();
            
            // Check if rotation is needed
            if writer.bytes_written >= config.rotation.max_file_size {
                // Close current file
                writer.file.flush()?;
                drop(writer.file);

                // Compress if enabled
                if config.rotation.compression {
                    Self::compress_log_file(&writer.current_file)?;
                }

                // Create new file
                let type_path = config.base_path.join(log_type_to_string(log_type));
                let new_file = Self::get_current_log_file(&type_path, log_type)?;
                
                let file = OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&new_file)?;

                writer.file = BufWriter::new(file);
                writer.current_file = new_file;
                writer.bytes_written = 0;
            }
        }

        Ok(())
    }

    /// Compress a log file
    fn compress_log_file(file_path: &Path) -> Result<()> {
        let compressed_path = file_path.with_extension("log.gz");
        
        let input = File::open(file_path)?;
        let output = File::create(&compressed_path)?;
        let mut encoder = GzEncoder::new(output, Compression::default());

        io::copy(&mut BufReader::new(input), &mut encoder)?;
        encoder.finish()?;

        // Remove original file
        fs::remove_file(file_path)?;

        Ok(())
    }

    /// Clean up old log files
    async fn cleanup_old_logs(config: &LogConfig) -> Result<()> {
        let now = Utc::now();

        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System] {
            let retention_duration = match log_type {
                LogType::Traffic => config.retention.traffic_logs,
                LogType::Threat => config.retention.threat_logs,
                LogType::System => config.retention.system_logs,
            };

            let cutoff_time = now - chrono::Duration::from_std(retention_duration)?;
            let type_path = config.base_path.join(log_type_to_string(log_type));

            Self::remove_old_files(&type_path, cutoff_time).await?;
        }

        Ok(())
    }

    /// Remove old log files
    async fn remove_old_files(path: &Path, cutoff_time: DateTime<Utc>) -> Result<()> {
        if !path.exists() {
            return Ok(());
        }

        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let file_path = entry.path();

            if file_path.is_file() {
                if let Ok(metadata) = fs::metadata(&file_path) {
                    if let Ok(modified) = metadata.modified() {
                        let modified_time: DateTime<Utc> = modified.into();
                        if modified_time < cutoff_time {
                            fs::remove_file(&file_path)?;
                        }
                    }
                }
            } else if file_path.is_dir() {
                Self::remove_old_files(&file_path, cutoff_time).await?;
                
                // Remove empty directories
                if fs::read_dir(&file_path)?.next().is_none() {
                    fs::remove_dir(&file_path)?;
                }
            }
        }

        Ok(())
    }

    /// Write a log entry
    async fn write_log_entry(
        writers: &HashMap<LogType, Arc<Mutex<LogWriter>>>,
        entry: LogEntry,
    ) -> Result<()> {
        if let Some(writer) = writers.get(&entry.log_type) {
            let mut writer = writer.lock().unwrap();
            
            let log_line = json!({
                "timestamp": entry.timestamp.to_rfc3339(),
                "type": log_type_to_string(&entry.log_type),
                "data": entry.data
            });

            let line = serde_json::to_string(&log_line)? + "\n";
            writer.file.write_all(line.as_bytes())?;
            writer.bytes_written += line.len();

            // Flush if buffer is getting large
            if writer.bytes_written % 4096 == 0 {
                writer.file.flush()?;
            }
        }

        Ok(())
    }

    /// Log a traffic event
    pub async fn log_traffic(&self, metadata: LogMetadata, data: Value) -> Result<()> {
        let entry = LogEntry {
            timestamp: metadata.timestamp,
            log_type: LogType::Traffic,
            data,
        };

        self.tx.send(entry).await.map_err(|e| anyhow::anyhow!("Failed to send log entry: {}", e))?;
        Ok(())
    }

    /// Log a threat event
    pub async fn log_threat(&self, metadata: LogMetadata, data: Value) -> Result<()> {
        let entry = LogEntry {
            timestamp: metadata.timestamp,
            log_type: LogType::Threat,
            data,
        };

        self.tx.send(entry).await.map_err(|e| anyhow::anyhow!("Failed to send log entry: {}", e))?;
        Ok(())
    }

    /// Log a system event
    pub async fn log_system(&self, metadata: LogMetadata, data: Value) -> Result<()> {
        let entry = LogEntry {
            timestamp: metadata.timestamp,
            log_type: LogType::System,
            data,
        };

        self.tx.send(entry).await.map_err(|e| anyhow::anyhow!("Failed to send log entry: {}", e))?;
        Ok(())
    }

    /// Query logs with filters
    pub async fn query_logs(&self, filter: &Filter) -> Result<Vec<LogEntry>> {
        let mut results = Vec::new();

        // Determine which log types to search
        let log_types = filter.log_types.as_ref()
            .unwrap_or(&vec![LogType::Traffic, LogType::Threat, LogType::System]);

        for log_type in log_types {
            let type_path = self.config.base_path.join(log_type_to_string(log_type));
            let entries = self.read_log_files(&type_path, filter).await?;
            results.extend(entries);
        }

        // Sort by timestamp
        results.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));

        // Apply limit and offset
        if let Some(offset) = filter.offset {
            if offset < results.len() {
                results = results[offset..].to_vec();
            } else {
                results.clear();
            }
        }

        if let Some(limit) = filter.limit {
            if limit < results.len() {
                results.truncate(limit);
            }
        }

        Ok(results)
    }

    /// Read log files from a directory
    async fn read_log_files(&self, path: &Path, filter: &Filter) -> Result<Vec<LogEntry>> {
        let mut entries = Vec::new();

        if !path.exists() {
            return Ok(entries);
        }

        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let file_path = entry.path();

            if file_path.is_file() && file_path.extension().map_or(false, |ext| ext == "log") {
                let file_entries = self.read_log_file(&file_path, filter).await?;
                entries.extend(file_entries);
            } else if file_path.is_dir() {
                let sub_entries = self.read_log_files(&file_path, filter).await?;
                entries.extend(sub_entries);
            }
        }

        Ok(entries)
    }

    /// Read a single log file
    async fn read_log_file(&self, file_path: &Path, filter: &Filter) -> Result<Vec<LogEntry>> {
        let mut entries = Vec::new();
        let file = File::open(file_path)?;
        let reader = BufReader::new(file);

        for line in reader.lines() {
            let line = line?;
            if let Ok(log_data) = serde_json::from_str::<Value>(&line) {
                if let Some(timestamp_str) = log_data.get("timestamp").and_then(|t| t.as_str()) {
                    if let Ok(timestamp) = DateTime::parse_from_rfc3339(timestamp_str) {
                        let timestamp: DateTime<Utc> = timestamp.into();

                        // Apply time filter
                        if let Some(start_time) = filter.start_time {
                            if timestamp < start_time {
                                continue;
                            }
                        }

                        if let Some(end_time) = filter.end_time {
                            if timestamp > end_time {
                                continue;
                            }
                        }

                        // Apply other filters
                        if let Some(ref source_ip) = filter.source_ip {
                            if let Some(data) = log_data.get("data") {
                                if let Some(log_source_ip) = data.get("src_ip").and_then(|ip| ip.as_str()) {
                                    if log_source_ip != source_ip {
                                        continue;
                                    }
                                }
                            }
                        }

                        if let Some(ref destination_ip) = filter.destination_ip {
                            if let Some(data) = log_data.get("data") {
                                if let Some(log_dst_ip) = data.get("dst_ip").and_then(|ip| ip.as_str()) {
                                    if log_dst_ip != destination_ip {
                                        continue;
                                    }
                                }
                            }
                        }

                        // Create log entry
                        let log_type = if let Some(type_str) = log_data.get("type").and_then(|t| t.as_str()) {
                            match type_str {
                                "traffic" => LogType::Traffic,
                                "threat" => LogType::Threat,
                                "system" => LogType::System,
                                _ => continue,
                            }
                        } else {
                            continue;
                        };

                        let entry = LogEntry {
                            timestamp,
                            log_type,
                            data: log_data.get("data").cloned().unwrap_or_else(|| json!({})),
                        };

                        entries.push(entry);
                    }
                }
            }
        }

        Ok(entries)
    }

    /// Read archived log files
    async fn read_archived_files(&self, _time_filter: &Filter) -> io::Result<Option<Vec<LogEntry>>> {
        // Implementation for reading compressed/archived files
        // This would handle .gz files and other compressed formats
        Ok(None)
    }

    /// Get log statistics
    pub async fn get_statistics(&self) -> Result<Value> {
        let mut stats = json!({});

        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System] {
            let type_path = self.config.base_path.join(log_type_to_string(log_type));
            let type_stats = self.get_type_statistics(&type_path).await?;
            
            if let Some(stats_obj) = stats.as_object_mut() {
                stats_obj.insert(log_type_to_string(log_type), type_stats);
            }
        }

        Ok(stats)
    }

    /// Get statistics for a specific log type
    async fn get_type_statistics(&self, path: &Path) -> Result<Value> {
        let mut file_count = 0;
        let mut total_size = 0;
        let mut entry_count = 0;

        if path.exists() {
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let file_path = entry.path();

                if file_path.is_file() {
                    file_count += 1;
                    if let Ok(metadata) = fs::metadata(&file_path) {
                        total_size += metadata.len();
                    }
                } else if file_path.is_dir() {
                    let sub_stats = self.get_type_statistics(&file_path).await?;
                    if let Some(sub_obj) = sub_stats.as_object() {
                        file_count += sub_obj.get("file_count").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
                        total_size += sub_obj.get("total_size").and_then(|v| v.as_u64()).unwrap_or(0);
                        entry_count += sub_obj.get("entry_count").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
                    }
                }
            }
        }

        Ok(json!({
            "file_count": file_count,
            "total_size": total_size,
            "entry_count": entry_count
        }))
    }
}

impl RotationInterval {
    /// Convert rotation interval to Duration
    fn to_duration(&self) -> Duration {
        match self {
            RotationInterval::Hourly => Duration::from_secs(3600),
            RotationInterval::Daily => Duration::from_secs(86400),
            RotationInterval::Weekly => Duration::from_secs(604800),
            RotationInterval::Monthly => Duration::from_secs(2592000),
        }
    }
}

/// Convert log type to string
fn log_type_to_string(log_type: &LogType) -> String {
    match log_type {
        LogType::Traffic => "traffic".to_string(),
        LogType::Threat => "threat".to_string(),
        LogType::System => "system".to_string(),
    }
} 