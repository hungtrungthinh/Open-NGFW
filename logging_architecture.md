# Open-NGFW Logging Architecture

## Overview

The Open-NGFW project implements a high-performance, MongoDB-like logging system that stores firewall logs on local disk with automatic rotation, compression, and indexing. This system provides fast write performance, efficient storage, and quick query capabilities for log analysis.

## Logging System Design

### 1. Storage Architecture

#### Log File Structure
```
/logs/
├── firewall/
│   ├── traffic/
│   │   ├── 2024/
│   │   │   ├── 01/
│   │   │   │   ├── traffic_2024-01-15_00.log.gz
│   │   │   │   ├── traffic_2024-01-15_01.log.gz
│   │   │   │   └── traffic_2024-01-15_02.log.gz
│   │   │   └── 02/
│   │   └── current/
│   │       └── traffic_current.log
│   ├── threats/
│   │   ├── 2024/
│   │   └── current/
│   └── system/
│       ├── 2024/
│       └── current/
├── indexes/
│   ├── traffic_by_ip/
│   ├── traffic_by_time/
│   └── threats_by_severity/
└── metadata/
    ├── log_stats.json
    └── rotation_config.json
```

#### File Format
- **Current logs**: JSON Lines format (one JSON object per line)
- **Archived logs**: Gzip compressed JSON Lines
- **Indexes**: Binary format for fast lookups
- **Metadata**: JSON configuration and statistics

### 2. Log Categories

#### Traffic Logs
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "log_type": "traffic",
  "src_ip": "192.168.1.100",
  "dst_ip": "8.8.8.8",
  "src_port": 12345,
  "dst_port": 53,
  "protocol": "udp",
  "action": "allow",
  "policy_id": 1,
  "bytes_sent": 512,
  "bytes_received": 1024,
  "packets_sent": 1,
  "packets_received": 1,
  "duration": 5,
  "user": "user1",
  "application": "dns",
  "threat_level": "low",
  "session_id": "sess_12345",
  "interface": "port2"
}
```

#### Threat Logs
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "log_type": "threat",
  "threat_type": "virus",
  "threat_name": "Trojan.Generic",
  "severity": "high",
  "src_ip": "192.168.1.100",
  "dst_ip": "203.0.113.50",
  "user": "user2",
  "action_taken": "blocked",
  "policy_id": 1,
  "signature_id": "TROJ_GEN_001",
  "category": "malware",
  "details": {
    "file_name": "suspicious.exe",
    "file_hash": "abc123...",
    "engine": "antivirus_v1"
  }
}
```

#### System Logs
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "log_type": "system",
  "level": "info",
  "facility": "system",
  "message": "Firewall policy updated",
  "source_ip": "192.168.1.1",
  "user": "admin",
  "session_id": "sess_12345",
  "component": "firewall",
  "operation": "policy_update"
}
```

### 3. Performance Optimizations

#### Write Performance
- **Buffered writes**: Batch multiple log entries before writing
- **Async I/O**: Non-blocking write operations
- **Memory-mapped files**: Fast append operations
- **Write-ahead logging**: Ensure data durability

#### Read Performance
- **Indexes**: B-tree indexes on frequently queried fields
- **Compression**: Gzip compression for archived logs
- **Caching**: In-memory cache for recent logs
- **Parallel processing**: Multi-threaded log analysis

#### Storage Efficiency
- **Automatic rotation**: Daily log file rotation
- **Compression**: Gzip compression for archived files
- **Retention policies**: Configurable log retention
- **Deduplication**: Remove duplicate log entries

### 4. Indexing Strategy

#### Primary Indexes
```rust
// Time-based index (for range queries)
Index {
    name: "time_index",
    fields: ["timestamp"],
    type: IndexType::BTree,
    unique: false
}

// IP-based index (for source/destination queries)
Index {
    name: "ip_index", 
    fields: ["src_ip", "dst_ip"],
    type: IndexType::BTree,
    unique: false
}

// Policy-based index (for policy analysis)
Index {
    name: "policy_index",
    fields: ["policy_id", "action"],
    type: IndexType::BTree,
    unique: false
}
```

#### Secondary Indexes
```rust
// User-based index
Index {
    name: "user_index",
    fields: ["user", "timestamp"],
    type: IndexType::BTree,
    unique: false
}

// Application-based index
Index {
    name: "app_index",
    fields: ["application", "protocol"],
    type: IndexType::BTree,
    unique: false
}

// Threat severity index
Index {
    name: "severity_index",
    fields: ["severity", "threat_type"],
    type: IndexType::BTree,
    unique: false
}
```

### 5. Log Rotation and Management

#### Rotation Strategy
- **Time-based rotation**: Daily log files
- **Size-based rotation**: Max file size (100MB)
- **Compression**: Automatic gzip compression
- **Cleanup**: Automatic deletion of old logs

#### Configuration
```json
{
  "rotation": {
    "interval": "daily",
    "max_file_size": "100MB",
    "max_files": 30,
    "compression": true,
    "compression_level": 6
  },
  "retention": {
    "traffic_logs": "90 days",
    "threat_logs": "365 days", 
    "system_logs": "180 days"
  },
  "performance": {
    "buffer_size": "64KB",
    "flush_interval": "5 seconds",
    "max_memory": "512MB"
  }
}
```

### 6. Query Interface

#### Query Language
```rust
// Simple queries
Query::new()
    .filter("src_ip", "192.168.1.100")
    .filter("action", "deny")
    .range("timestamp", start_time, end_time)
    .limit(1000)
    .sort("timestamp", SortOrder::Desc)

// Complex queries
Query::new()
    .filter("log_type", "threat")
    .filter("severity", "high")
    .aggregate("threat_type", AggregationType::Count)
    .group_by("src_ip")
    .having("count", ">", 10)
```

#### Query Optimization
- **Index selection**: Automatic index selection
- **Query planning**: Optimized query execution plans
- **Result caching**: Cache frequently requested results
- **Parallel execution**: Multi-threaded query processing

### 7. Monitoring and Maintenance

#### Health Monitoring
- **Disk space**: Monitor available storage
- **Write performance**: Track write latency
- **Read performance**: Monitor query response times
- **Index health**: Check index fragmentation

#### Maintenance Tasks
- **Index rebuilding**: Periodic index optimization
- **Log compaction**: Remove duplicate entries
- **Statistics update**: Update log statistics
- **Backup creation**: Regular log backups

### 8. Integration with Database

#### Hybrid Approach
- **Recent logs**: Stored in SQLite for fast access
- **Historical logs**: Stored in file-based system
- **Metadata**: Stored in SQLite for quick lookups
- **Indexes**: Maintained in both systems

#### Data Flow
```
Firewall Events → Log Buffer → File System → Compression → Archive
                ↓
            SQLite (recent)
                ↓
            Indexes (both)
```

### 9. Security Considerations

#### Data Protection
- **Encryption**: Encrypt sensitive log data
- **Access control**: Restrict log file access
- **Audit trails**: Log access to log files
- **Data sanitization**: Remove PII from logs

#### Compliance
- **Retention policies**: Meet regulatory requirements
- **Data integrity**: Ensure log authenticity
- **Access logging**: Track who accessed logs
- **Backup verification**: Verify backup integrity

### 10. Implementation Details

#### Rust Implementation
```rust
pub struct LogManager {
    config: LogConfig,
    writers: HashMap<LogType, LogWriter>,
    indexes: HashMap<String, Index>,
    buffer: LogBuffer,
}

pub struct LogWriter {
    file_path: PathBuf,
    buffer: Vec<u8>,
    compression: Compression,
    rotation: RotationPolicy,
}

pub struct LogQuery {
    filters: Vec<Filter>,
    aggregations: Vec<Aggregation>,
    sort: Option<Sort>,
    limit: Option<usize>,
}
```

#### Performance Metrics
- **Write throughput**: 10,000+ logs/second
- **Read latency**: < 10ms for indexed queries
- **Storage efficiency**: 80%+ compression ratio
- **Memory usage**: < 100MB for buffer

This logging architecture provides a robust, high-performance solution for firewall log management that combines the best aspects of MongoDB's document storage with the reliability and efficiency of local file systems. 