use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{Html, Json},
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::firewall::Firewall;
use crate::network::NetworkManager;
use crate::models::{FirewallRule, CreateRuleRequest, FirewallStatus, FirewallStatistics, DashboardStatus, SecurityTopology, NetworkInterface, StaticRoute, FirewallPolicy, AntivirusProfile, Administrator, TrafficLog, RoutingMonitor, WifiSsid};

/// Get all firewall rules
#[axum::debug_handler]
pub async fn get_rules(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
) -> Json<Vec<FirewallRule>> {
    let firewall = firewall.read().await;
    let rules = firewall.get_rules().await;
    Json(rules)
}

/// Add a new firewall rule
#[axum::debug_handler]
pub async fn add_rule(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
    Json(rule_request): Json<CreateRuleRequest>,
) -> (StatusCode, Json<FirewallRule>) {
    let rule = FirewallRule::new(rule_request);
    let rule_clone = rule.clone();
    let mut firewall = firewall.write().await;
    firewall.add_rule(rule).await;
    (StatusCode::OK, Json(rule_clone))
}

/// Delete a firewall rule by ID
#[axum::debug_handler]
pub async fn delete_rule(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
    Path(rule_id): Path<String>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut firewall = firewall.write().await;
    let success = firewall.remove_rule(&rule_id).await;
    if success {
        (StatusCode::OK, Json(json!({ "message": "Rule deleted successfully" })))
    } else {
        (StatusCode::NOT_FOUND, Json(json!({ "error": "Rule not found" })))
    }
}

/// Toggle a firewall rule's enabled state
#[axum::debug_handler]
pub async fn toggle_rule(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
    Path(rule_id): Path<String>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut firewall = firewall.write().await;
    let success = firewall.toggle_rule(&rule_id).await;
    if success {
        (StatusCode::OK, Json(json!({ "message": "Rule toggled successfully" })))
    } else {
        (StatusCode::NOT_FOUND, Json(json!({ "error": "Rule not found" })))
    }
}

/// Get firewall status
#[axum::debug_handler]
pub async fn get_status(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
) -> Json<FirewallStatus> {
    let firewall = firewall.read().await;
    let status = firewall.get_status().await;
    Json(status)
}

/// Get firewall statistics
#[axum::debug_handler]
pub async fn get_statistics(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
) -> Json<FirewallStatistics> {
    let firewall = firewall.read().await;
    let stats = firewall.get_statistics().await;
    Json(stats)
}

/// Toggle firewall enabled/disabled state
#[axum::debug_handler]
pub async fn toggle_firewall(
    State((firewall, _network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
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

/// Serve the dashboard HTML
#[axum::debug_handler]
pub async fn serve_dashboard() -> Html<&'static str> {
    Html(include_str!("../static/dashboard.html"))
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
            status: "up".to_string(),
            ip_address: Some("192.168.1.2".to_string()),
            netmask: Some("255.255.255.0".to_string()),
            gateway: Some("192.168.1.1".to_string()),
            mtu: 1500,
            speed: Some(1000),
            duplex: Some("full".to_string()),
            vlan_id: None,
            zone_id: Some(1),
            description: Some("WAN Interface".to_string()),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        },
        NetworkInterface { 
            id: 2,
            name: "eth1".to_string(), 
            alias: Some("LAN".to_string()),
            interface_type: "ethernet".to_string(),
            status: "down".to_string(),
            ip_address: Some("192.168.1.3".to_string()),
            netmask: Some("255.255.255.0".to_string()),
            gateway: None,
            mtu: 1500,
            speed: Some(1000),
            duplex: Some("full".to_string()),
            vlan_id: None,
            zone_id: Some(2),
            description: Some("LAN Interface".to_string()),
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
    State((_firewall, network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
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
    State((_firewall, network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
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
    State((_firewall, network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
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
    State((_firewall, network_manager)): State<(Arc<RwLock<Firewall>>, Arc<RwLock<NetworkManager>>)>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let network_manager = network_manager.read().await;
    match network_manager.detect_physical_ports().await {
        Ok(hardware) => Ok(Json(json!(hardware))),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": format!("Failed to detect physical ports: {}", e) }))
        ))
    }
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