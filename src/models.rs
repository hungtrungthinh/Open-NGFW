use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

// ============================================================================
// SYSTEM & CONFIGURATION MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    pub id: i32,
    pub hostname: String,
    pub serial_number: String,
    pub firmware_version: String,
    pub system_time: DateTime<Utc>,
    pub timezone: String,
    pub admin_email: Option<String>,
    pub contact_info: Option<String>,
    pub location: Option<String>,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemLicense {
    pub id: i32,
    pub license_type: String,
    pub license_key: String,
    pub status: String,
    pub expiry_date: Option<chrono::NaiveDate>,
    pub features: Option<Vec<String>>,
    pub seats: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub id: i32,
    pub timestamp: DateTime<Utc>,
    pub cpu_usage: Option<f64>,
    pub memory_usage: Option<f64>,
    pub disk_usage: Option<f64>,
    pub network_rx_bytes: Option<i64>,
    pub network_tx_bytes: Option<i64>,
    pub active_sessions: Option<i32>,
    pub active_connections: Option<i32>,
}

// ============================================================================
// USER MANAGEMENT MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Administrator {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub role: String,
    pub status: String,
    pub last_login: Option<DateTime<Utc>>,
    pub login_attempts: i32,
    pub password_changed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserGroup {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub permissions: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserGroupAssignment {
    pub id: i32,
    pub user_id: i32,
    pub group_id: i32,
    pub assigned_at: DateTime<Utc>,
}

// ============================================================================
// NETWORK & INTERFACE MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AddressingMode {
    Manual,
    DHCP,
    PPPoE,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub id: i32,
    pub name: String,
    pub alias: Option<String>,
    pub interface_type: String, // Physical, VLAN, etc.
    pub vrf_id: Option<i32>,
    pub role: Option<String>, // WAN, LAN, DMZ, etc.
    pub bandwidth_up: Option<i32>,
    pub bandwidth_down: Option<i32>,
    pub addressing_mode: AddressingMode,
    pub status: Option<String>, // Connected, Disconnected
    // Manual
    pub manual_ip: Option<String>,
    pub manual_netmask: Option<String>,
    pub manual_gateway: Option<String>,
    pub manual_dns: Option<String>,
    // DHCP
    pub dhcp_ip: Option<String>,
    pub dhcp_netmask: Option<String>,
    pub dhcp_gateway: Option<String>,
    pub dhcp_dns: Option<String>,
    // PPPoE
    pub pppoe_username: Option<String>,
    pub pppoe_password: Option<String>,
    pub pppoe_ip: Option<String>,
    pub pppoe_netmask: Option<String>,
    pub pppoe_gateway: Option<String>,
    pub pppoe_dns: Option<String>,
    pub last_renewed: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkZone {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub interface_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VlanConfig {
    pub id: i32,
    pub vlan_id: i32,
    pub name: String,
    pub interface_id: Option<i32>,
    pub ip_address: Option<String>,
    pub netmask: Option<String>,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// FIREWALL & SECURITY MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallPolicy {
    pub id: i32,
    pub policy_id: i32,
    pub name: String,
    pub src_zone_id: Option<i32>,
    pub dst_zone_id: Option<i32>,
    pub src_address: Option<Vec<String>>,
    pub dst_address: Option<Vec<String>>,
    pub service: Option<Vec<String>>,
    pub action: String,
    pub status: String,
    pub log_traffic: bool,
    pub schedule_id: Option<i32>,
    pub nat_enabled: bool,
    pub nat_type: Option<String>,
    pub comments: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddressObject {
    pub id: i32,
    pub name: String,
    pub address_type: String,
    pub value: String,
    pub interface_id: Option<i32>,
    pub comment: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddressGroup {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddressGroupMember {
    pub id: i32,
    pub group_id: i32,
    pub address_id: i32,
    pub added_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceObject {
    pub id: i32,
    pub name: String,
    pub protocol: String,
    pub src_port: Option<String>,
    pub dst_port: Option<String>,
    pub icmp_type: Option<i32>,
    pub icmp_code: Option<i32>,
    pub comment: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceGroup {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceGroupMember {
    pub id: i32,
    pub group_id: i32,
    pub service_id: i32,
    pub added_at: DateTime<Utc>,
}

// ============================================================================
// VPN MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnTunnel {
    pub id: i32,
    pub name: String,
    pub tunnel_type: String,
    pub status: String,
    pub local_gateway: Option<String>,
    pub remote_gateway: Option<String>,
    pub local_subnet: Option<String>,
    pub remote_subnet: Option<String>,
    pub phase1_proposal: Option<serde_json::Value>,
    pub phase2_proposal: Option<serde_json::Value>,
    pub psk: Option<String>,
    pub certificate_id: Option<i32>,
    pub ike_version: i32,
    pub dpd_enabled: bool,
    pub dpd_interval: i32,
    pub dpd_retry: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnCertificate {
    pub id: i32,
    pub name: String,
    pub certificate_type: String,
    pub certificate_data: String,
    pub private_key: Option<String>,
    pub expiry_date: Option<chrono::NaiveDate>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// SECURITY PROFILES MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AntivirusProfile {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub scan_mode: String,
    pub quarantine: bool,
    pub action: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebFilterProfile {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub default_action: String,
    pub safe_search: bool,
    pub youtube_restrict: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppControlProfile {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub default_action: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpsProfile {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub default_action: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DlpProfile {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub default_action: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// MONITORING & LOGGING MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemLog {
    pub id: i32,
    pub timestamp: DateTime<Utc>,
    pub level: String,
    pub facility: String,
    pub message: String,
    pub source_ip: Option<String>,
    pub user: Option<String>,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficLog {
    pub id: i32,
    pub timestamp: DateTime<Utc>,
    pub src_ip: String,
    pub dst_ip: String,
    pub src_port: Option<i32>,
    pub dst_port: Option<i32>,
    pub protocol: String,
    pub action: String,
    pub policy_id: Option<i32>,
    pub bytes_sent: Option<i64>,
    pub bytes_received: Option<i64>,
    pub packets_sent: Option<i32>,
    pub packets_received: Option<i32>,
    pub duration: Option<i32>,
    pub user: Option<String>,
    pub application: Option<String>,
    pub threat_level: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatLog {
    pub id: i32,
    pub timestamp: DateTime<Utc>,
    pub threat_type: String,
    pub threat_name: String,
    pub severity: String,
    pub src_ip: Option<String>,
    pub dst_ip: Option<String>,
    pub user: Option<String>,
    pub action_taken: String,
    pub details: Option<serde_json::Value>,
    pub policy_id: Option<i32>,
}

// ============================================================================
// SCHEDULING & MAINTENANCE MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub id: i32,
    pub name: String,
    pub schedule_type: String,
    pub start_time: Option<chrono::NaiveTime>,
    pub end_time: Option<chrono::NaiveTime>,
    pub days_of_week: Option<Vec<i32>>,
    pub start_date: Option<chrono::NaiveDate>,
    pub end_date: Option<chrono::NaiveDate>,
    pub timezone: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupConfig {
    pub id: i32,
    pub name: String,
    pub backup_type: String,
    pub destination: String,
    pub destination_path: Option<String>,
    pub schedule_id: Option<i32>,
    pub retention_days: i32,
    pub encryption_enabled: bool,
    pub compression_enabled: bool,
    pub status: String,
    pub last_backup: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// CLOUD & ENTRY MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudConnection {
    pub id: i32,
    pub name: String,
    pub cloud_type: String,
    pub status: String,
    pub api_key: Option<String>,
    pub api_secret: Option<String>,
    pub region: Option<String>,
    pub account_id: Option<String>,
    pub last_sync: Option<DateTime<Utc>>,
    pub sync_interval: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntryConnection {
    pub id: i32,
    pub name: String,
    pub device_type: String,
    pub device_ip: String,
    pub device_serial: Option<String>,
    pub status: String,
    pub authorization_key: Option<String>,
    pub last_heartbeat: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// VIRTUALIZATION MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualMachine {
    pub id: i32,
    pub name: String,
    pub vm_type: String,
    pub status: String,
    pub cpu_cores: i32,
    pub memory_mb: i32,
    pub disk_size_gb: i32,
    pub ip_address: Option<String>,
    pub hostname: Option<String>,
    pub license_key: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ============================================================================
// LEGACY MODELS (for backward compatibility)
// ============================================================================

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

// Dashboard
#[derive(Debug, Clone, serde::Serialize)]
pub struct DashboardStatus {
    pub system_health: String,
    pub resource_usage: String,
    pub uptime: String,
    pub wan_ip: String,
}

// Security Entry
#[derive(Debug, Clone, serde::Serialize)]
pub struct SecurityTopology {
    pub nodes: Vec<String>,
    pub links: Vec<(String, String)>,
}

// Network
#[derive(Debug, Clone, serde::Serialize)]
pub struct StaticRoute {
    pub destination: String,
    pub gateway: String,
    pub metric: u32,
}

// Wi-Fi & Switch Controller
#[derive(Debug, Clone, serde::Serialize)]
pub struct WifiSsid {
    pub ssid: String,
    pub status: String,
}

// Monitor
#[derive(Debug, Clone, serde::Serialize)]
pub struct RoutingMonitor {
    pub route: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: i32,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub log_type: String,
    pub message: String,
    pub severity: Option<String>,
    pub source_ip: Option<String>,
    pub dest_ip: Option<String>,
    pub user: Option<String>,
    pub action: Option<String>,
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

// ============================================================================
// NAT MODELS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NatRule {
    pub id: String,
    pub original_ip: String,
    pub translated_ip: String,
    pub nat_type: NatType, // SNAT or DNAT
    pub original_port: Option<u16>,
    pub translated_port: Option<u16>,
    pub enabled: bool,
    pub comment: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NatType {
    SNAT,
    DNAT,
} 