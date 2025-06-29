use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Firewall rule definition with all necessary parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallRule {
    pub id: String,
    pub name: String,
    pub action: RuleAction,
    pub protocol: Protocol,
    pub source_ip: Option<String>,
    pub destination_ip: Option<String>,
    pub source_port: Option<u16>,
    pub destination_port: Option<u16>,
    pub direction: Direction,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Actions that can be taken on matching packets
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleAction {
    Allow,
    Deny,
    Drop,
}

/// Network protocols supported by firewall rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    TCP,
    UDP,
    ICMP,
    Any,
}

/// Packet direction for rule matching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Direction {
    Inbound,
    Outbound,
    Both,
}

/// Request structure for creating new firewall rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRuleRequest {
    pub name: String,
    pub action: RuleAction,
    pub protocol: Protocol,
    pub source_ip: Option<String>,
    pub destination_ip: Option<String>,
    pub source_port: Option<u16>,
    pub destination_port: Option<u16>,
    pub direction: Direction,
}

/// Current firewall status and basic statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallStatus {
    pub enabled: bool,
    pub active_rules: usize,
    pub total_rules: usize,
    pub blocked_connections: u64,
    pub allowed_connections: u64,
    pub uptime: u64,
}

/// Detailed firewall statistics and performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallStatistics {
    pub total_packets_processed: u64,
    pub packets_allowed: u64,
    pub packets_blocked: u64,
    pub packets_dropped: u64,
    pub connections_tracked: u64,
    pub memory_usage: u64,
    pub cpu_usage: f64,
}

impl FirewallRule {
    /// Create a new firewall rule from a request
    pub fn new(request: CreateRuleRequest) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: request.name,
            action: request.action,
            protocol: request.protocol,
            source_ip: request.source_ip,
            destination_ip: request.destination_ip,
            source_port: request.source_port,
            destination_port: request.destination_port,
            direction: request.direction,
            enabled: true,
            created_at: now,
            updated_at: now,
        }
    }
} 