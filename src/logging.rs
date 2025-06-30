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
use reqwest::Client;
use tokio::sync::broadcast;

// ============================================================================
// LOG TYPES AND STRUCTURES
// ============================================================================

/// Types of logs supported by the system
#[derive(Debug, Clone, Serialize, Deserialize, Eq, Hash, PartialEq)]
pub enum LogType {
    Traffic,
    Threat,
    System,
    Security,
}

/// Log entry structure
#[derive(Debug, Clone, Serialize, Deserialize)]
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
    // Các trường mở rộng cho SIEM/ELK/Splunk
    pub session_id: Option<String>,
    pub request_id: Option<String>,
    pub correlation_id: Option<String>,
    pub component: Option<String>,
    pub category: Option<String>,
    pub subcategory: Option<String>,
    pub event_id: Option<String>,
    pub event_name: Option<String>,
    pub event_source: Option<String>,
    pub event_version: Option<String>,
    pub risk_score: Option<f64>,
    pub threat_level: Option<String>,
    pub geo_location: Option<String>,
    pub user_agent: Option<String>,
    pub http_method: Option<String>,
    pub http_status: Option<u16>,
    pub response_time: Option<u64>,
    pub bytes_sent: Option<u64>,
    pub bytes_received: Option<u64>,
    pub protocol: Option<String>,
    pub port: Option<u16>,
    pub application: Option<String>,
    pub device_id: Option<String>,
    pub device_type: Option<String>,
    pub device_vendor: Option<String>,
    pub device_model: Option<String>,
    pub device_serial: Option<String>,
    pub device_firmware: Option<String>,
    pub device_location: Option<String>,
    pub device_zone: Option<String>,
    pub policy_id: Option<String>,
    pub policy_name: Option<String>,
    pub policy_type: Option<String>,
    pub rule_id: Option<String>,
    pub rule_name: Option<String>,
    pub rule_action: Option<String>,
    pub interface_name: Option<String>,
    pub vlan_id: Option<u16>,
    pub vpn_tunnel: Option<String>,
    pub ssl_cipher: Option<String>,
    pub ssl_version: Option<String>,
    pub certificate_subject: Option<String>,
    pub certificate_issuer: Option<String>,
    pub certificate_expiry: Option<DateTime<Utc>>,
    pub malware_name: Option<String>,
    pub malware_type: Option<String>,
    pub malware_signature: Option<String>,
    pub url: Option<String>,
    pub domain: Option<String>,
    pub file_name: Option<String>,
    pub file_hash: Option<String>,
    pub file_size: Option<u64>,
    pub file_type: Option<String>,
    pub email_sender: Option<String>,
    pub email_recipient: Option<String>,
    pub email_subject: Option<String>,
    pub email_attachment: Option<String>,
    pub database_name: Option<String>,
    pub database_table: Option<String>,
    pub database_query: Option<String>,
    pub api_endpoint: Option<String>,
    pub api_version: Option<String>,
    pub api_key: Option<String>,
    pub cloud_provider: Option<String>,
    pub cloud_region: Option<String>,
    pub cloud_account: Option<String>,
    pub cloud_service: Option<String>,
    pub cloud_resource: Option<String>,
    pub container_id: Option<String>,
    pub container_name: Option<String>,
    pub container_image: Option<String>,
    pub kubernetes_pod: Option<String>,
    pub kubernetes_namespace: Option<String>,
    pub kubernetes_service: Option<String>,
    pub kubernetes_deployment: Option<String>,
    pub kubernetes_node: Option<String>,
    pub kubernetes_cluster: Option<String>,
    pub custom_fields: Option<serde_json::Value>,
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
    log_exporter: Arc<LogExporter>,
}

/// LogExporter để gửi log đến các hệ thống SIEM/ELK/Splunk
pub struct LogExporter {
    pub exporters: Vec<Box<dyn LogExport + Send + Sync>>,
}

impl LogExporter {
    pub fn new() -> Self {
        Self {
            exporters: Vec::new(),
        }
    }

    pub fn add_exporter(&mut self, exporter: Box<dyn LogExport + Send + Sync>) {
        self.exporters.push(exporter);
    }

    pub async fn export_log(&self, log_entry: &LogEntry) -> Result<()> {
        for exporter in &self.exporters {
            if let Err(e) = exporter.export(log_entry).await {
                eprintln!("Failed to export log: {}", e);
            }
        }
        Ok(())
    }
}

/// Trait cho các exporter
#[async_trait::async_trait]
pub trait LogExport {
    async fn export(&self, log_entry: &LogEntry) -> Result<()>;
}

/// Elasticsearch Exporter
#[derive(Debug, Clone)]
pub struct ElasticsearchExporter {
    client: Client,
    url: String,
    index: String,
    username: Option<String>,
    password: Option<String>,
}

impl ElasticsearchExporter {
    pub fn new(url: String, index: String, username: Option<String>, password: Option<String>) -> Self {
        Self {
            client: Client::new(),
            url,
            index,
            username,
            password,
        }
    }

    pub fn new_default() -> Self {
        Self::new(
            "http://localhost:9200".to_string(),
            "open-ngfw-logs".to_string(),
            None,
            None,
        )
    }
}

#[async_trait::async_trait]
impl LogExport for ElasticsearchExporter {
    async fn export(&self, log_entry: &LogEntry) -> Result<()> {
        let url = format!("{}/{}/_doc", self.url, self.index);
        
        let mut request = self.client.post(&url)
            .header("Content-Type", "application/json");

        // Add authentication if provided
        if let (Some(username), Some(password)) = (&self.username, &self.password) {
            request = request.basic_auth(username, Some(password));
        }

        let response = request.json(&log_entry).send().await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Elasticsearch export failed: {}", response.status()));
        }

        Ok(())
    }
}

/// Splunk Exporter
#[derive(Debug, Clone)]
pub struct SplunkExporter {
    client: Client,
    url: String,
    token: String,
    source: String,
    sourcetype: String,
}

impl SplunkExporter {
    pub fn new(url: String, token: String, source: String, sourcetype: String) -> Self {
        Self {
            client: Client::new(),
            url,
            token,
            source,
            sourcetype,
        }
    }

    pub fn new_default() -> Self {
        Self::new(
            "http://localhost:8088".to_string(),
            "your-splunk-token".to_string(),
            "open-ngfw".to_string(),
            "json".to_string(),
        )
    }
}

#[async_trait::async_trait]
impl LogExport for SplunkExporter {
    async fn export(&self, log_entry: &LogEntry) -> Result<()> {
        let url = format!("{}/services/collector", self.url);
        
        let payload = json!({
            "event": log_entry,
            "source": self.source,
            "sourcetype": self.sourcetype,
        });

        let response = self.client.post(&url)
            .header("Authorization", format!("Splunk {}", self.token))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Splunk export failed: {}", response.status()));
        }

        Ok(())
    }
}

/// Syslog Exporter
#[derive(Debug, Clone)]
pub struct SyslogExporter {
    host: String,
    port: u16,
    facility: u8,
    severity: u8,
}

impl SyslogExporter {
    pub fn new(host: String, port: u16, facility: u8, severity: u8) -> Self {
        Self {
            host,
            port,
            facility,
            severity,
        }
    }

    pub fn new_default() -> Self {
        Self::new("localhost".to_string(), 514, 16, 6) // LOCAL0, INFO
    }
}

#[async_trait::async_trait]
impl LogExport for SyslogExporter {
    async fn export(&self, log_entry: &LogEntry) -> Result<()> {
        use tokio::net::UdpSocket;
        
        let socket = UdpSocket::bind("0.0.0.0:0").await?;
        
        // Format syslog message
        let priority = (self.facility << 3) | self.severity;
        let timestamp = log_entry.timestamp.format("%b %d %H:%M:%S");
        let host_os = hostname::get().unwrap_or_default();
        let hostname = host_os.to_string_lossy();
        
        let message = format!(
            "<{}>{} {} open-ngfw: {}",
            priority,
            timestamp,
            hostname,
            serde_json::to_string(&log_entry)?
        );

        socket.send_to(message.as_bytes(), format!("{}:{}", self.host, self.port)).await?;
        
        Ok(())
    }
}

/// HTTP Webhook Exporter
#[derive(Debug, Clone)]
pub struct WebhookExporter {
    client: Client,
    url: String,
    headers: HashMap<String, String>,
}

impl WebhookExporter {
    pub fn new(url: String, headers: HashMap<String, String>) -> Self {
        Self {
            client: Client::new(),
            url,
            headers,
        }
    }

    pub fn new_default() -> Self {
        let mut headers = HashMap::new();
        headers.insert("Content-Type".to_string(), "application/json".to_string());
        headers.insert("User-Agent".to_string(), "Open-NGFW/1.0.0".to_string());
        
        Self::new("http://localhost:8080/webhook".to_string(), headers)
    }
}

#[async_trait::async_trait]
impl LogExport for WebhookExporter {
    async fn export(&self, log_entry: &LogEntry) -> Result<()> {
        let mut request = self.client.post(&self.url)
            .json(&log_entry);

        // Add custom headers
        for (key, value) in &self.headers {
            request = request.header(key, value);
        }

        let response = request.send().await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Webhook export failed: {}", response.status()));
        }

        Ok(())
    }
}

impl LogManager {
    /// Create a new log manager
    pub async fn new(config: LogConfig) -> Result<Self> {
        let (tx, rx) = mpsc::channel(1000);
        
        let writers = Self::initialize_writers(&config).await?;
        let indexes = Self::initialize_indexes(&config.base_path)?;
        
        let mut manager = Self {
            config,
            writers,
            indexes,
            tx,
            rx,
            log_exporter: Arc::new(LogExporter::new()),
        };
        
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
        let mut rx = std::mem::replace(&mut self.rx, mpsc::channel(1000).1);
        let writers = self.writers.clone();
        let config = self.config.clone();
        let log_exporter = self.log_exporter.clone();
        
        // Start log processing task
        tokio::spawn(async move {
            while let Some(entry) = rx.recv().await {
                // Write to file
                if let Err(e) = Self::write_log_entry(&writers, entry.clone()).await {
                    eprintln!("Failed to write log entry: {}", e);
                }
                
                // Export to SIEM systems
                if let Err(e) = log_exporter.export_log(&entry).await {
                    eprintln!("Failed to export log: {}", e);
                }
            }
        });
        
        // Start rotation task
        let writers_rotation = self.writers.clone();
        let config_rotation = self.config.clone();
        tokio::spawn(async move {
            let mut interval = interval(config_rotation.rotation.interval.to_duration());
            loop {
                interval.tick().await;
                if let Err(e) = Self::rotate_logs(&writers_rotation, &config_rotation).await {
                    eprintln!("Failed to rotate logs: {}", e);
                }
            }
        });
        
        // Start cleanup task
        let config_cleanup = self.config.clone();
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(3600)); // Check every hour
            loop {
                interval.tick().await;
                if let Err(e) = Self::cleanup_old_logs(&config_cleanup).await {
                    eprintln!("Failed to cleanup old logs: {}", e);
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
                {
                    let _ = writer.file.flush();
                    // File will be dropped here
                }
                
                // Compress old file if enabled
                if config.rotation.compression {
                    if let Err(e) = Self::compress_log_file(&writer.current_file) {
                        eprintln!("Failed to compress log file: {}", e);
                    }
                }
                
                // Create new log file
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
        
        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System, LogType::Security] {
            let type_path = config.base_path.join(log_type_to_string(log_type));
            let retention_duration = match log_type {
                LogType::Traffic => config.retention.traffic_logs,
                LogType::Threat => config.retention.threat_logs,
                LogType::System => config.retention.system_logs,
                LogType::Security => config.retention.system_logs, // Use same retention as system logs
            };
            
            let cutoff_time = now - retention_duration;
            if let Err(e) = Self::remove_old_files(&type_path, cutoff_time).await {
                eprintln!("Failed to cleanup old logs for {:?}: {}", log_type, e);
            }
        }
        
        Ok(())
    }

    /// Remove old log files
    async fn remove_old_files(path: &Path, cutoff_time: DateTime<Utc>) -> Result<()> {
        let entries = fs::read_dir(path)?;
        
        for entry in entries {
            let entry = entry?;
            let file_path = entry.path();
            
            if file_path.is_dir() {
                Box::pin(Self::remove_old_files(&file_path, cutoff_time)).await?;
            } else {
                if let Ok(metadata) = fs::metadata(&file_path) {
                    if let Ok(modified) = metadata.modified() {
                        let modified: DateTime<Utc> = modified.into();
                        if modified < cutoff_time {
                            fs::remove_file(&file_path)?;
                        }
                    }
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
            
            // Write to file
            let log_line = serde_json::to_string(&entry)?;
            writeln!(writer.file, "{}", log_line)?;
            writer.file.flush()?;
            
            // Update bytes written
            writer.bytes_written += log_line.len() + 1; // +1 for newline
            
            // Check if rotation is needed
            if writer.bytes_written >= writer.config.rotation.max_file_size {
                // Trigger rotation
                // This would be handled by the background rotation task
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

    /// Log a security event
    pub async fn log_security(&self, metadata: LogMetadata, data: Value) -> Result<()> {
        let entry = LogEntry {
            timestamp: metadata.timestamp,
            log_type: LogType::Security,
            data,
        };
        self.tx.send(entry).await.map_err(|e| anyhow::anyhow!("Failed to send log entry: {}", e))?;
        Ok(())
    }

    /// Query logs with filters
    pub async fn query_logs(&self, filter: &Filter) -> Result<Vec<LogEntry>> {
        let mut all_entries = Vec::new();
        
        // Determine which log types to query
        let default_log_types = vec![LogType::Traffic, LogType::Threat, LogType::System];
        let log_types = filter.log_types.as_ref().unwrap_or(&default_log_types);

        for log_type in log_types {
            let type_path = self.config.base_path.join(log_type_to_string(log_type));
            let entries = self.read_log_files(&type_path, filter).await?;
            all_entries.extend(entries);
        }

        // Apply time filtering
        if let Some(start_time) = filter.start_time {
            all_entries.retain(|entry| entry.timestamp >= start_time);
        }
        
        if let Some(end_time) = filter.end_time {
            all_entries.retain(|entry| entry.timestamp <= end_time);
        }

        // Apply limit and offset
        if let Some(offset) = filter.offset {
            if offset < all_entries.len() {
                all_entries = all_entries.into_iter().skip(offset).collect();
            } else {
                all_entries.clear();
            }
        }
        
        if let Some(limit) = filter.limit {
            all_entries.truncate(limit);
        }

        Ok(all_entries)
    }

    /// Read log files from a directory
    async fn read_log_files(&self, path: &Path, filter: &Filter) -> Result<Vec<LogEntry>> {
        let mut entries = Vec::new();
        let entries_iter = fs::read_dir(path)?;
        
        for entry in entries_iter {
            let entry = entry?;
            let file_path = entry.path();
            
            // Skip hidden files and system files
            if let Some(file_name) = file_path.file_name() {
                let file_name_str = file_name.to_string_lossy();
                if file_name_str.starts_with('.') || file_name_str == "DS_Store" {
                    continue;
                }
            }
            
            if file_path.is_dir() {
                let sub_entries = Box::pin(self.read_log_files(&file_path, filter)).await?;
                entries.extend(sub_entries);
            } else if file_path.is_file() {
                // Only process .log files
                if let Some(extension) = file_path.extension() {
                    if extension == "log" {
                        let file_entries = self.read_log_file(&file_path, filter).await?;
                        entries.extend(file_entries);
                    }
                }
            }
        }
        
        Ok(entries)
    }

    /// Read a single log file
    async fn read_log_file(&self, file_path: &Path, filter: &Filter) -> Result<Vec<LogEntry>> {
        let mut entries = Vec::new();
        
        // Check if file exists and is readable
        if !file_path.exists() {
            return Ok(entries);
        }
        
        let file = match File::open(file_path) {
            Ok(f) => f,
            Err(e) => {
                eprintln!("Failed to open log file {:?}: {}", file_path, e);
                return Ok(entries);
            }
        };
        
        let reader = BufReader::new(file);

        for (line_num, line_result) in reader.lines().enumerate() {
            let line = match line_result {
                Ok(line) => line,
                Err(e) => {
                    // Handle UTF-8 errors gracefully
                    eprintln!("Failed to read line {} in {:?}: {}", line_num + 1, file_path, e);
                    continue;
                }
            };
            
            // Skip empty lines
            if line.trim().is_empty() {
                continue;
            }
            
            let log_data = match serde_json::from_str::<Value>(&line) {
                Ok(data) => data,
                Err(e) => {
                    eprintln!("Failed to parse JSON at line {} in {:?}: {}", line_num + 1, file_path, e);
                    continue;
                }
            };
            
            let timestamp_str = match log_data.get("timestamp").and_then(|t| t.as_str()) {
                Some(ts) => ts,
                None => {
                    eprintln!("Missing timestamp at line {} in {:?}", line_num + 1, file_path);
                    continue;
                }
            };
            
            let timestamp = match DateTime::parse_from_rfc3339(timestamp_str) {
                Ok(dt) => dt.with_timezone(&Utc),
                Err(e) => {
                    eprintln!("Invalid timestamp format at line {} in {:?}: {}", line_num + 1, file_path, e);
                    continue;
                }
            };

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
            let log_type = match log_data.get("type").and_then(|t| t.as_str()) {
                Some("traffic") => LogType::Traffic,
                Some("threat") => LogType::Threat,
                Some("system") => LogType::System,
                Some("security") => LogType::Security,
                _ => {
                    eprintln!("Unknown log type at line {} in {:?}", line_num + 1, file_path);
                    continue;
                }
            };

            let entry = LogEntry {
                timestamp,
                log_type,
                data: log_data.get("data").cloned().unwrap_or_else(|| json!({})),
            };

            entries.push(entry);
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

        for log_type in &[LogType::Traffic, LogType::Threat, LogType::System, LogType::Security] {
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
        let stats = json!({
            "total_files": 0,
            "total_size": 0,
            "oldest_entry": null,
            "newest_entry": null,
            "entries_count": 0
        });
        
        let entries_iter = fs::read_dir(path)?;
        
        for entry in entries_iter {
            let entry = entry?;
            let file_path = entry.path();
            
            if file_path.is_dir() {
                let _sub_stats = Box::pin(self.get_type_statistics(&file_path)).await?;
                // Merge sub_stats into stats
            } else if file_path.is_file() {
                // Process file statistics
            }
        }
        
        Ok(stats)
    }

    /// Thêm exporter để gửi log đến SIEM/ELK/Splunk
    pub fn add_exporter(&mut self, exporter: Box<dyn LogExport + Send + Sync>) {
        Arc::get_mut(&mut self.log_exporter)
            .expect("LogExporter should be mutable")
            .add_exporter(exporter);
    }

    /// Lấy LogExporter để cấu hình
    pub fn get_exporter(&self) -> Arc<LogExporter> {
        self.log_exporter.clone()
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
        LogType::Security => "security".to_string(),
    }
}

impl LogMetadata {
    /// Tạo metadata cho sự kiện hệ thống
    pub fn system_event(
        event_name: &str,
        severity: &str,
        component: &str,
        category: &str,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::System,
            source_ip: Some("127.0.0.1".to_string()),
            destination_ip: None,
            user: Some("system".to_string()),
            action: Some(event_name.to_string()),
            severity: Some(severity.to_string()),
            component: Some(component.to_string()),
            category: Some(category.to_string()),
            event_name: Some(event_name.to_string()),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            ..Default::default()
        }
    }

    /// Tạo metadata cho sự kiện user authentication
    pub fn auth_event(
        user: &str,
        action: &str,
        source_ip: &str,
        success: bool,
        session_id: Option<&str>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::Security,
            source_ip: Some(source_ip.to_string()),
            destination_ip: None,
            user: Some(user.to_string()),
            action: Some(action.to_string()),
            severity: Some(if success { "info" } else { "warning" }.to_string()),
            component: Some("authentication".to_string()),
            category: Some("security".to_string()),
            subcategory: Some("authentication".to_string()),
            event_name: Some(format!("user_{}", action)),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            session_id: session_id.map(|s| s.to_string()),
            risk_score: Some(if success { 0.0 } else { 50.0 }),
            ..Default::default()
        }
    }

    /// Tạo metadata cho sự kiện policy change
    pub fn policy_event(
        user: &str,
        action: &str,
        policy_id: &str,
        policy_name: &str,
        policy_type: &str,
        source_ip: &str,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::Security,
            source_ip: Some(source_ip.to_string()),
            destination_ip: None,
            user: Some(user.to_string()),
            action: Some(action.to_string()),
            severity: Some("info".to_string()),
            component: Some("policy".to_string()),
            category: Some("security".to_string()),
            subcategory: Some("policy_management".to_string()),
            event_name: Some(format!("policy_{}", action)),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            policy_id: Some(policy_id.to_string()),
            policy_name: Some(policy_name.to_string()),
            policy_type: Some(policy_type.to_string()),
            risk_score: Some(10.0),
            ..Default::default()
        }
    }

    /// Tạo metadata cho sự kiện firewall rule
    pub fn rule_event(
        user: &str,
        action: &str,
        rule_id: &str,
        rule_name: &str,
        rule_action: &str,
        source_ip: &str,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::Security,
            source_ip: Some(source_ip.to_string()),
            destination_ip: None,
            user: Some(user.to_string()),
            action: Some(action.to_string()),
            severity: Some("info".to_string()),
            component: Some("firewall".to_string()),
            category: Some("security".to_string()),
            subcategory: Some("rule_management".to_string()),
            event_name: Some(format!("rule_{}", action)),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            rule_id: Some(rule_id.to_string()),
            rule_name: Some(rule_name.to_string()),
            rule_action: Some(rule_action.to_string()),
            risk_score: Some(5.0),
            ..Default::default()
        }
    }

    /// Tạo metadata cho sự kiện traffic
    pub fn traffic_event(
        source_ip: &str,
        destination_ip: &str,
        protocol: &str,
        port: u16,
        action: &str,
        bytes_sent: u64,
        bytes_received: u64,
        interface_name: Option<&str>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::Traffic,
            source_ip: Some(source_ip.to_string()),
            destination_ip: Some(destination_ip.to_string()),
            user: None,
            action: Some(action.to_string()),
            severity: Some("info".to_string()),
            component: Some("firewall".to_string()),
            category: Some("network".to_string()),
            subcategory: Some("traffic".to_string()),
            event_name: Some("traffic_flow".to_string()),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            protocol: Some(protocol.to_string()),
            port: Some(port),
            bytes_sent: Some(bytes_sent),
            bytes_received: Some(bytes_received),
            interface_name: interface_name.map(|s| s.to_string()),
            risk_score: Some(if action == "block" { 30.0 } else { 0.0 }),
            ..Default::default()
        }
    }

    /// Tạo metadata cho sự kiện threat
    pub fn threat_event(
        threat_type: &str,
        threat_name: &str,
        source_ip: &str,
        destination_ip: &str,
        severity: &str,
        threat_level: &str,
        malware_signature: Option<&str>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::Threat,
            source_ip: Some(source_ip.to_string()),
            destination_ip: Some(destination_ip.to_string()),
            user: None,
            action: Some("threat_detected".to_string()),
            severity: Some(severity.to_string()),
            component: Some("security".to_string()),
            category: Some("threat".to_string()),
            subcategory: Some(threat_type.to_string()),
            event_name: Some("threat_detection".to_string()),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            threat_level: Some(threat_level.to_string()),
            malware_name: Some(threat_name.to_string()),
            malware_type: Some(threat_type.to_string()),
            malware_signature: malware_signature.map(|s| s.to_string()),
            risk_score: Some(match severity {
                "critical" => 100.0,
                "high" => 80.0,
                "medium" => 60.0,
                "low" => 40.0,
                _ => 20.0,
            }),
            ..Default::default()
        }
    }

    /// Tạo metadata cho sự kiện error
    pub fn error_event(
        component: &str,
        error_message: &str,
        error_code: Option<&str>,
        source_ip: Option<&str>,
        user: Option<&str>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::System,
            source_ip: source_ip.map(|s| s.to_string()),
            destination_ip: None,
            user: user.map(|s| s.to_string()),
            action: Some("error".to_string()),
            severity: Some("error".to_string()),
            component: Some(component.to_string()),
            category: Some("system".to_string()),
            subcategory: Some("error".to_string()),
            event_name: Some("system_error".to_string()),
            event_source: Some("open-ngfw".to_string()),
            event_version: Some("1.0.0".to_string()),
            event_id: error_code.map(|s| s.to_string()),
            risk_score: Some(70.0),
            custom_fields: Some(json!({
                "error_message": error_message,
                "error_code": error_code
            })),
            ..Default::default()
        }
    }
}

impl Default for LogMetadata {
    fn default() -> Self {
        Self {
            timestamp: Utc::now(),
            log_type: LogType::System,
            source_ip: None,
            destination_ip: None,
            user: None,
            action: None,
            severity: None,
            session_id: None,
            request_id: None,
            correlation_id: None,
            component: None,
            category: None,
            subcategory: None,
            event_id: None,
            event_name: None,
            event_source: None,
            event_version: None,
            risk_score: None,
            threat_level: None,
            geo_location: None,
            user_agent: None,
            http_method: None,
            http_status: None,
            response_time: None,
            bytes_sent: None,
            bytes_received: None,
            protocol: None,
            port: None,
            application: None,
            device_id: None,
            device_type: None,
            device_vendor: None,
            device_model: None,
            device_serial: None,
            device_firmware: None,
            device_location: None,
            device_zone: None,
            policy_id: None,
            policy_name: None,
            policy_type: None,
            rule_id: None,
            rule_name: None,
            rule_action: None,
            interface_name: None,
            vlan_id: None,
            vpn_tunnel: None,
            ssl_cipher: None,
            ssl_version: None,
            certificate_subject: None,
            certificate_issuer: None,
            certificate_expiry: None,
            malware_name: None,
            malware_type: None,
            malware_signature: None,
            url: None,
            domain: None,
            file_name: None,
            file_hash: None,
            file_size: None,
            file_type: None,
            email_sender: None,
            email_recipient: None,
            email_subject: None,
            email_attachment: None,
            database_name: None,
            database_table: None,
            database_query: None,
            api_endpoint: None,
            api_version: None,
            api_key: None,
            cloud_provider: None,
            cloud_region: None,
            cloud_account: None,
            cloud_service: None,
            cloud_resource: None,
            container_id: None,
            container_name: None,
            container_image: None,
            kubernetes_pod: None,
            kubernetes_namespace: None,
            kubernetes_service: None,
            kubernetes_deployment: None,
            kubernetes_node: None,
            kubernetes_cluster: None,
            custom_fields: None,
        }
    }
} 