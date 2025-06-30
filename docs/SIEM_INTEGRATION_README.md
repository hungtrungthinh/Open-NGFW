# Open-NGFW SIEM Integration Guide

## Overview

Open-NGFW supports integration with popular SIEM (Security Information and Event Management) systems such as Elasticsearch, Splunk, Syslog, and custom webhooks. The logging system is designed according to international standards to ensure compatibility with all SIEM platforms.

## Key Features

### 1. International Standard Log Metadata
- **Timestamp**: ISO 8601 format
- **Event ID**: Unique event identifier
- **Severity**: Severity level (info, warning, error, critical)
- **Component**: System component
- **Category**: Event category
- **Risk Score**: Risk assessment score (0-100)
- **User**: User performing the action
- **Source/Destination IP**: Source/destination IP address
- **Protocol**: Network protocol
- **Port**: Network port
- **Bytes Sent/Received**: Data volume
- **Custom Fields**: Extensible fields

### 2. Event Types Logged

#### System Events
- Startup/Shutdown
- Configuration changes
- Service status changes
- Error events
- Performance metrics

#### Security Events
- User authentication (login/logout)
- Policy changes
- Rule modifications
- Access control violations
- Security alerts

#### Network Events
- Traffic flow
- Connection attempts
- Bandwidth usage
- Protocol violations
- Network scans

#### Threat Events
- Malware detection
- Intrusion attempts
- Suspicious activities
- Threat intelligence alerts
- Vulnerability scans

## SIEM Configuration

### 1. Configuration File

Create a `siem_config.json` file with your desired settings:

```json
{
  "elasticsearch": {
    "enabled": true,
    "url": "http://localhost:9200",
    "index": "open-ngfw-logs",
    "username": "elastic",
    "password": "your-password"
  },
  "splunk": {
    "enabled": false,
    "url": "http://localhost:8088",
    "token": "your-splunk-token",
    "source": "open-ngfw",
    "sourcetype": "json"
  },
  "syslog": {
    "enabled": false,
    "host": "localhost",
    "port": 514,
    "facility": 16,
    "severity": 6
  }
}
```

### 2. Run the Configuration Tool

```bash
cargo run --bin configure_siem
```

## SIEM System Integration

### Elasticsearch/ELK Stack

#### Elasticsearch Configuration
```json
{
  "elasticsearch": {
    "enabled": true,
    "url": "http://elasticsearch:9200",
    "index": "open-ngfw-logs",
    "username": "elastic",
    "password": "your-password"
  }
}
```

#### Kibana Dashboard
Create dashboards in Kibana with panels such as:
- Security Events Timeline
- Traffic Flow Analysis
- Threat Detection Summary
- User Activity Monitor
- System Performance Metrics

#### Logstash Pipeline (optional)
```ruby
input {
  http {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "open-ngfw" {
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    geoip {
      source => "source_ip"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "open-ngfw-logs-%{+YYYY.MM.dd}"
  }
}
```

### Splunk

#### Splunk Configuration
```json
{
  "splunk": {
    "enabled": true,
    "url": "http://splunk:8088",
    "token": "your-splunk-token",
    "source": "open-ngfw",
    "sourcetype": "json"
  }
}
```

#### Splunk App
Create a Splunk app with:
- Data models for security events
- Monitoring dashboards
- Threat detection alerts
- Compliance reports

### Syslog

#### Syslog Configuration
```json
{
  "syslog": {
    "enabled": true,
    "host": "syslog-server",
    "port": 514,
    "facility": 16,
    "severity": 6
  }
}
```

#### Rsyslog Configuration
```
# /etc/rsyslog.d/open-ngfw.conf
local0.* /var/log/open-ngfw.log
local0.* @remote-syslog-server:514
```

### Webhook Integration

#### Webhook Configuration
```json
{
  "webhook": {
    "enabled": true,
    "url": "https://your-webhook-endpoint.com/logs",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer your-token",
      "X-API-Key": "your-api-key"
    }
  }
}
```

## API Endpoints

### Query Logs
```bash
# Get all logs
curl "http://localhost:3000/api/logs"

# Filter by time range
curl "http://localhost:3000/api/logs?from=2025-01-01T00:00:00Z&to=2025-01-02T00:00:00Z"

# Filter by log type
curl "http://localhost:3000/api/logs?type=security"

# Filter by source IP
curl "http://localhost:3000/api/logs?source_ip=192.168.1.1"

# Pagination
curl "http://localhost:3000/api/logs?limit=100&offset=0"
```

### Log Statistics
```bash
curl "http://localhost:3000/api/logs/statistics"
```

## Monitoring and Alerting

### 1. Elasticsearch Alerts
```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "search_type": "query_then_fetch",
        "indices": ["open-ngfw-logs"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {"match": {"severity": "critical"}},
                {"range": {"@timestamp": {"gte": "now-5m"}}}
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {"gt": 0}
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": ["admin@company.com"],
        "subject": "Critical Security Alert",
        "body": "Critical security events detected"
      }
    }
  }
}
```

### 2. Splunk Alerts
```spl
| search index="open-ngfw-logs" severity="critical"
| stats count by source_ip
| where count > 10
```

### 3. Custom Webhook Alerts
```python
import requests
import json

def send_alert(log_entry):
    webhook_url = "https://your-alert-endpoint.com"
    payload = {
        "alert_type": "security",
        "severity": log_entry["severity"],
        "message": log_entry["message"],
        "source_ip": log_entry["source_ip"],
        "timestamp": log_entry["timestamp"]
    }
    
    response = requests.post(webhook_url, json=payload)
    return response.status_code == 200
```

## Performance and Scalability

### 1. Log Rotation
- **Daily rotation**: Default
- **Size-based rotation**: 100MB per file
- **Compression**: Gzip compression
- **Retention**: Configurable retention periods

### 2. Batch Processing
- **Batch size**: 100 logs per batch
- **Flush interval**: 5 seconds
- **Memory limit**: 100MB buffer

### 3. Error Handling
- **Retry mechanism**: 3 retries with exponential backoff
- **Circuit breaker**: Prevents cascade failures
- **Dead letter queue**: Failed logs stored for manual processing

## Security Considerations

### 1. Authentication
- **API Keys**: For webhook integration
- **Basic Auth**: For Elasticsearch
- **Token-based**: For Splunk

### 2. Encryption
- **TLS/SSL**: For all external communications
- **Log encryption**: Optional field-level encryption
- **Key management**: Secure key storage

### 3. Data Privacy
- **PII masking**: Automatic masking of sensitive data
- **Data retention**: Configurable retention policies
- **Access control**: Role-based access to logs

## Troubleshooting

### 1. Common Issues

#### Logs not appearing in SIEM
```bash
# Check log files
ls -la logs/

# Check API response
curl "http://localhost:3000/api/logs"

# Check exporter status
cargo run --bin configure_siem
```

#### High memory usage
```bash
# Check log file sizes
du -sh logs/*

# Check rotation settings
cat siem_config.json | jq '.general'
```

#### Network connectivity issues
```bash
# Test Elasticsearch connectivity
curl "http://localhost:9200/_cluster/health"

# Test Splunk connectivity
curl "http://localhost:8088/services/collector"
```

### 2. Debug Mode
```bash
# Enable debug logging
RUST_LOG=debug cargo run
```

### 3. Performance Monitoring
```bash
# Monitor log generation rate
watch -n 1 'wc -l logs/*/*.log'

# Monitor API response times
curl -w "@curl-format.txt" "http://localhost:3000/api/logs"
```

## Best Practices

### 1. Log Management
- **Structured logging**: Use JSON format consistently
- **Log levels**: Use appropriate severity levels
- **Context**: Include relevant metadata
- **Sampling**: For high-volume traffic logs

### 2. SIEM Configuration
- **Index optimization**: Use appropriate index patterns
- **Field mapping**: Map custom fields correctly
- **Alert tuning**: Avoid alert fatigue
- **Dashboard design**: Focus on actionable insights

### 3. Security
- **Access control**: Limit access to sensitive logs
- **Audit trail**: Log all administrative actions
- **Data retention**: Follow compliance requirements
- **Backup strategy**: Regular backup of log data

## Compliance and Standards

### 1. Standards Compliance
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card industry security
- **SOX**: Sarbanes-Oxley compliance
- **GDPR**: Data protection regulation

### 2. Log Formats
- **CEF**: Common Event Format
- **LEEF**: Log Event Extended Format
- **JSON**: Standard JSON format
- **Syslog**: RFC 3164/5424 compliant

### 3. Audit Requirements
- **User activity**: All user actions logged
- **System changes**: Configuration modifications
- **Security events**: Threat detection and response
- **Performance metrics**: System health monitoring

## Support and Documentation

### 1. API Documentation
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI Spec**: http://localhost:3000/api/openapi.json

### 2. Logging Documentation
- **Log Format**: Detailed log field descriptions
- **Event Types**: Complete list of event types
- **Metadata Fields**: All available metadata fields

### 3. Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community discussions and help
- **Documentation**: Wiki and guides

---

**Note**: Always update your configuration and verify connectivity before deploying to production. 