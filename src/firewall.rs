use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tokio::sync::RwLock;
use crate::models::{FirewallRule, FirewallStatus, FirewallStatistics, CreateRuleRequest};
use tracing::{info, warn};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use crate::logging::{LogManager, LogType, LogMetadata};

/// Main firewall implementation with rule management and packet processing
pub struct Firewall {
    rules: Arc<RwLock<HashMap<String, FirewallRule>>>,
    statistics: Arc<Mutex<FirewallStatistics>>,
    start_time: Instant,
    enabled: Arc<RwLock<bool>>,
    log_manager: Option<Arc<LogManager>>,
}

impl Firewall {
    /// Create a new firewall instance with default rules
    pub async fn new() -> Self {
        let mut firewall = Self {
            rules: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(Mutex::new(FirewallStatistics {
                total_packets_processed: 0,
                packets_allowed: 0,
                packets_blocked: 0,
                packets_dropped: 0,
                connections_tracked: 0,
                memory_usage: 0,
                cpu_usage: 0.0,
            })),
            start_time: Instant::now(),
            enabled: Arc::new(RwLock::new(true)),
            log_manager: None,
        };

        // Add default rules for basic security
        firewall.add_default_rules().await;
        
        info!("Firewall initialized with default rules");
        firewall
    }

    /// Add default firewall rules for basic network security
    async fn add_default_rules(&mut self) {
        let default_rules = vec![
            CreateRuleRequest {
                name: "Allow localhost".to_string(),
                action: crate::models::RuleAction::Allow,
                protocol: crate::models::Protocol::Any,
                source_ip: Some("127.0.0.1".to_string()),
                destination_ip: None,
                source_port: None,
                destination_port: None,
                direction: crate::models::Direction::Both,
            },
            CreateRuleRequest {
                name: "Allow established connections".to_string(),
                action: crate::models::RuleAction::Allow,
                protocol: crate::models::Protocol::Any,
                source_ip: None,
                destination_ip: None,
                source_port: None,
                destination_port: None,
                direction: crate::models::Direction::Both,
            },
            CreateRuleRequest {
                name: "Block invalid packets".to_string(),
                action: crate::models::RuleAction::Drop,
                protocol: crate::models::Protocol::Any,
                source_ip: None,
                destination_ip: None,
                source_port: None,
                destination_port: None,
                direction: crate::models::Direction::Inbound,
            },
        ];

        for rule_request in default_rules {
            let rule = FirewallRule::new(rule_request);
            self.add_rule(rule).await;
        }
    }

    /// Add a new firewall rule
    pub async fn add_rule(&mut self, rule: FirewallRule) {
        let mut rules = self.rules.write().await;
        rules.insert(rule.id.clone(), rule.clone());
        info!("Added firewall rule: {}", rule.name);

        // Log the rule addition
        if let Some(log_manager) = &self.log_manager {
            let metadata = LogMetadata {
                source: "firewall".to_string(),
                component: "rule_management".to_string(),
                session_id: None,
                user: Some("admin".to_string()),
                ip_address: Some("127.0.0.1".to_string()),
            };

            let log_data = serde_json::json!({
                "operation": "add_rule",
                "rule_id": rule.id,
                "rule_name": rule.name,
                "action": format!("{:?}", rule.action),
                "protocol": format!("{:?}", rule.protocol),
                "source_ip": rule.source_ip,
                "destination_ip": rule.destination_ip,
                "enabled": rule.enabled
            });

            log_manager.log(LogType::System, log_data, metadata).await;
        }
    }

    /// Remove a firewall rule by ID
    pub async fn remove_rule(&mut self, rule_id: &str) -> bool {
        let mut rules = self.rules.write().await;
        if let Some(rule) = rules.remove(rule_id) {
            info!("Removed firewall rule: {}", rule.name);

            // Log the rule removal
            if let Some(log_manager) = &self.log_manager {
                let metadata = LogMetadata {
                    source: "firewall".to_string(),
                    component: "rule_management".to_string(),
                    session_id: None,
                    user: Some("admin".to_string()),
                    ip_address: Some("127.0.0.1".to_string()),
                };

                let log_data = serde_json::json!({
                    "operation": "remove_rule",
                    "rule_id": rule_id,
                    "success": true
                });

                log_manager.log(LogType::System, log_data, metadata).await;
            }

            true
        } else {
            warn!("Attempted to remove non-existent rule: {}", rule_id);
            false
        }
    }

    /// Get all firewall rules
    pub async fn get_rules(&self) -> Vec<FirewallRule> {
        let rules = self.rules.read().await;
        rules.values().cloned().collect()
    }

    /// Get a specific firewall rule by ID
    pub async fn get_rule(&self, rule_id: &str) -> Option<FirewallRule> {
        let rules = self.rules.read().await;
        rules.get(rule_id).cloned()
    }

    /// Toggle the enabled state of a firewall rule
    pub async fn toggle_rule(&mut self, rule_id: &str) -> bool {
        let mut rules = self.rules.write().await;
        if let Some(rule) = rules.get_mut(rule_id) {
            rule.enabled = !rule.enabled;
            rule.updated_at = chrono::Utc::now();
            info!("Toggled rule {} to {}", rule.name, if rule.enabled { "enabled" } else { "disabled" });

            // Log the rule toggle
            if let Some(log_manager) = &self.log_manager {
                let metadata = LogMetadata {
                    source: "firewall".to_string(),
                    component: "rule_management".to_string(),
                    session_id: None,
                    user: Some("admin".to_string()),
                    ip_address: Some("127.0.0.1".to_string()),
                };

                let log_data = serde_json::json!({
                    "operation": "toggle_rule",
                    "rule_id": rule_id,
                    "rule_name": rule.name,
                    "new_status": rule.enabled,
                    "success": true
                });

                log_manager.log(LogType::System, log_data, metadata).await;
            }

            true
        } else {
            false
        }
    }

    /// Get current firewall status and statistics
    pub async fn get_status(&self) -> FirewallStatus {
        let rules = self.rules.read().await;
        let active_rules = rules.values().filter(|r| r.enabled).count();
        let total_rules = rules.len();
        
        let stats = self.statistics.lock().unwrap();
        
        FirewallStatus {
            enabled: *self.enabled.read().await,
            active_rules,
            total_rules,
            blocked_connections: stats.packets_blocked,
            allowed_connections: stats.packets_allowed,
            uptime: self.start_time.elapsed().as_secs(),
        }
    }

    /// Get detailed firewall statistics
    pub async fn get_statistics(&self) -> FirewallStatistics {
        self.statistics.lock().unwrap().clone()
    }

    /// Process a network packet and determine action based on rules
    pub async fn process_packet(&mut self, packet_info: PacketInfo) -> PacketDecision {
        if !*self.enabled.read().await {
            return PacketDecision::Allow;
        }

        let mut stats = self.statistics.lock().unwrap();
        stats.total_packets_processed += 1;

        let rules = self.rules.read().await;
        
        for rule in rules.values() {
            if !rule.enabled {
                continue;
            }

            if self.matches_rule(&packet_info, rule) {
                match rule.action {
                    crate::models::RuleAction::Allow => {
                        stats.packets_allowed += 1;
                        return PacketDecision::Allow;
                    }
                    crate::models::RuleAction::Deny => {
                        stats.packets_blocked += 1;
                        return PacketDecision::Deny;
                    }
                    crate::models::RuleAction::Drop => {
                        stats.packets_dropped += 1;
                        return PacketDecision::Drop;
                    }
                }
            }
        }

        // Default policy: deny unknown traffic
        stats.packets_blocked += 1;
        PacketDecision::Deny
    }

    /// Check if a packet matches a specific rule
    fn matches_rule(&self, packet: &PacketInfo, rule: &FirewallRule) -> bool {
        // Check protocol match
        if !self.matches_protocol(&packet.protocol, &rule.protocol) {
            return false;
        }

        // Check source IP match
        if let Some(ref rule_source) = rule.source_ip {
            if packet.source_ip != *rule_source {
                return false;
            }
        }

        // Check destination IP match
        if let Some(ref rule_dest) = rule.destination_ip {
            if packet.destination_ip != *rule_dest {
                return false;
            }
        }

        // Check source port match
        if let Some(rule_source_port) = rule.source_port {
            if packet.source_port != rule_source_port {
                return false;
            }
        }

        // Check destination port match
        if let Some(rule_dest_port) = rule.destination_port {
            if packet.destination_port != rule_dest_port {
                return false;
            }
        }

        // Check direction match
        if !self.matches_direction(&packet.direction, &rule.direction) {
            return false;
        }

        true
    }

    /// Check if packet protocol matches rule protocol
    fn matches_protocol(&self, packet_protocol: &Protocol, rule_protocol: &crate::models::Protocol) -> bool {
        match rule_protocol {
            crate::models::Protocol::Any => true,
            crate::models::Protocol::TCP => matches!(packet_protocol, Protocol::TCP),
            crate::models::Protocol::UDP => matches!(packet_protocol, Protocol::UDP),
            crate::models::Protocol::ICMP => matches!(packet_protocol, Protocol::ICMP),
        }
    }

    /// Check if packet direction matches rule direction
    fn matches_direction(&self, packet_direction: &Direction, rule_direction: &crate::models::Direction) -> bool {
        match rule_direction {
            crate::models::Direction::Both => true,
            crate::models::Direction::Inbound => matches!(packet_direction, Direction::Inbound),
            crate::models::Direction::Outbound => matches!(packet_direction, Direction::Outbound),
        }
    }

    /// Enable the firewall
    pub async fn enable(&mut self) {
        *self.enabled.write().await = true;
        info!("Firewall enabled");

        // Log the firewall enable
        if let Some(log_manager) = &self.log_manager {
            let metadata = LogMetadata {
                source: "firewall".to_string(),
                component: "system".to_string(),
                session_id: None,
                user: Some("admin".to_string()),
                ip_address: Some("127.0.0.1".to_string()),
            };

            let log_data = serde_json::json!({
                "operation": "enable_firewall",
                "status": "enabled",
                "timestamp": chrono::Utc::now().to_rfc3339()
            });

            log_manager.log(LogType::System, log_data, metadata).await;
        }
    }

    /// Disable the firewall
    pub async fn disable(&mut self) {
        *self.enabled.write().await = false;
        info!("Firewall disabled");

        // Log the firewall disable
        if let Some(log_manager) = &self.log_manager {
            let metadata = LogMetadata {
                source: "firewall".to_string(),
                component: "system".to_string(),
                session_id: None,
                user: Some("admin".to_string()),
                ip_address: Some("127.0.0.1".to_string()),
            };

            let log_data = serde_json::json!({
                "operation": "disable_firewall",
                "status": "disabled",
                "timestamp": chrono::Utc::now().to_rfc3339()
            });

            log_manager.log(LogType::System, log_data, metadata).await;
        }
    }

    pub fn set_log_manager(&mut self, log_manager: Arc<LogManager>) {
        self.log_manager = Some(log_manager);
    }
}

/// Network packet information for processing
#[derive(Debug, Clone)]
pub struct PacketInfo {
    pub protocol: Protocol,
    pub source_ip: String,
    pub destination_ip: String,
    pub source_port: u16,
    pub destination_port: u16,
    pub direction: Direction,
}

/// Network protocols supported by the firewall
#[derive(Debug, Clone)]
pub enum Protocol {
    TCP,
    UDP,
    ICMP,
}

/// Packet direction (inbound/outbound)
#[derive(Debug, Clone)]
pub enum Direction {
    Inbound,
    Outbound,
}

/// Firewall decision for a processed packet
#[derive(Debug, Clone)]
pub enum PacketDecision {
    Allow,
    Deny,
    Drop,
} 