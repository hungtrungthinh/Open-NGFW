# Open-NGFW Database Architecture

## Overview

The Open-NGFW project uses SQLite with SQLCipher for AES-256 encrypted storage, providing a secure, embedded database solution suitable for firewall appliances. The database is designed to handle all firewall operations, user management, security policies, monitoring, and logging.

## Database Technology Stack

- **Database Engine**: SQLite 3.x
- **Encryption**: SQLCipher (AES-256)
- **Rust Integration**: rusqlite + bundled-sqlcipher
- **Migration Tool**: Custom Rust-based migrations
- **Backup**: Encrypted database files with compression

## Database Schema Design

### 1. Core System Tables

#### `system_config`
- **Purpose**: Stores basic system configuration
- **Key Fields**: hostname, serial_number, firmware_version, system_time
- **Relationships**: Referenced by all other tables for system identification
- **Encryption**: Not encrypted (public system info)

#### `system_licenses`
- **Purpose**: Manages software licenses and feature entitlements
- **Key Fields**: license_type, license_key, status, expiry_date, features
- **Encryption**: License keys are encrypted
- **Features**: JSON array of enabled features

#### `system_metrics`
- **Purpose**: Time-series performance data
- **Key Fields**: timestamp, cpu_usage, memory_usage, disk_usage, active_sessions
- **Indexing**: Heavy indexing on timestamp for performance
- **Retention**: Configurable retention policy

### 2. User Management Tables

#### `administrators`
- **Purpose**: User account management
- **Key Fields**: username, password_hash, role, status, last_login
- **Security**: Passwords hashed with bcrypt, login attempt tracking
- **Roles**: super_admin, admin, readonly

#### `user_groups` & `user_group_assignments`
- **Purpose**: Role-based access control
- **Key Fields**: name, permissions (JSON), user assignments
- **Permissions**: JSON object defining granular permissions

### 3. Network Infrastructure Tables

#### `network_interfaces`
- **Purpose**: Physical and virtual interface management
- **Key Fields**: name, type, status, ip_address, zone_id
- **Types**: physical, vlan, aggregate, tunnel
- **Zones**: Security zone assignments

#### `network_zones`
- **Purpose**: Security zone definitions
- **Key Fields**: name, description, interface_count
- **Usage**: Used in firewall policies for traffic control

#### `vlan_configs`
- **Purpose**: VLAN configuration management
- **Key Fields**: vlan_id, name, interface_id, ip_address
- **Relationships**: Links to network_interfaces

### 4. Firewall & Security Tables

#### `firewall_policies`
- **Purpose**: Core firewall rule definitions
- **Key Fields**: policy_id, src_zone_id, dst_zone_id, action, status
- **Addresses**: JSON arrays for source/destination addresses
- **Services**: JSON array of service objects
- **Actions**: accept, deny, ipsec

#### `address_objects` & `address_groups`
- **Purpose**: Network address management
- **Types**: subnet, host, range, fqdn, wildcard
- **Groups**: Logical grouping of addresses for policies

#### `service_objects` & `service_groups`
- **Purpose**: Protocol and port definitions
- **Protocols**: tcp, udp, icmp, icmp6
- **Ports**: Single port or port ranges
- **Groups**: Logical grouping of services

### 5. VPN Tables

#### `vpn_tunnels`
- **Purpose**: VPN tunnel configuration
- **Types**: ipsec, ssl, l2tp, pptp
- **Security**: Pre-shared keys and certificates encrypted
- **Monitoring**: Status tracking and connection monitoring

#### `vpn_certificates`
- **Purpose**: Certificate management for VPN
- **Types**: CA, local, remote certificates
- **Encryption**: Certificate data and private keys encrypted
- **Validation**: Expiry date tracking

### 6. Security Profiles Tables

#### Security Profile Tables
- **antivirus_profiles**: Virus scanning configuration
- **webfilter_profiles**: Web content filtering
- **app_control_profiles**: Application control
- **ips_profiles**: Intrusion prevention
- **dlp_profiles**: Data loss prevention

Each profile table includes:
- Status (enabled/disabled)
- Default actions (block/allow/monitor)
- Profile-specific settings

### 7. Monitoring & Logging Tables

#### `system_logs`
- **Purpose**: System event logging
- **Levels**: emergency, alert, critical, error, warning, notice, info, debug
- **Facilities**: kernel, user, mail, daemon, auth, etc.
- **Indexing**: Heavy indexing for fast log retrieval

#### `traffic_logs`
- **Purpose**: Network traffic logging
- **Fields**: src_ip, dst_ip, protocol, action, bytes, packets
- **Performance**: Partitioned by date for performance
- **Retention**: Configurable retention policies

#### `threat_logs`
- **Purpose**: Security threat logging
- **Types**: virus, intrusion, spam, phishing, malware
- **Severity**: low, medium, high, critical
- **Actions**: blocked, quarantined, allowed, monitored

### 8. Scheduling & Maintenance Tables

#### `schedules`
- **Purpose**: Time-based scheduling
- **Types**: recurring, one-time
- **Usage**: Used by policies, backups, maintenance tasks

#### `backup_configs`
- **Purpose**: Backup configuration management
- **Types**: full, config, log backups
- **Destinations**: local, ftp, sftp, scp
- **Security**: Encryption and compression options

### 9. Cloud & Entry Tables

#### `cloud_connections`
- **Purpose**: Cloud service integration
- **Types**: enterprise_cloud, aws, azure, gcp
- **Security**: API keys encrypted
- **Sync**: Automated synchronization

#### `entry_connections`
- **Purpose**: Entry device management (formerly Security Fabric)
- **Types**: gateway, switch, access_point, analyzer
- **Monitoring**: Heartbeat and status tracking

### 10. Virtualization Tables

#### `virtual_machines`
- **Purpose**: VM management and monitoring
- **Types**: gateway-vm, manager-vm, analyzer-vm
- **Resources**: CPU, memory, disk allocation
- **Licensing**: License key management

## Data Relationships

### Primary Relationships
1. **Zones → Interfaces**: One zone can have multiple interfaces
2. **Policies → Zones**: Policies reference source and destination zones
3. **Policies → Addresses**: Policies use address objects/groups
4. **Policies → Services**: Policies use service objects/groups
5. **Users → Groups**: Many-to-many relationship through assignments
6. **Logs → Policies**: Logs reference policies for correlation

### Foreign Key Constraints
- All foreign keys have appropriate CASCADE/SET NULL rules
- Ensures data integrity and prevents orphaned records
- Maintains referential integrity across the database

## Security Considerations

### Encryption
- **Database Level**: AES-256 encryption via SQLCipher
- **Field Level**: Sensitive data (passwords, keys, certificates) encrypted
- **Key Management**: Database encryption key stored securely
- **Backup Encryption**: All backups encrypted

### Access Control
- **Database Access**: Limited to application process
- **User Authentication**: bcrypt password hashing
- **Session Management**: Secure session handling
- **Audit Logging**: All administrative actions logged

### Data Protection
- **PII Handling**: Minimal PII storage, encrypted when necessary
- **Log Anonymization**: Optional log data anonymization
- **Retention Policies**: Configurable data retention
- **Secure Deletion**: Secure data deletion procedures

## Performance Optimization

### Indexing Strategy
- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Indexed for join performance
- **Time-based Queries**: Heavy indexing on timestamp fields
- **Search Fields**: Indexed on frequently searched fields

### Query Optimization
- **Prepared Statements**: All queries use prepared statements
- **Connection Pooling**: Efficient connection management
- **Batch Operations**: Bulk insert/update operations
- **Read/Write Separation**: Separate read/write operations

### Storage Optimization
- **Data Types**: Appropriate data types for each field
- **Compression**: Optional data compression
- **Partitioning**: Log tables partitioned by date
- **Cleanup**: Automated cleanup of old data

## Backup and Recovery

### Backup Strategy
- **Full Backups**: Complete database backups
- **Incremental Backups**: Delta backups for efficiency
- **Configuration Backups**: Separate config backups
- **Log Backups**: Separate log data backups

### Recovery Procedures
- **Point-in-Time Recovery**: Restore to specific timestamp
- **Configuration Recovery**: Restore specific configurations
- **Log Recovery**: Restore log data for analysis
- **Disaster Recovery**: Complete system recovery procedures

## Migration and Versioning

### Schema Versioning
- **Version Tracking**: Database schema version tracking
- **Migration Scripts**: Automated migration scripts
- **Rollback Support**: Ability to rollback migrations
- **Data Validation**: Post-migration data validation

### Upgrade Procedures
- **Backup First**: Always backup before upgrades
- **Staged Upgrades**: Multi-stage upgrade process
- **Validation**: Post-upgrade validation procedures
- **Rollback Plan**: Rollback procedures if needed

## Monitoring and Maintenance

### Database Monitoring
- **Size Monitoring**: Database size tracking
- **Performance Monitoring**: Query performance tracking
- **Integrity Checks**: Regular integrity verification
- **Health Checks**: Automated health monitoring

### Maintenance Tasks
- **Vacuum**: Regular database optimization
- **Index Rebuilding**: Periodic index maintenance
- **Log Rotation**: Automated log rotation
- **Cleanup**: Automated data cleanup

## Integration Points

### API Integration
- **REST API**: All database operations via REST API
- **GraphQL**: Optional GraphQL interface
- **WebSocket**: Real-time updates via WebSocket
- **CLI**: Command-line interface for administration

### External Systems
- **LDAP/AD**: User authentication integration
- **SIEM**: Security information and event management
- **Backup Systems**: Integration with backup infrastructure
- **Monitoring**: Integration with monitoring systems

## Future Considerations

### Scalability
- **Horizontal Scaling**: Multi-node deployment support
- **Load Balancing**: Database load balancing
- **Caching**: Application-level caching
- **CDN**: Content delivery network integration

### Advanced Features
- **Machine Learning**: ML-based threat detection
- **AI Integration**: AI-powered security features
- **IoT Support**: Internet of Things device management
- **Cloud Native**: Cloud-native deployment support 