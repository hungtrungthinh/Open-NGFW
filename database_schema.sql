-- Open-NGFW Database Schema
-- Encrypted SQLite database with SQLCipher (AES-256)

-- ============================================================================
-- SYSTEM & CONFIGURATION TABLES
-- ============================================================================

-- System configuration and basic info
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY,
    hostname TEXT NOT NULL DEFAULT 'Open-NGFW',
    serial_number TEXT NOT NULL DEFAULT 'NGW1234567890123',
    firmware_version TEXT NOT NULL DEFAULT 'v7.4.0',
    system_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    timezone TEXT DEFAULT 'UTC',
    admin_email TEXT,
    contact_info TEXT,
    location TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System licenses
CREATE TABLE IF NOT EXISTS system_licenses (
    id INTEGER PRIMARY KEY,
    license_type TEXT NOT NULL, -- 'enterprise', 'cloud', 'sandbox', etc.
    license_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'invalid'
    expiry_date DATE,
    features TEXT, -- JSON array of enabled features
    seats INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System performance metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cpu_usage REAL, -- percentage
    memory_usage REAL, -- percentage
    disk_usage REAL, -- percentage
    network_rx_bytes BIGINT,
    network_tx_bytes BIGINT,
    active_sessions INTEGER,
    active_connections INTEGER
);

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Administrator accounts
CREATE TABLE IF NOT EXISTS administrators (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'readonly'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'locked'
    last_login DATETIME,
    login_attempts INTEGER DEFAULT 0,
    password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User groups
CREATE TABLE IF NOT EXISTS user_groups (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT, -- JSON object of permissions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User group assignments
CREATE TABLE IF NOT EXISTS user_group_assignments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES administrators(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE
);

-- ============================================================================
-- NETWORK & INTERFACE TABLES
-- ============================================================================

-- Network interfaces
CREATE TABLE IF NOT EXISTS network_interfaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    alias TEXT,
    interface_type TEXT NOT NULL, -- Physical, VLAN, etc.
    vrf_id INTEGER DEFAULT 0,
    role TEXT, -- WAN, LAN, DMZ, etc.
    bandwidth_up INTEGER DEFAULT 0,
    bandwidth_down INTEGER DEFAULT 0,
    addressing_mode TEXT NOT NULL, -- Manual, DHCP, PPPoE
    status TEXT, -- Connected, Disconnected
    manual_ip TEXT,
    manual_netmask TEXT,
    manual_gateway TEXT,
    manual_dns TEXT,
    dhcp_ip TEXT,
    dhcp_netmask TEXT,
    dhcp_gateway TEXT,
    dhcp_dns TEXT,
    pppoe_username TEXT,
    pppoe_password TEXT,
    pppoe_ip TEXT,
    pppoe_netmask TEXT,
    pppoe_gateway TEXT,
    pppoe_dns TEXT,
    last_renewed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Network zones
CREATE TABLE IF NOT EXISTS network_zones (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    interface_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- VLAN configurations
CREATE TABLE IF NOT EXISTS vlan_configs (
    id INTEGER PRIMARY KEY,
    vlan_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    interface_id INTEGER,
    ip_address TEXT,
    netmask TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interface_id) REFERENCES network_interfaces(id) ON DELETE SET NULL
);

-- ============================================================================
-- FIREWALL & SECURITY TABLES
-- ============================================================================

-- Firewall policies
CREATE TABLE IF NOT EXISTS firewall_policies (
    id INTEGER PRIMARY KEY,
    policy_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    src_zone_id INTEGER,
    dst_zone_id INTEGER,
    src_address TEXT, -- JSON array of addresses
    dst_address TEXT, -- JSON array of addresses
    service TEXT, -- JSON array of services
    action TEXT NOT NULL DEFAULT 'deny', -- 'accept', 'deny', 'ipsec'
    status TEXT NOT NULL DEFAULT 'enabled', -- 'enabled', 'disabled'
    log_traffic BOOLEAN DEFAULT FALSE,
    schedule_id INTEGER,
    nat_enabled BOOLEAN DEFAULT FALSE,
    nat_type TEXT, -- 'source', 'destination', 'both'
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (src_zone_id) REFERENCES network_zones(id) ON DELETE SET NULL,
    FOREIGN KEY (dst_zone_id) REFERENCES network_zones(id) ON DELETE SET NULL
);

-- Address objects
CREATE TABLE IF NOT EXISTS address_objects (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'subnet', 'host', 'range', 'fqdn', 'wildcard'
    value TEXT NOT NULL, -- IP address, subnet, range, or FQDN
    interface_id INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interface_id) REFERENCES network_interfaces(id) ON DELETE SET NULL
);

-- Address groups
CREATE TABLE IF NOT EXISTS address_groups (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Address group members
CREATE TABLE IF NOT EXISTS address_group_members (
    id INTEGER PRIMARY KEY,
    group_id INTEGER NOT NULL,
    address_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES address_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES address_objects(id) ON DELETE CASCADE
);

-- Service objects
CREATE TABLE IF NOT EXISTS service_objects (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    protocol TEXT NOT NULL, -- 'tcp', 'udp', 'icmp', 'icmp6'
    src_port TEXT, -- port range or single port
    dst_port TEXT, -- port range or single port
    icmp_type INTEGER,
    icmp_code INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service groups
CREATE TABLE IF NOT EXISTS service_groups (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service group members
CREATE TABLE IF NOT EXISTS service_group_members (
    id INTEGER PRIMARY KEY,
    group_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES service_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service_objects(id) ON DELETE CASCADE
);

-- ============================================================================
-- VPN TABLES
-- ============================================================================

-- VPN tunnels
CREATE TABLE IF NOT EXISTS vpn_tunnels (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'ipsec', 'ssl', 'l2tp', 'pptp'
    status TEXT NOT NULL DEFAULT 'down', -- 'up', 'down', 'disabled'
    local_gateway TEXT,
    remote_gateway TEXT,
    local_subnet TEXT,
    remote_subnet TEXT,
    phase1_proposal TEXT, -- JSON object
    phase2_proposal TEXT, -- JSON object
    psk TEXT, -- pre-shared key (encrypted)
    certificate_id INTEGER,
    ike_version INTEGER DEFAULT 1,
    dpd_enabled BOOLEAN DEFAULT TRUE,
    dpd_interval INTEGER DEFAULT 10,
    dpd_retry INTEGER DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- VPN certificates
CREATE TABLE IF NOT EXISTS vpn_certificates (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'ca', 'local', 'remote'
    certificate_data TEXT NOT NULL, -- PEM encoded (encrypted)
    private_key TEXT, -- PEM encoded (encrypted)
    expiry_date DATE,
    status TEXT NOT NULL DEFAULT 'valid', -- 'valid', 'expired', 'revoked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECURITY PROFILES TABLES
-- ============================================================================

-- Antivirus profiles
CREATE TABLE IF NOT EXISTS antivirus_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enabled',
    scan_mode TEXT NOT NULL DEFAULT 'quick', -- 'quick', 'full', 'proxy'
    quarantine BOOLEAN DEFAULT TRUE,
    action TEXT NOT NULL DEFAULT 'block', -- 'block', 'pass', 'quarantine'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Web filter profiles
CREATE TABLE IF NOT EXISTS webfilter_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enabled',
    default_action TEXT NOT NULL DEFAULT 'block', -- 'block', 'allow', 'monitor'
    safe_search BOOLEAN DEFAULT TRUE,
    youtube_restrict BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application control profiles
CREATE TABLE IF NOT EXISTS app_control_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enabled',
    default_action TEXT NOT NULL DEFAULT 'allow', -- 'allow', 'block', 'monitor'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IPS profiles
CREATE TABLE IF NOT EXISTS ips_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enabled',
    default_action TEXT NOT NULL DEFAULT 'block', -- 'block', 'pass', 'monitor'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DLP profiles
CREATE TABLE IF NOT EXISTS dlp_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enabled',
    default_action TEXT NOT NULL DEFAULT 'block', -- 'block', 'pass', 'quarantine'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MONITORING & LOGGING TABLES
-- ============================================================================

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    level TEXT NOT NULL, -- 'emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'
    facility TEXT NOT NULL, -- 'kernel', 'user', 'mail', 'daemon', 'auth', 'syslog', 'lpr', 'news', 'uucp', 'cron', 'authpriv', 'ftp', 'ntp', 'security', 'console', 'solaris-cron'
    message TEXT NOT NULL,
    source_ip TEXT,
    user TEXT,
    session_id TEXT
);

-- Traffic logs
CREATE TABLE IF NOT EXISTS traffic_logs (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    src_ip TEXT NOT NULL,
    dst_ip TEXT NOT NULL,
    src_port INTEGER,
    dst_port INTEGER,
    protocol TEXT NOT NULL,
    action TEXT NOT NULL, -- 'accept', 'deny', 'drop'
    policy_id INTEGER,
    bytes_sent BIGINT,
    bytes_received BIGINT,
    packets_sent INTEGER,
    packets_received INTEGER,
    duration INTEGER, -- in seconds
    user TEXT,
    application TEXT,
    threat_level TEXT, -- 'low', 'medium', 'high', 'critical'
    FOREIGN KEY (policy_id) REFERENCES firewall_policies(id) ON DELETE SET NULL
);

-- Threat logs
CREATE TABLE IF NOT EXISTS threat_logs (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    threat_type TEXT NOT NULL, -- 'virus', 'intrusion', 'spam', 'phishing', 'malware'
    threat_name TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    src_ip TEXT,
    dst_ip TEXT,
    user TEXT,
    action_taken TEXT NOT NULL, -- 'blocked', 'quarantined', 'allowed', 'monitored'
    details TEXT, -- JSON object with additional threat details
    policy_id INTEGER,
    FOREIGN KEY (policy_id) REFERENCES firewall_policies(id) ON DELETE SET NULL
);

-- ============================================================================
-- SCHEDULING & MAINTENANCE TABLES
-- ============================================================================

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'recurring', 'one-time'
    start_time TIME,
    end_time TIME,
    days_of_week TEXT, -- JSON array of days (0=Sunday, 1=Monday, etc.)
    start_date DATE,
    end_date DATE,
    timezone TEXT DEFAULT 'UTC',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Backup configurations
CREATE TABLE IF NOT EXISTS backup_configs (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'full', 'config', 'log'
    destination TEXT NOT NULL, -- 'local', 'ftp', 'sftp', 'scp'
    destination_path TEXT,
    schedule_id INTEGER,
    retention_days INTEGER DEFAULT 30,
    encryption_enabled BOOLEAN DEFAULT TRUE,
    compression_enabled BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'enabled',
    last_backup DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
);

-- ============================================================================
-- CLOUD & ENTRY TABLES
-- ============================================================================

-- Cloud connections
CREATE TABLE IF NOT EXISTS cloud_connections (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    cloud_type TEXT NOT NULL, -- 'enterprise_cloud', 'aws', 'azure', 'gcp'
    status TEXT NOT NULL DEFAULT 'disconnected',
    api_key TEXT, -- encrypted
    api_secret TEXT, -- encrypted
    region TEXT,
    account_id TEXT,
    last_sync DATETIME,
    sync_interval INTEGER DEFAULT 3600, -- in seconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entry connections (formerly Security Fabric)
CREATE TABLE IF NOT EXISTS entry_connections (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    device_type TEXT NOT NULL, -- 'gateway', 'switch', 'access_point', 'analyzer'
    device_ip TEXT NOT NULL,
    device_serial TEXT,
    status TEXT NOT NULL DEFAULT 'disconnected',
    authorization_key TEXT, -- encrypted
    last_heartbeat DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIRTUALIZATION TABLES
-- ============================================================================

-- Virtual machines
CREATE TABLE IF NOT EXISTS virtual_machines (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    vm_type TEXT NOT NULL, -- 'gateway-vm', 'manager-vm', 'analyzer-vm'
    status TEXT NOT NULL DEFAULT 'stopped', -- 'running', 'stopped', 'paused', 'error'
    cpu_cores INTEGER DEFAULT 1,
    memory_mb INTEGER DEFAULT 1024,
    disk_size_gb INTEGER DEFAULT 10,
    ip_address TEXT,
    hostname TEXT,
    license_key TEXT, -- encrypted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_cpu ON system_metrics(cpu_usage);
CREATE INDEX IF NOT EXISTS idx_system_metrics_memory ON system_metrics(memory_usage);

-- Log indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_timestamp ON traffic_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_src_ip ON traffic_logs(src_ip);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_dst_ip ON traffic_logs(dst_ip);
CREATE INDEX IF NOT EXISTS idx_threat_logs_timestamp ON threat_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_logs_severity ON threat_logs(severity);

-- Policy and security indexes
CREATE INDEX IF NOT EXISTS idx_firewall_policies_src_zone ON firewall_policies(src_zone_id);
CREATE INDEX IF NOT EXISTS idx_firewall_policies_dst_zone ON firewall_policies(dst_zone_id);
CREATE INDEX IF NOT EXISTS idx_firewall_policies_action ON firewall_policies(action);
CREATE INDEX IF NOT EXISTS idx_address_objects_type ON address_objects(type);
CREATE INDEX IF NOT EXISTS idx_service_objects_protocol ON service_objects(protocol);

-- VPN indexes
CREATE INDEX IF NOT EXISTS idx_vpn_tunnels_status ON vpn_tunnels(status);
CREATE INDEX IF NOT EXISTS idx_vpn_tunnels_type ON vpn_tunnels(type);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system configuration
INSERT OR IGNORE INTO system_config (id, hostname, serial_number, firmware_version, system_time, timezone, admin_email, contact_info, location, description) 
VALUES (1, 'Open-NGFW', 'NGW1234567890123', 'v7.4.0', CURRENT_TIMESTAMP, 'UTC', 'admin@open-ngfw.local', 'Network Administrator', 'Data Center', 'Open Next-Generation Firewall');

-- Insert default administrator
INSERT OR IGNORE INTO administrators (id, username, password_hash, full_name, email, role, status) 
VALUES (1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOeG', 'System Administrator', 'admin@open-ngfw.local', 'super_admin', 'active');

-- Insert default zones
INSERT OR IGNORE INTO network_zones (id, name, description) VALUES 
(1, 'WAN', 'External/Internet zone'),
(2, 'LAN', 'Internal/Local network zone'),
(3, 'DMZ', 'Demilitarized zone'),
(4, 'MGMT', 'Management network zone');

-- Insert default interfaces
INSERT OR IGNORE INTO network_interfaces (id, name, alias, interface_type, status, addressing_mode) VALUES 
(1, 'port1', 'WAN1', 'physical', 'Connected', 'Manual'),
(2, 'port2', 'LAN1', 'physical', 'Connected', 'Manual'),
(3, 'port3', 'DMZ1', 'physical', 'Connected', 'Manual'),
(4, 'port4', 'MGMT1', 'physical', 'Connected', 'Manual');

-- Insert default address objects
INSERT OR IGNORE INTO address_objects (id, name, type, value, comment) VALUES 
(1, 'any', 'wildcard', '0.0.0.0/0', 'Any IPv4 address'),
(2, 'all', 'wildcard', '::/0', 'Any IPv6 address'),
(3, 'localhost', 'host', '127.0.0.1', 'Localhost'),
(4, 'dns_servers', 'subnet', '8.8.8.8/32', 'Google DNS servers');

-- Insert default service objects
INSERT OR IGNORE INTO service_objects (id, name, protocol, dst_port, comment) VALUES 
(1, 'HTTP', 'tcp', '80', 'Hypertext Transfer Protocol'),
(2, 'HTTPS', 'tcp', '443', 'HTTP Secure'),
(3, 'SSH', 'tcp', '22', 'Secure Shell'),
(4, 'DNS', 'udp', '53', 'Domain Name System'),
(5, 'PING', 'icmp', NULL, 'Internet Control Message Protocol');

-- Insert default firewall policy
INSERT OR IGNORE INTO firewall_policies (id, policy_id, name, src_zone_id, dst_zone_id, src_address, dst_address, service, action, status, log_traffic) 
VALUES (1, 1, 'Default Deny', 1, 2, '["any"]', '["any"]', '["any"]', 'deny', 'enabled', TRUE);

-- Insert default licenses
INSERT OR IGNORE INTO system_licenses (id, license_type, license_key, status, expiry_date, features) VALUES 
(1, 'enterprise', 'ENT123456789012345', 'active', '2025-12-31', '["antivirus", "webfilter", "ips", "dlp"]'),
(2, 'cloud', 'CLD987654321098765', 'active', '2025-12-31', '["logging", "monitoring", "backup"]');

-- Firewall Rules Table for NGFW (SQLCipher compatible)
CREATE TABLE IF NOT EXISTS firewall_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    src_ip TEXT,
    dst_ip TEXT,
    src_port INTEGER,
    dst_port INTEGER,
    protocol TEXT,
    action TEXT NOT NULL, -- ACCEPT/DROP/REJECT
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 