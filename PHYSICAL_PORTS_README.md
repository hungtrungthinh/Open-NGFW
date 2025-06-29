# Physical Ethernet Port Detection

This document explains how the Open-NGFW firewall detects and identifies physical Ethernet ports on the system.

## Overview

The physical port detection system provides comprehensive hardware enumeration capabilities to identify, monitor, and manage physical network interfaces. It combines multiple Linux system interfaces to provide detailed information about network hardware.

## How It Works

### 1. PCI Device Scanning

The system uses `lspci` to scan for network controllers in the PCI bus:

```bash
lspci -nn -v
```

**What it detects:**
- Network controllers and Ethernet controllers
- Vendor and device IDs (e.g., `[8086:100e]` for Intel 82540EM)
- Hardware class information
- Device capabilities

**Example output:**
```
00:03.0 Ethernet controller [0200]: Intel Corporation 82540EM Gigabit Ethernet Controller [8086:100e] (rev 02)
```

### 2. Network Interface Enumeration

The system scans `/sys/class/net` to enumerate all network interfaces:

```bash
ls /sys/class/net/
```

**What it detects:**
- All network interfaces (physical and virtual)
- Interface names (eth0, eth1, etc.)
- Physical vs virtual interface distinction
- Interface status and capabilities

### 3. Hardware Mapping

The system maps network interfaces to physical hardware by:

1. **Device Symlink Analysis**: Following `/sys/class/net/{interface}/device` symlinks
2. **PCI Address Extraction**: Extracting PCI addresses from device paths
3. **Vendor/Device ID Mapping**: Matching PCI devices to network interfaces

### 4. Detailed Information Gathering

For each physical interface, the system gathers:

#### From `/sys/class/net/{interface}/`:
- **MAC Address**: `address` file
- **Carrier Status**: `carrier` file (0=down, 1=up)
- **Operational State**: `operstate` file
- **Speed**: `speed` file (in Mbps)
- **Duplex**: `duplex` file (half/full)
- **Statistics**: Various counters in `statistics/` directory

#### From `ethtool`:
- **Driver Information**: `ethtool -i {interface}`
- **Port Capabilities**: `ethtool {interface}`
- **Hardware Statistics**: `ethtool -S {interface}`

## Supported Hardware

### Vendor Detection

The system recognizes major network hardware vendors:

| Vendor ID | Vendor Name |
|-----------|-------------|
| 8086 | Intel Corporation |
| 10ec | Realtek Semiconductor Co., Ltd. |
| 14e4 | Broadcom Inc. |
| 1969 | Qualcomm Atheros |
| 15b3 | Mellanox Technologies |
| 1924 | Solarflare Communications |

### Device Recognition

Common network devices are automatically identified:

| Vendor | Device ID | Device Name |
|--------|-----------|-------------|
| Intel | 100e | 82540EM Gigabit Ethernet Controller |
| Intel | 100f | 82545EM Gigabit Ethernet Controller |
| Intel | 10d3 | 82574L Gigabit Network Connection |
| Realtek | 8168 | RTL8111/8168/8411 PCI Express Gigabit Ethernet Controller |
| Realtek | 8125 | RTL8125 2.5GbE Controller |
| Broadcom | 1657 | NetXtreme BCM5720 Gigabit Ethernet PCIe |
| Broadcom | 1684 | NetXtreme II BCM57810 10 Gigabit Ethernet |

## API Endpoints

### Get All Physical Ports
```http
GET /api/network/physical-ports
```

Returns complete hardware information including:
- Total port count
- Physical ports with detailed information
- Virtual interfaces
- PCI device mapping

### Get Port Summary
```http
GET /api/network/physical-ports/summary
```

Returns aggregated statistics:
- Ports by type (Ethernet, Fiber, Wireless)
- Ports by status (up/down)
- Ports by vendor (Intel, Realtek, Broadcom, etc.)

### Get Specific Port Details
```http
GET /api/network/physical-ports/{port_id}
```

Returns detailed information for a specific port:
- Hardware specifications
- Current status
- Performance metrics
- Driver information

### Get Port Statistics
```http
GET /api/network/physical-ports/{interface_name}/statistics
```

Returns real-time statistics:
- Packet counters
- Byte counters
- Error statistics
- Hardware-specific counters

## Data Structures

### PhysicalPort
```rust
pub struct PhysicalPort {
    pub port_id: String,
    pub interface_name: Option<String>,
    pub pci_address: Option<String>,
    pub vendor_id: Option<String>,
    pub device_id: Option<String>,
    pub vendor_name: Option<String>,
    pub device_name: Option<String>,
    pub speed: Option<String>,
    pub duplex: Option<String>,
    pub status: String,
    pub mac_address: Option<String>,
    pub link_detected: bool,
    pub carrier_up: bool,
    pub port_type: PortType,
    pub location: Option<String>,
}
```

### NetworkHardware
```rust
pub struct NetworkHardware {
    pub total_ports: usize,
    pub physical_ports: Vec<PhysicalPort>,
    pub virtual_interfaces: Vec<String>,
    pub pci_devices: HashMap<String, PciDevice>,
}
```

## Usage Examples

### Basic Detection
```rust
let network_manager = NetworkManager::new().await;
let hardware = network_manager.detect_physical_ports().await?;

println!("Found {} physical ports", hardware.total_ports);
for port in &hardware.physical_ports {
    println!("Port: {} - {} - {}", 
        port.interface_name.as_ref().unwrap_or(&"Unknown".to_string()),
        port.vendor_name.as_ref().unwrap_or(&"Unknown".to_string()),
        port.status);
}
```

### Real-time Monitoring
```rust
// Get port statistics
let stats = network_manager.get_port_statistics("eth0").await?;
println!("Interface eth0 statistics: {:?}", stats);

// Get port details
if let Some(port) = network_manager.get_port_details("eth0").await? {
    println!("Port status: {}", port.status);
    println!("Link detected: {}", port.link_detected);
    println!("Carrier up: {}", port.carrier_up);
}
```

## Demo Script

Run the physical port detection demo:

```bash
cargo run --example physical_ports_demo
```

This will:
1. Scan PCI devices for network controllers
2. Enumerate network interfaces
3. Map interfaces to physical hardware
4. Display detailed port information
5. Generate a summary report

## Requirements

### System Requirements
- Linux operating system
- Access to `/sys/class/net` (sysfs)
- Root or sufficient privileges for hardware access

### Required Tools
- `lspci` - PCI device enumeration
- `ethtool` - Network interface capabilities

### Installation
```bash
# Ubuntu/Debian
sudo apt-get install pciutils ethtool

# CentOS/RHEL
sudo yum install pciutils ethtool

# Arch Linux
sudo pacman -S pciutils ethtool
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```
   Error: Failed to run lspci: Permission denied
   ```
   **Solution**: Run with sudo or ensure proper permissions

2. **Tool Not Found**
   ```
   Warning: lspci not found
   ```
   **Solution**: Install pciutils package

3. **No Physical Interfaces Detected**
   ```
   Total physical ports: 0
   ```
   **Solution**: Check if running in virtual environment or container

4. **Incomplete Information**
   ```
   Vendor: Unknown Vendor (xxxx)
   ```
   **Solution**: Add vendor/device ID to recognition tables

### Debug Mode

Enable debug logging to see detailed detection process:

```bash
RUST_LOG=debug cargo run
```

## Performance Considerations

### Detection Speed
- **PCI Scanning**: ~10-50ms depending on system complexity
- **Interface Enumeration**: ~5-20ms
- **Hardware Mapping**: ~10-30ms per interface
- **Statistics Gathering**: ~5-15ms per interface

### Memory Usage
- **Per Port**: ~2-5KB of memory
- **PCI Device Cache**: ~1-3KB per device
- **Statistics Buffer**: ~1-2KB per interface

### Caching
The system implements intelligent caching:
- PCI device information cached for 60 seconds
- Interface status cached for 5 seconds
- Statistics cached for 1 second

## Security Considerations

### Access Control
- Requires system-level access to hardware information
- Should be restricted to authorized administrators
- Consider implementing API authentication

### Information Disclosure
- MAC addresses and hardware details may be sensitive
- Consider filtering sensitive information in logs
- Implement proper access controls

### Privilege Escalation
- Hardware detection requires elevated privileges
- Ensure proper input validation
- Implement rate limiting on API endpoints

## Future Enhancements

### Planned Features
1. **Hot-plug Detection**: Real-time detection of new interfaces
2. **Performance Monitoring**: Historical statistics and trends
3. **Hardware Health**: Temperature, power consumption monitoring
4. **Advanced Capabilities**: SR-IOV, DPDK support
5. **Cloud Integration**: Hardware inventory synchronization

### Extensibility
The system is designed for easy extension:
- Add new vendor/device recognition
- Implement custom statistics gathering
- Support additional hardware types
- Integrate with monitoring systems

## Contributing

To add support for new hardware:

1. **Add Vendor Recognition**:
   ```rust
   match vendor_id {
       "xxxx" => "New Vendor Name".to_string(),
       // ... existing cases
   }
   ```

2. **Add Device Recognition**:
   ```rust
   match (vendor_id, device_id) {
       ("xxxx", "yyyy") => "New Device Name".to_string(),
       // ... existing cases
   }
   ```

3. **Test with Real Hardware**:
   ```bash
   cargo test physical_ports
   ```

## License

This physical port detection system is part of the Open-NGFW project and is licensed under the MIT License. 