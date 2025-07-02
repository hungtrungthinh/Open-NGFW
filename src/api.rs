use axum::{
    extract::{Path, State, Query},
    http::StatusCode,
    response::{Html, Json},
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::firewall::Firewall;
use crate::network::NetworkManager;
use crate::logging::{LogManager, Filter, LogType, LogMetadata};
use crate::models::{FirewallRule, CreateRuleRequest, FirewallStatus, FirewallStatistics, DashboardStatus, SecurityTopology, NetworkInterface, StaticRoute, FirewallPolicy, AntivirusProfile, Administrator, TrafficLog, RoutingMonitor, WifiSsid, RuleAction, Protocol, Direction, LogEntry, NatRule, NatType};
use crate::firewall_db::{open_default_db};
use chrono::{DateTime, Utc};
use crate::network_db::{open_default_network_db};
use crate::models::{AddressingMode};
use crate::network::get_physical_ports;
use serde::Deserialize;
use std::collections::HashMap;
use axum::body::Body;
use axum::middleware::Next;
use axum::http::Request;
use axum::response::Response;
use axum::response::IntoResponse;
use std::fs;
use std::path::Path;

// Type alias for the application state
pub type AppState = (Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>, Arc<LogManager>);

/// Get all firewall rules from SQLCipher database
#[axum::debug_handler]
pub async fn get_rules(
    State((_firewall, _network_manager, _log_manager)): State<AppState>,
) -> Result<Json<Vec<FirewallRule>>, (StatusCode, Json<serde_json::Value>)> {
    match open_default_db() {
        Ok(db) => {
            match db.get_rules() {
                Ok(rules) => {
                    // Convert FirewallDB::FirewallRule to models::FirewallRule
                    let converted_rules: Vec<FirewallRule> = rules.into_iter().map(|db_rule| {
                        FirewallRule {
                            id: db_rule.id.to_string(),
                            name: db_rule.name,
                            action: match db_rule.action.as_str() {
                                "ACCEPT" | "Allow" => RuleAction::Allow,
                                "DENY" | "Deny" => RuleAction::Deny,
                                "DROP" | "Drop" => RuleAction::Drop,
                                _ => RuleAction::Drop,
                            },
                            protocol: match db_rule.protocol.as_deref() {
                                Some("TCP") => Protocol::TCP,
                                Some("UDP") => Protocol::UDP,
                                Some("ICMP") => Protocol::ICMP,
                                _ => Protocol::Any,
                            },
                            source_ip: db_rule.src_ip,
                            destination_ip: db_rule.dst_ip,
                            source_port: db_rule.src_port.map(|p| p as u16),
                            destination_port: db_rule.dst_port.map(|p| p as u16),
                            direction: Direction::Both, // Default to Both
                            enabled: db_rule.enabled,
                            created_at: DateTime::parse_from_rfc3339(&db_rule.created_at)
                                .unwrap_or_else(|_| Utc::now().into())
                                .with_timezone(&Utc),
                            updated_at: DateTime::parse_from_rfc3339(&db_rule.updated_at)
                                .unwrap_or_else(|_| Utc::now().into())
                                .with_timezone(&Utc),
                        }
                    }).collect();
                    Ok(Json(converted_rules))
                },
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" }))))
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Add a new firewall rule
#[axum::debug_handler]
pub async fn add_rule(
    State((firewall, network_manager, log_manager)): State<AppState>,
    Json(rule_data): Json<CreateRuleRequest>,
) -> Result<(StatusCode, Json<FirewallRule>), (StatusCode, Json<serde_json::Value>)> {
    let db = open_default_db().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) })))
    })?;

    // Convert CreateRuleRequest to FirewallDB::FirewallRule
    let db_rule = crate::firewall_db::FirewallRule {
        id: 0, // Will be set by database
        name: rule_data.name.clone(),
        src_ip: rule_data.source_ip.clone(),
        dst_ip: rule_data.destination_ip.clone(),
        src_port: rule_data.source_port.map(|p| p as i64),
        dst_port: rule_data.destination_port.map(|p| p as i64),
        protocol: Some(match rule_data.protocol {
            Protocol::TCP => "TCP".to_string(),
            Protocol::UDP => "UDP".to_string(),
            Protocol::ICMP => "ICMP".to_string(),
            Protocol::Any => "ANY".to_string(),
        }),
        action: match rule_data.action {
            RuleAction::Allow => "ACCEPT".to_string(),
            RuleAction::Deny => "DENY".to_string(),
            RuleAction::Drop => "DROP".to_string(),
        },
        enabled: true, // Default to enabled
        created_at: String::new(), // Will be set by database
        updated_at: String::new(), // Will be set by database
    };

    // Create rule in database
    let rule_id = db.add_rule(&db_rule).map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Failed to add rule: {}", e) })))
    })?;

    // Get the created rule
    match db.get_rules() {
        Ok(rules) => {
            if let Some(created_rule) = rules.into_iter().find(|r| r.id == rule_id) {
                let converted_rule = FirewallRule {
                    id: created_rule.id.to_string(),
                    name: created_rule.name.clone(),
                    action: match created_rule.action.as_str() {
                        "ACCEPT" | "Allow" => RuleAction::Allow,
                        "DENY" | "Deny" => RuleAction::Deny,
                        "DROP" | "Drop" => RuleAction::Drop,
                        _ => RuleAction::Drop,
                    },
                    protocol: match created_rule.protocol.as_deref() {
                        Some("TCP") => Protocol::TCP,
                        Some("UDP") => Protocol::UDP,
                        Some("ICMP") => Protocol::ICMP,
                        _ => Protocol::Any,
                    },
                    source_ip: created_rule.src_ip.clone(),
                    destination_ip: created_rule.dst_ip.clone(),
                    source_port: created_rule.src_port.map(|p| p as u16),
                    destination_port: created_rule.dst_port.map(|p| p as u16),
                    direction: Direction::Both, // Default to Both
                    enabled: created_rule.enabled,
                    created_at: DateTime::parse_from_rfc3339(&created_rule.created_at)
                        .unwrap_or_else(|_| Utc::now().into())
                        .with_timezone(&Utc),
                    updated_at: DateTime::parse_from_rfc3339(&created_rule.updated_at)
                        .unwrap_or_else(|_| Utc::now().into())
                        .with_timezone(&Utc),
                };

                // Log rule creation
                let metadata = LogMetadata::rule_event(
                    "admin",
                    "create",
                    &rule_id.to_string(),
                    &rule_data.name,
                    &format!("{:?}", rule_data.action),
                    "127.0.0.1"
                );
                let log_data = json!({
                    "event": "rule_created",
                    "rule_id": rule_id,
                    "rule_name": rule_data.name,
                    "rule_action": rule_data.action,
                    "source_ip": rule_data.source_ip,
                    "destination_ip": rule_data.destination_ip,
                    "protocol": rule_data.protocol,
                    "source_port": rule_data.source_port,
                    "destination_port": rule_data.destination_port
                });
                let _ = log_manager.log_system(metadata, log_data).await;

                Ok((StatusCode::CREATED, Json(converted_rule)))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to retrieve created rule" }))))
            }
        },
        Err(e) => {
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("Database error: {}", e) }))))
        }
    }
}

/// Delete a firewall rule from SQLCipher database
#[axum::debug_handler]
pub async fn delete_rule(
    State((_firewall, _network_manager, _log_manager)): State<AppState>,
    Path(rule_id): Path<String>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    match open_default_db() {
        Ok(db) => {
            match rule_id.parse::<i64>() {
                Ok(id) => {
                    match db.delete_rule(id) {
                        Ok(_) => {
                            Ok((StatusCode::OK, Json(json!({ "message": "Rule deleted successfully" }))))
                        },
                        Err(e) => {
                            eprintln!("Failed to delete rule: {}", e);
                            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to delete rule" }))))
                        }
                    }
                },
                Err(_) => Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid rule ID" }))))
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Toggle a firewall rule's enabled state in SQLCipher database
#[axum::debug_handler]
pub async fn toggle_rule(
    State((_firewall, _network_manager, _log_manager)): State<AppState>,
    Path(rule_id): Path<String>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    match open_default_db() {
        Ok(db) => {
            match rule_id.parse::<i64>() {
                Ok(id) => {
                    // First get current state
                    match db.get_rules() {
                        Ok(rules) => {
                            if let Some(rule) = rules.into_iter().find(|r| r.id == id) {
                                let new_enabled = !rule.enabled;
                                match db.toggle_rule(id, new_enabled) {
                                    Ok(_) => {
                                        let status = if new_enabled { "enabled" } else { "disabled" };
                                        Ok((StatusCode::OK, Json(json!({ "message": format!("Rule {} successfully", status), "enabled": new_enabled }))))
                                    },
                                    Err(e) => {
                                        eprintln!("Failed to toggle rule: {}", e);
                                        Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to toggle rule" }))))
                                    }
                                }
                            } else {
                                Err((StatusCode::NOT_FOUND, Json(json!({ "error": "Rule not found" }))))
                            }
                        },
                        Err(e) => {
                            eprintln!("Database error: {}", e);
                            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" }))))
                        }
                    }
                },
                Err(_) => Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid rule ID" }))))
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Get firewall status
#[axum::debug_handler]
pub async fn get_status(
    State((firewall, _network_manager, _log_manager)): State<AppState>,
) -> Json<FirewallStatus> {
    let firewall = firewall.read().await;
    let status = firewall.get_status().await;
    Json(status)
}

/// Get firewall statistics
#[axum::debug_handler]
pub async fn get_statistics(
    State((firewall, _network_manager, _log_manager)): State<AppState>,
) -> Json<FirewallStatistics> {
    let firewall = firewall.read().await;
    let stats = firewall.get_statistics().await;
    Json(stats)
}

/// Toggle firewall enabled/disabled state
#[axum::debug_handler]
pub async fn toggle_firewall(
    State((firewall, _network_manager, _log_manager)): State<AppState>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut firewall = firewall.write().await;
    let current_status = firewall.get_status().await;
    if current_status.enabled {
        firewall.disable().await;
        (StatusCode::OK, Json(json!({ "message": "Firewall disabled", "status": "disabled" })))
    } else {
        firewall.enable().await;
        (StatusCode::OK, Json(json!({ "message": "Firewall enabled", "status": "enabled" })))
    }
}

// --- Dashboard ---
pub async fn dashboard_status() -> Json<DashboardStatus> {
    Json(DashboardStatus {
        system_health: "Healthy".to_string(),
        resource_usage: "Low".to_string(),
        uptime: "24h 12m".to_string(),
        wan_ip: "192.168.1.1".to_string(),
    })
}

// --- Security Entry ---
pub async fn security_topology() -> Json<SecurityTopology> {
    Json(SecurityTopology {
        nodes: vec!["Gateway".to_string(), "Switch".to_string(), "AP".to_string()],
        links: vec![("Gateway".to_string(), "Switch".to_string())],
    })
}

// --- Network ---
pub async fn network_interfaces() -> Json<Vec<NetworkInterface>> {
    Json(vec![
        NetworkInterface {
            id: 1,
            name: "eth0".to_string(),
            alias: Some("WAN".to_string()),
            interface_type: "ethernet".to_string(),
            vrf_id: None,
            role: Some("WAN".to_string()),
            bandwidth_up: Some(1000),
            bandwidth_down: Some(1000),
            addressing_mode: AddressingMode::DHCP,
            status: Some("up".to_string()),
            manual_ip: None,
            manual_netmask: None,
            manual_gateway: None,
            manual_dns: None,
            dhcp_ip: Some("192.168.1.2".to_string()),
            dhcp_netmask: Some("255.255.255.0".to_string()),
            dhcp_gateway: Some("192.168.1.1".to_string()),
            dhcp_dns: Some("8.8.8.8".to_string()),
            pppoe_username: None,
            pppoe_password: None,
            pppoe_ip: None,
            pppoe_netmask: None,
            pppoe_gateway: None,
            pppoe_dns: None,
            last_renewed: None,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
        NetworkInterface {
            id: 2,
            name: "eth1".to_string(),
            alias: Some("LAN".to_string()),
            interface_type: "ethernet".to_string(),
            vrf_id: None,
            role: Some("LAN".to_string()),
            bandwidth_up: Some(1000),
            bandwidth_down: Some(1000),
            addressing_mode: AddressingMode::Manual,
            status: Some("up".to_string()),
            manual_ip: Some("10.0.0.1".to_string()),
            manual_netmask: Some("255.255.255.0".to_string()),
            manual_gateway: None,
            manual_dns: None,
            dhcp_ip: None,
            dhcp_netmask: None,
            dhcp_gateway: None,
            dhcp_dns: None,
            pppoe_username: None,
            pppoe_password: None,
            pppoe_ip: None,
            pppoe_netmask: None,
            pppoe_gateway: None,
            pppoe_dns: None,
            last_renewed: None,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
    ])
}

pub async fn static_routes() -> Json<Vec<StaticRoute>> {
    Json(vec![
        StaticRoute { destination: "0.0.0.0/0".to_string(), gateway: "192.168.1.1".to_string(), metric: 10 },
    ])
}

// --- Policy & Objects ---
pub async fn firewall_policies() -> Json<Vec<FirewallPolicy>> {
    Json(vec![
        FirewallPolicy { 
            id: 1,
            policy_id: 1,
            name: "Allow LAN".to_string(), 
            src_zone_id: Some(2),
            dst_zone_id: Some(1),
            src_address: Some(vec!["10.0.0.0/24".to_string()]),
            dst_address: Some(vec!["any".to_string()]),
            service: Some(vec!["any".to_string()]),
            action: "allow".to_string(),
            status: "enabled".to_string(),
            log_traffic: true,
            schedule_id: None,
            nat_enabled: true,
            nat_type: Some("source".to_string()),
            comments: Some("Allow LAN to WAN traffic".to_string()),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
    ])
}

// --- Security Profiles ---
pub async fn antivirus_profiles() -> Json<Vec<AntivirusProfile>> {
    Json(vec![
        AntivirusProfile { 
            id: 1,
            name: "Default AV".to_string(), 
            status: "enabled".to_string(),
            scan_mode: "proxy".to_string(),
            quarantine: true,
            action: "block".to_string(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
    ])
}

// --- VPN ---
pub async fn ipsec_tunnels() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "id": "vpn1",
            "name": "Branch Tunnel",
            "status": "up"
        }),
    ])
}

// --- System ---
pub async fn administrators() -> Json<Vec<Administrator>> {
    Json(vec![
        Administrator { 
            id: 1,
            username: "admin".to_string(), 
            password_hash: "hashed_password".to_string(),
            full_name: Some("System Administrator".to_string()),
            email: Some("admin@open-ngfw.local".to_string()),
            role: "super_admin".to_string(), 
            status: "active".to_string(),
            last_login: Some(chrono::Utc::now()),
            login_attempts: 0,
            password_changed_at: chrono::Utc::now(),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
    ])
}

// --- Log & Report ---
pub async fn local_traffic_logs() -> Json<Vec<TrafficLog>> {
    Json(vec![
        TrafficLog { 
            id: 1,
            timestamp: chrono::Utc::now(),
            src_ip: "192.168.1.10".to_string(), 
            dst_ip: "8.8.8.8".to_string(),
            src_port: Some(54321),
            dst_port: Some(53),
            protocol: "udp".to_string(),
            action: "allow".to_string(),
            policy_id: Some(1),
            bytes_sent: Some(64),
            bytes_received: Some(64),
            packets_sent: Some(1),
            packets_received: Some(1),
            duration: Some(0),
            user: None,
            application: Some("DNS".to_string()),
            threat_level: None,
        },
    ])
}

// --- Monitor ---
pub async fn routing_monitors() -> Json<Vec<RoutingMonitor>> {
    Json(vec![
        RoutingMonitor { route: "0.0.0.0/0 via 192.168.1.1".to_string(), status: "ok".to_string() },
    ])
}

// --- Wi-Fi & Switch Controller ---
pub async fn wifi_ssids() -> Json<Vec<WifiSsid>> {
    Json(vec![
        WifiSsid { ssid: "OpenNGFW".to_string(), status: "active".to_string() },
    ])
}

// --- Network Hardware Detection ---
/// Get physical ports summary
#[axum::debug_handler]
pub async fn get_physical_ports_summary(
    State((_firewall, network_manager, _log_manager)): State<AppState>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let network_manager = network_manager.read().await;
    match network_manager.get_physical_ports_summary().await {
        Ok(summary) => Ok(Json(summary)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to get physical ports summary: {}", e) }))
        ))
    }
}

/// Get detailed information for a specific port
#[axum::debug_handler]
pub async fn get_port_details(
    State((_firewall, network_manager, _log_manager)): State<AppState>,
    Path(port_id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let network_manager = network_manager.read().await;
    match network_manager.get_port_details(&port_id).await {
        Ok(Some(port)) => Ok(Json(json!(port))),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": format!("Port {} not found", port_id) }))
        )),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to get port details: {}", e) }))
        ))
    }
}

/// Get real-time statistics for a port
#[axum::debug_handler]
pub async fn get_port_statistics(
    State((_firewall, network_manager, _log_manager)): State<AppState>,
    Path(interface_name): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let network_manager = network_manager.read().await;
    match network_manager.get_port_statistics(&interface_name).await {
        Ok(stats) => Ok(Json(stats)),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to get port statistics: {}", e) }))
        ))
    }
}

/// Get all physical ports with detailed information
#[axum::debug_handler]
pub async fn get_all_physical_ports(
    _state: State<AppState> // not needed for this endpoint
) -> Result<Json<Vec<String>>, (StatusCode, Json<serde_json::Value>)> {
    let ports = get_physical_ports();
    Ok(Json(ports))
}

// --- System & Configuration API ---
pub async fn get_system_config() -> Json<serde_json::Value> {
    Json(json!({
        "hostname": "Open-NGFW",
        "serial_number": "SN-2024-001",
        "firmware_version": "1.0.0",
        "system_time": chrono::Utc::now().to_rfc3339(),
        "timezone": "UTC",
        "admin_email": "admin@open-ngfw.local",
        "contact_info": "Open-NGFW Team",
        "location": "Data Center",
        "description": "Open Next-Generation Firewall"
    }))
}

pub async fn get_system_licenses() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "license_type": "Enterprise",
            "license_key": "ENT-2024-XXXX-XXXX",
            "status": "active",
            "expiry_date": "2025-12-31",
            "features": ["IPS", "AV", "WebFilter", "DLP"],
            "seats": 100
        }),
        json!({
            "license_type": "Support",
            "license_key": "SUP-2024-XXXX-XXXX",
            "status": "active",
            "expiry_date": "2025-12-31",
            "features": ["24x7 Support", "Updates"],
            "seats": 1
        })
    ])
}

pub async fn get_system_metrics() -> Json<serde_json::Value> {
    Json(json!({
        "cpu_usage": 15.5,
        "memory_usage": 45.2,
        "disk_usage": 23.8,
        "network_rx_bytes": 1024000,
        "network_tx_bytes": 512000,
        "active_sessions": 1250,
        "active_connections": 89
    }))
}

// --- User Management API ---
pub async fn get_administrators() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "username": "admin",
            "full_name": "System Administrator",
            "email": "admin@open-ngfw.local",
            "role": "super_admin",
            "status": "active",
            "last_login": chrono::Utc::now().to_rfc3339()
        }),
        json!({
            "username": "operator",
            "full_name": "Network Operator",
            "email": "operator@open-ngfw.local",
            "role": "operator",
            "status": "active",
            "last_login": chrono::Utc::now().to_rfc3339()
        })
    ])
}

pub async fn get_user_groups() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Administrators",
            "description": "Full system access",
            "permissions": ["read", "write", "delete", "admin"]
        }),
        json!({
            "name": "Operators",
            "description": "Network operations access",
            "permissions": ["read", "write"]
        }),
        json!({
            "name": "Viewers",
            "description": "Read-only access",
            "permissions": ["read"]
        })
    ])
}

// --- Network API ---
pub async fn get_network_interfaces() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "eth0",
            "alias": "WAN",
            "interface_type": "ethernet",
            "status": "up",
            "ip_address": "192.168.1.1",
            "netmask": "255.255.255.0",
            "gateway": "192.168.1.254",
            "mtu": 1500,
            "speed": 1000,
            "duplex": "full"
        }),
        json!({
            "name": "eth1",
            "alias": "LAN",
            "interface_type": "ethernet",
            "status": "up",
            "ip_address": "10.0.0.1",
            "netmask": "255.255.255.0",
            "gateway": null,
            "mtu": 1500,
            "speed": 1000,
            "duplex": "full"
        })
    ])
}

pub async fn get_network_zones() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "WAN",
            "description": "External network zone",
            "interface_count": 1
        }),
        json!({
            "name": "LAN",
            "description": "Internal network zone",
            "interface_count": 1
        }),
        json!({
            "name": "DMZ",
            "description": "Demilitarized zone",
            "interface_count": 0
        })
    ])
}

// --- Firewall & Security API ---
pub async fn get_firewall_policies() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "policy_id": 1,
            "name": "Allow LAN to WAN",
            "src_zone_id": 2,
            "dst_zone_id": 1,
            "src_address": ["10.0.0.0/24"],
            "dst_address": ["any"],
            "service": ["any"],
            "action": "allow",
            "status": "enabled",
            "log_traffic": true,
            "nat_enabled": true,
            "nat_type": "source"
        }),
        json!({
            "policy_id": 2,
            "name": "Block Malicious Traffic",
            "src_zone_id": 1,
            "dst_zone_id": 2,
            "src_address": ["any"],
            "dst_address": ["10.0.0.0/24"],
            "service": ["any"],
            "action": "deny",
            "status": "enabled",
            "log_traffic": true,
            "nat_enabled": false,
            "nat_type": null
        })
    ])
}

pub async fn get_address_objects() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "LAN_Network",
            "address_type": "subnet",
            "value": "10.0.0.0/24",
            "interface_id": 2,
            "comment": "Local area network"
        }),
        json!({
            "name": "Web_Servers",
            "address_type": "group",
            "value": "192.168.1.10,192.168.1.11",
            "interface_id": null,
            "comment": "Web server group"
        }),
        json!({
            "name": "Admin_Workstation",
            "address_type": "host",
            "value": "10.0.0.100",
            "interface_id": 2,
            "comment": "Administrator workstation"
        })
    ])
}

pub async fn get_service_objects() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "HTTP",
            "protocol": "tcp",
            "src_port": null,
            "dst_port": "80",
            "icmp_type": null,
            "icmp_code": null,
            "comment": "HTTP web traffic"
        }),
        json!({
            "name": "HTTPS",
            "protocol": "tcp",
            "src_port": null,
            "dst_port": "443",
            "icmp_type": null,
            "icmp_code": null,
            "comment": "HTTPS secure web traffic"
        }),
        json!({
            "name": "DNS",
            "protocol": "udp",
            "src_port": null,
            "dst_port": "53",
            "icmp_type": null,
            "icmp_code": null,
            "comment": "Domain Name System"
        })
    ])
}

// --- VPN API ---
pub async fn get_vpn_tunnels() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Branch_Office_Tunnel",
            "tunnel_type": "ipsec",
            "status": "up",
            "local_gateway": "192.168.1.1",
            "remote_gateway": "203.0.113.1",
            "local_subnet": "10.0.0.0/24",
            "remote_subnet": "10.1.0.0/24",
            "ike_version": 2,
            "dpd_enabled": true,
            "dpd_interval": 30,
            "dpd_retry": 3
        }),
        json!({
            "name": "Remote_Worker_Tunnel",
            "tunnel_type": "ssl",
            "status": "down",
            "local_gateway": "192.168.1.1",
            "remote_gateway": null,
            "local_subnet": "10.0.0.0/24",
            "remote_subnet": null,
            "ike_version": 1,
            "dpd_enabled": false,
            "dpd_interval": 0,
            "dpd_retry": 0
        })
    ])
}

// --- Security Profiles API ---
pub async fn get_antivirus_profiles() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Default_AV",
            "status": "enabled",
            "scan_mode": "proxy",
            "quarantine": true,
            "action": "block"
        }),
        json!({
            "name": "High_Security_AV",
            "status": "enabled",
            "scan_mode": "proxy",
            "quarantine": true,
            "action": "block"
        })
    ])
}

pub async fn get_webfilter_profiles() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Default_WebFilter",
            "status": "enabled",
            "default_action": "allow",
            "safe_search": true,
            "youtube_restrict": false
        }),
        json!({
            "name": "Strict_WebFilter",
            "status": "enabled",
            "default_action": "block",
            "safe_search": true,
            "youtube_restrict": true
        })
    ])
}

// --- Logging API ---
pub async fn get_system_logs() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "level": "info",
            "facility": "system",
            "message": "System startup completed",
            "source_ip": null,
            "user": "system",
            "session_id": null
        }),
        json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "level": "warning",
            "facility": "network",
            "message": "Interface eth1 link down",
            "source_ip": null,
            "user": "system",
            "session_id": null
        })
    ])
}

pub async fn get_traffic_logs() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "src_ip": "10.0.0.100",
            "dst_ip": "8.8.8.8",
            "src_port": 54321,
            "dst_port": 53,
            "protocol": "udp",
            "action": "allow",
            "policy_id": 1,
            "bytes_sent": 64,
            "bytes_received": 64,
            "packets_sent": 1,
            "packets_received": 1,
            "duration": 0,
            "user": null,
            "application": "DNS",
            "threat_level": null
        }),
        json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "src_ip": "10.0.0.101",
            "dst_ip": "192.168.1.10",
            "src_port": 54322,
            "dst_port": 80,
            "protocol": "tcp",
            "action": "allow",
            "policy_id": 1,
            "bytes_sent": 1024,
            "bytes_received": 2048,
            "packets_sent": 10,
            "packets_received": 8,
            "duration": 5,
            "user": "john.doe",
            "application": "HTTP",
            "threat_level": null
        })
    ])
}

pub async fn get_threat_logs() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "threat_type": "virus",
            "threat_name": "Trojan.Generic",
            "severity": "high",
            "src_ip": "203.0.113.45",
            "dst_ip": "10.0.0.100",
            "user": null,
            "action_taken": "blocked",
            "details": {
                "signature_id": "AV-001",
                "file_name": "malware.exe",
                "file_hash": "abc123def456"
            },
            "policy_id": 2
        }),
        json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "threat_type": "intrusion",
            "threat_name": "SQL Injection Attempt",
            "severity": "medium",
            "src_ip": "198.51.100.123",
            "dst_ip": "10.0.0.50",
            "user": null,
            "action_taken": "blocked",
            "details": {
                "signature_id": "IPS-002",
                "attack_type": "sql_injection",
                "payload": "SELECT * FROM users"
            },
            "policy_id": 2
        })
    ])
}

// --- Cloud & Entry API ---
pub async fn get_cloud_connections() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Cloud_Management",
            "cloud_type": "aws",
            "status": "connected",
            "api_key": "***hidden***",
            "api_secret": "***hidden***",
            "region": "us-east-1",
            "account_id": "123456789012",
            "last_sync": chrono::Utc::now().to_rfc3339(),
            "sync_interval": 300
        })
    ])
}

pub async fn get_entry_connections() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Branch_Switch",
            "device_type": "switch",
            "device_ip": "10.1.0.1",
            "device_serial": "SW-001-ABC123",
            "status": "connected",
            "authorization_key": "***hidden***",
            "last_heartbeat": chrono::Utc::now().to_rfc3339()
        }),
        json!({
            "name": "Office_AP",
            "device_type": "access_point",
            "device_ip": "10.1.0.2",
            "device_serial": "AP-001-DEF456",
            "status": "connected",
            "authorization_key": "***hidden***",
            "last_heartbeat": chrono::Utc::now().to_rfc3339()
        })
    ])
}

// --- Virtualization API ---
pub async fn get_virtual_machines() -> Json<Vec<serde_json::Value>> {
    Json(vec![
        json!({
            "name": "Web_Server_VM",
            "vm_type": "kvm",
            "status": "running",
            "cpu_cores": 2,
            "memory_mb": 4096,
            "disk_size_gb": 50,
            "ip_address": "10.0.0.10",
            "hostname": "web-server-01",
            "license_key": "VM-001-XXX-XXX"
        }),
        json!({
            "name": "Database_VM",
            "vm_type": "kvm",
            "status": "running",
            "cpu_cores": 4,
            "memory_mb": 8192,
            "disk_size_gb": 100,
            "ip_address": "10.0.0.11",
            "hostname": "db-server-01",
            "license_key": "VM-002-XXX-XXX"
        })
    ])
}

/// Get all network interfaces
#[axum::debug_handler]
pub async fn get_interfaces() -> Result<Json<Vec<NetworkInterface>>, (StatusCode, Json<serde_json::Value>)> {
    match open_default_network_db() {
        Ok(db) => {
            // Sync physical ports before returning
            let _ = db.sync_physical_ports();
            match db.get_interfaces() {
                Ok(interfaces) => Ok(Json(interfaces)),
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Database error" }))))
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Get a network interface by ID
#[axum::debug_handler]
pub async fn get_interface_by_id(Path(id): Path<i32>) -> Result<Json<NetworkInterface>, (StatusCode, Json<serde_json::Value>)> {
    match open_default_network_db() {
        Ok(db) => {
            match db.get_interfaces() {
                Ok(interfaces) => {
                    if let Some(iface) = interfaces.into_iter().find(|iface| iface.id == id) {
                        Ok(Json(iface))
                    } else {
                        Err((StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Interface not found" }))))
                    }
                },
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Database error" }))))
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Add a new network interface
#[axum::debug_handler]
pub async fn add_interface(Json(iface): Json<NetworkInterface>) -> Result<(StatusCode, Json<NetworkInterface>), (StatusCode, Json<serde_json::Value>)> {
    match open_default_network_db() {
        Ok(db) => {
            match db.add_interface(&iface) {
                Ok(id) => {
                    let mut iface = iface;
                    iface.id = id as i32;
                    Ok((StatusCode::CREATED, Json(iface)))
                },
                Err(e) => {
                    eprintln!("Failed to add interface: {}", e);
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to add interface" }))))
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Update a network interface
#[axum::debug_handler]
pub async fn update_interface(Path(id): Path<i32>, Json(iface): Json<NetworkInterface>) -> Result<(StatusCode, Json<NetworkInterface>), (StatusCode, Json<serde_json::Value>)> {
    match open_default_network_db() {
        Ok(db) => {
            let mut iface = iface;
            iface.id = id;
            match db.update_interface(&iface) {
                Ok(_) => Ok((StatusCode::OK, Json(iface))),
                Err(e) => {
                    eprintln!("Failed to update interface: {}", e);
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to update interface" }))))
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to open database" }))))
        }
    }
}

/// Delete a network interface
#[axum::debug_handler]
pub async fn delete_interface(Path(id): Path<i32>) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    match open_default_network_db() {
        Ok(db) => {
            match db.delete_interface(id) {
                Ok(_) => Ok((StatusCode::OK, Json(serde_json::json!({ "message": "Interface deleted successfully" })))),
                Err(e) => {
                    eprintln!("Failed to delete interface: {}", e);
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to delete interface" }))))
                }
            }
        },
        Err(e) => {
            eprintln!("Failed to open database: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Failed to open database" }))))
        }
    }
}

#[axum::debug_handler]
pub async fn serve_network_interfaces() -> axum::response::Html<&'static str> {
    axum::response::Html(include_str!("../static/network_interfaces.html"))
}

#[axum::debug_handler]
pub async fn serve_dashboard() -> axum::response::Html<&'static str> {
    axum::response::Html(include_str!("../static/dashboard.html"))
}

#[derive(Deserialize)]
pub struct LogQuery {
    pub log_type: Option<String>,
    pub from: Option<String>, // ISO8601
    pub to: Option<String>,   // ISO8601
    pub severity: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

#[axum::debug_handler]
pub async fn get_logs(
    State((_firewall, _network_manager, log_manager)): State<AppState>,
    Query(params): Query<LogQuery>
) -> Result<Json<Vec<LogEntry>>, (StatusCode, Json<serde_json::Value>)> {
    // Convert query parameters to Filter
    let mut filter = Filter {
        start_time: None,
        end_time: None,
        log_types: None,
        source_ip: None,
        destination_ip: None,
        user: None,
        action: None,
        severity: None,
        limit: params.limit,
        offset: params.offset,
    };

    // Parse time filters
    if let Some(from) = params.from {
        if let Ok(dt) = DateTime::parse_from_rfc3339(&from) {
            filter.start_time = Some(dt.with_timezone(&Utc));
        }
    }
    
    if let Some(to) = params.to {
        if let Ok(dt) = DateTime::parse_from_rfc3339(&to) {
            filter.end_time = Some(dt.with_timezone(&Utc));
        }
    }

    // Parse log type filter
    if let Some(log_type) = params.log_type {
        let log_types = match log_type.as_str() {
            "traffic" => vec![LogType::Traffic],
            "threat" => vec![LogType::Threat],
            "system" => vec![LogType::System],
            "security" => vec![LogType::Security],
            _ => vec![LogType::Traffic, LogType::Threat, LogType::System, LogType::Security],
        };
        filter.log_types = Some(log_types);
    }

    // Query logs using LogManager
    match log_manager.query_logs(&filter).await {
        Ok(log_entries) => {
            // Convert LogManager::LogEntry to models::LogEntry
            let converted_logs: Vec<LogEntry> = log_entries.into_iter().map(|entry| {
                let log_type = match entry.log_type {
                    LogType::Traffic => "traffic".to_string(),
                    LogType::Threat => "threat".to_string(),
                    LogType::System => "system".to_string(),
                    LogType::Security => "security".to_string(),
                };
                LogEntry {
                    id: 0, // Not used for file-based logs
                    timestamp: entry.timestamp,
                    log_type,
                    message: entry.data.to_string(),
                    severity: None, // Extract from data if needed
                    source_ip: None, // Extract from data if needed
                    dest_ip: None, // Extract from data if needed
                    user: None, // Extract from data if needed
                    action: None, // Extract from data if needed
                }
            }).collect();
            Ok(Json(converted_logs))
        },
        Err(e) => {
            eprintln!("Failed to query logs: {}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))))
        }
    }
}

#[derive(Deserialize)]
pub struct CustomReportRequest {
    pub fields: Vec<String>,
    pub filters: Vec<FilterCondition>,
}

#[derive(Deserialize)]
pub struct FilterCondition {
    pub field: String,
    pub op: String,
    pub value: String,
}

#[derive(Deserialize)]
pub struct ExportReportRequest {
    pub fields: Vec<String>,
    pub filters: Vec<FilterCondition>,
    pub format: String,
}

#[derive(Deserialize)]
pub struct ExportComplianceRequest {
    pub type_: String,
}

#[axum::debug_handler]
pub async fn get_traffic_stats() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "time": "14:25", "incoming": 1200, "outgoing": 800, "connections": 45 }),
    ]))
}

#[axum::debug_handler]
pub async fn get_application_stats() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "protocol": "HTTPS", "connections": 25, "bytes": 15420 }),
    ]))
}

#[axum::debug_handler]
pub async fn get_security_stats() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "name": "IPS", "value": 12 }),
    ]))
}

#[axum::debug_handler]
pub async fn get_user_stats() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "user": "admin", "bandwidth": 12000 }),
    ]))
}

#[axum::debug_handler]
pub async fn get_anomaly_stats() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "time": "14:28", "value": 30 }),
    ]))
}

#[axum::debug_handler]
pub async fn custom_report_preview(
    axum::Json(req): axum::Json<CustomReportRequest>
) -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    if req.fields.is_empty() {
        return Err((StatusCode::BAD_REQUEST, axum::Json(json!({"error": "Fields required"}))));
    }
    Ok(axum::Json(vec![
        json!({ "source_ip": "192.168.1.1", "user": "admin" }),
    ]))
}

#[axum::debug_handler]
pub async fn export_report(
    axum::Json(req): axum::Json<ExportReportRequest>
) -> Result<(StatusCode, Response), (StatusCode, axum::Json<serde_json::Value>)> {
    if req.fields.is_empty() || req.format.is_empty() {
        return Err((StatusCode::BAD_REQUEST, axum::Json(json!({"error": "Fields and format required"}))));
    }
    Ok((StatusCode::OK, Response::new(Body::from("Exported file content"))))
}

#[axum::debug_handler]
pub async fn get_compliance_mapping(Query(params): Query<HashMap<String, String>>) -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    let _compliance_type = params.get("type").cloned().unwrap_or_else(|| "PCI-DSS".to_string());
    Ok(axum::Json(vec![
        json!({ "compliance": "User ID", "system": "user", "note": "Maps to system user field" }),
    ]))
}

#[axum::debug_handler]
pub async fn export_compliance_report(
    axum::Json(_req): axum::Json<ExportComplianceRequest>
) -> Result<(StatusCode, Response), (StatusCode, axum::Json<serde_json::Value>)> {
    let content = b"Fake PDF/CSV/XLSX content";
    let resp = Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", "attachment; filename=report.pdf")
        .body(Body::from(content.as_ref()))
        .unwrap();
    Ok((StatusCode::OK, resp))
}

#[axum::debug_handler]
pub async fn get_schedules() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "id": "1", "name": "PCI-DSS Compliance", "type": "Compliance", "schedule": "Monthly", "recipients": "admin@corp.com", "nextRun": "2024-08-01", "status": true }),
    ]))
}

#[axum::debug_handler]
pub async fn create_or_update_schedule(axum::Json(_req): axum::Json<serde_json::Value>) -> Result<axum::Json<serde_json::Value>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(json!({"message": "Schedule saved"})))
}

#[axum::debug_handler]
pub async fn delete_schedule(Path(id): Path<String>) -> Result<axum::Json<serde_json::Value>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(json!({"message": format!("Schedule {} deleted", id)})))
}

#[axum::debug_handler]
pub async fn get_access_list() -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "user": "admin", "group": "admins", "tenant": "hq" }),
    ]))
}

#[axum::debug_handler]
pub async fn update_access(axum::Json(_req): axum::Json<serde_json::Value>) -> Result<axum::Json<serde_json::Value>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(json!({"message": "Access updated"})))
}

#[axum::debug_handler]
pub async fn get_audit_log(Query(_params): Query<HashMap<String, String>>) -> Result<axum::Json<Vec<serde_json::Value>>, (StatusCode, axum::Json<serde_json::Value>)> {
    Ok(axum::Json(vec![
        json!({ "user": "admin", "action": "Exported", "time": "2024-07-01 08:01", "report": "Weekly Traffic" }),
    ]))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::{Request, StatusCode};
    use axum::body::Body;
    use axum::response::Response;
    use axum::{Router, routing::{get, post, delete}};
    use tower::ServiceExt; // for .oneshot

    #[tokio::test]
    async fn test_get_traffic_stats() {
        let response = get_traffic_stats().await.unwrap();
        let data = response.0;
        assert!(!data.is_empty());
    }

    #[tokio::test]
    async fn test_custom_report_preview_empty_fields() {
        let req = CustomReportRequest { fields: vec![], filters: vec![] };
        let result = custom_report_preview(axum::Json(req)).await;
        assert!(result.is_err());
        let (status, _) = result.err().unwrap();
        assert_eq!(status, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn test_router_traffic_stats() {
        let app = Router::new().route("/api/reports/traffic-stats", get(get_traffic_stats));
        let req = Request::builder().uri("/api/reports/traffic-stats").body(Body::empty()).unwrap();
        let resp = app.oneshot(req).await.unwrap();
        assert_eq!(resp.status(), StatusCode::OK);
    }
}

// RBAC middleware (mock, có thể mở rộng với JWT/session)
pub async fn require_admin(
    req: Request<Body>,
    next: Next,
) -> impl IntoResponse {
    let is_admin = true; // Thay bằng kiểm tra thực tế
    if !is_admin {
        return (StatusCode::FORBIDDEN, "Forbidden").into_response();
    }
    next.run(req).await
}

// Audit log mẫu (có thể ghi vào DB/log file)
pub fn log_audit(user: &str, action: &str, detail: &str) {
    tracing::info!(target: "AUDIT", user, action, detail);
    // TODO: Ghi vào DB/log file nếu cần
}

// Export compliance thực tế (mock trả về PDF/CSV/XLSX bytes)
use axum::response::{Response as AxumResponse};

pub async fn export_compliance_report_real(
    axum::Json(_req): axum::Json<ExportComplianceRequest>
) -> Result<(StatusCode, AxumResponse), (StatusCode, axum::Json<serde_json::Value>)> {
    let content = b"Fake PDF/CSV/XLSX content";
    let resp = AxumResponse::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", "attachment; filename=report.pdf")
        .body(Body::from(content.as_ref()))
        .unwrap();
    Ok((StatusCode::OK, resp))
}

// --- NAT API ---
const NAT_RULES_PATH: &str = "data/nat_rules.json";

/// List all NAT rules
#[axum::debug_handler]
pub async fn get_nat_rules() -> Json<Vec<NatRule>> {
    let rules = read_nat_rules_from_file();
    Json(rules)
}

/// Add a new NAT rule
#[axum::debug_handler]
pub async fn add_nat_rule(Json(new_rule): Json<NatRule>) -> (StatusCode, Json<NatRule>) {
    let mut rules = read_nat_rules_from_file();
    rules.push(new_rule.clone());
    write_nat_rules_to_file(&rules);
    (StatusCode::CREATED, Json(new_rule))
}

/// Update a NAT rule by id
#[axum::debug_handler]
pub async fn update_nat_rule(Path(id): Path<String>, Json(updated_rule): Json<NatRule>) -> (StatusCode, Json<NatRule>) {
    let mut rules = read_nat_rules_from_file();
    if let Some(pos) = rules.iter().position(|r| r.id == id) {
        rules[pos] = updated_rule.clone();
        write_nat_rules_to_file(&rules);
        (StatusCode::OK, Json(updated_rule))
    } else {
        (StatusCode::NOT_FOUND, Json(updated_rule))
    }
}

/// Delete a NAT rule by id
#[axum::debug_handler]
pub async fn delete_nat_rule(Path(id): Path<String>) -> (StatusCode, Json<serde_json::Value>) {
    let mut rules = read_nat_rules_from_file();
    let len_before = rules.len();
    rules.retain(|r| r.id != id);
    if rules.len() < len_before {
        write_nat_rules_to_file(&rules);
        (StatusCode::OK, Json(json!({"deleted": true})))
    } else {
        (StatusCode::NOT_FOUND, Json(json!({"deleted": false})))
    }
}

fn read_nat_rules_from_file() -> Vec<NatRule> {
    if Path::new(NAT_RULES_PATH).exists() {
        let data = fs::read_to_string(NAT_RULES_PATH).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        Vec::new()
    }
}

fn write_nat_rules_to_file(rules: &Vec<NatRule>) {
    let _ = fs::create_dir_all("data");
    let _ = fs::write(NAT_RULES_PATH, serde_json::to_string_pretty(rules).unwrap());
} 