use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Arc;
use std::collections::HashMap;
use tokio::sync::RwLock;
use std::fs;
use std::path::Path;

/// WAN connection types supported by the firewall
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum WanType {
    PPPoE,
    Static,
    DHCP,
}

/// WAN configuration parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WanConfig {
    pub wan_type: WanType,
    pub interface: String,
    // PPPoE configuration
    pub username: Option<String>,
    pub password: Option<String>,
    // Static IP configuration
    pub static_ip: Option<String>,
    pub static_netmask: Option<String>,
    pub static_gateway: Option<String>,
    pub static_dns: Option<String>,
}

/// Current WAN connection status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WanStatus {
    pub connected: bool,
    pub wan_type: WanType,
    pub interface: String,
    pub ip: Option<String>,
    pub gateway: Option<String>,
    pub dns: Option<String>,
    pub message: Option<String>,
}

/// Physical Ethernet port information
#[derive(Debug, Clone, Serialize, Deserialize)]
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

/// Types of network ports
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PortType {
    Ethernet,
    Fiber,
    Wireless,
    Virtual,
    Unknown,
}

/// Hardware information for network interfaces
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkHardware {
    pub total_ports: usize,
    pub physical_ports: Vec<PhysicalPort>,
    pub virtual_interfaces: Vec<String>,
    pub pci_devices: HashMap<String, PciDevice>,
}

/// PCI device information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PciDevice {
    pub address: String,
    pub vendor_id: String,
    pub device_id: String,
    pub vendor_name: String,
    pub device_name: String,
    pub class: String,
    pub subclass: String,
    pub driver: Option<String>,
    pub interfaces: Vec<String>,
}

/// Network manager for handling WAN connections
pub struct NetworkManager {
    pub config: Arc<RwLock<WanConfig>>,
    pub status: Arc<RwLock<WanStatus>>,
}

impl NetworkManager {
    /// Create a new network manager with default DHCP configuration
    pub async fn new() -> Self {
        let config = WanConfig {
            wan_type: WanType::DHCP,
            interface: "eth0".to_string(),
            username: None,
            password: None,
            static_ip: None,
            static_netmask: None,
            static_gateway: None,
            static_dns: None,
        };
        let status = WanStatus {
            connected: false,
            wan_type: WanType::DHCP,
            interface: "eth0".to_string(),
            ip: None,
            gateway: None,
            dns: None,
            message: None,
        };
        Self {
            config: Arc::new(RwLock::new(config)),
            status: Arc::new(RwLock::new(status)),
        }
    }

    /// Update WAN configuration
    pub async fn set_config(&self, config: WanConfig) {
        let mut cfg = self.config.write().await;
        *cfg = config;
    }

    /// Get current WAN configuration
    pub async fn get_config(&self) -> WanConfig {
        self.config.read().await.clone()
    }

    /// Get current WAN status
    pub async fn get_status(&self) -> WanStatus {
        self.status.read().await.clone()
    }

    /// Establish WAN connection based on current configuration
    pub async fn connect(&self) -> anyhow::Result<()> {
        let cfg = self.config.read().await.clone();
        let mut status = self.status.write().await;
        status.wan_type = cfg.wan_type.clone();
        status.interface = cfg.interface.clone();
        match cfg.wan_type {
            WanType::PPPoE => {
                // Call pppoe-start command (Linux)
                if let (Some(_user), Some(_pass)) = (cfg.username, cfg.password) {
                    // TODO: Write PPPoE config file, call pppoe-start command
                    let output = Command::new("pppoe-start").output();
                    status.connected = output.is_ok();
                    status.message = Some("Called pppoe-start".to_string());
                } else {
                    status.connected = false;
                    status.message = Some("Missing PPPoE username/password".to_string());
                }
            }
            WanType::Static => {
                // Call ip addr add, ip route add commands
                if let (Some(ip), Some(mask), Some(gw)) = (cfg.static_ip, cfg.static_netmask, cfg.static_gateway) {
                    let _ = Command::new("ip").args(["addr", "flush", "dev", &cfg.interface]).output();
                    let _ = Command::new("ip").args(["addr", "add", &format!("{}/{}", ip, mask), "dev", &cfg.interface]).output();
                    let _ = Command::new("ip").args(["route", "add", "default", "via", &gw, "dev", &cfg.interface]).output();
                    if let Some(ref dns) = cfg.static_dns {
                        let _ = std::fs::write("/etc/resolv.conf", format!("nameserver {}\n", dns));
                    }
                    status.connected = true;
                    status.ip = Some(ip);
                    status.gateway = Some(gw);
                    status.dns = cfg.static_dns;
                    status.message = Some("Static IP configured".to_string());
                } else {
                    status.connected = false;
                    status.message = Some("Missing static IP information".to_string());
                }
            }
            WanType::DHCP => {
                // Call dhclient command
                let output = Command::new("dhclient").arg(&cfg.interface).output();
                status.connected = output.is_ok();
                status.message = Some("Called dhclient".to_string());
            }
        }
        Ok(())
    }

    /// Disconnect WAN connection
    pub async fn disconnect(&self) -> anyhow::Result<()> {
        let cfg = self.config.read().await.clone();
        let mut status = self.status.write().await;
        match cfg.wan_type {
            WanType::PPPoE => {
                let _ = Command::new("pppoe-stop").output();
                status.connected = false;
                status.message = Some("PPPoE disconnected".to_string());
            }
            WanType::Static => {
                let _ = Command::new("ip").args(["addr", "flush", "dev", &cfg.interface]).output();
                status.connected = false;
                status.message = Some("Static IP disconnected".to_string());
            }
            WanType::DHCP => {
                let _ = Command::new("dhclient").args(["-r", &cfg.interface]).output();
                status.connected = false;
                status.message = Some("DHCP disconnected".to_string());
            }
        }
        Ok(())
    }

    /// Detect all physical Ethernet ports on the system
    pub async fn detect_physical_ports(&self) -> anyhow::Result<NetworkHardware> {
        let mut hardware = NetworkHardware {
            total_ports: 0,
            physical_ports: Vec::new(),
            virtual_interfaces: Vec::new(),
            pci_devices: HashMap::new(),
        };

        // 1. Scan PCI devices for network controllers
        self.scan_pci_devices(&mut hardware).await?;

        // 2. Scan /sys/class/net for interfaces
        self.scan_network_interfaces(&mut hardware).await?;

        // 3. Map interfaces to physical ports
        self.map_interfaces_to_ports(&mut hardware).await?;

        // 4. Get detailed port information
        self.get_port_details_with_ethtool(&mut hardware).await?;

        hardware.total_ports = hardware.physical_ports.len();
        Ok(hardware)
    }

    /// Scan PCI devices for network controllers
    async fn scan_pci_devices(&self, hardware: &mut NetworkHardware) -> anyhow::Result<()> {
        // Use lspci to get PCI device information
        let output = Command::new("lspci")
            .args(["-nn", "-v"])
            .output()
            .map_err(|e| anyhow::anyhow!("Failed to run lspci: {}", e))?;

        let output_str = String::from_utf8_lossy(&output.stdout);
        
        for line in output_str.lines() {
            if line.contains("Network controller") || line.contains("Ethernet controller") {
                if let Some(device) = self.parse_pci_line(line) {
                    hardware.pci_devices.insert(device.address.clone(), device);
                }
            }
        }

        Ok(())
    }

    /// Parse a single PCI device line
    fn parse_pci_line(&self, line: &str) -> Option<PciDevice> {
        // Example line: "00:03.0 Ethernet controller [0200]: Intel Corporation 82540EM Gigabit Ethernet Controller [8086:100e] (rev 02)"
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 4 {
            return None;
        }

        let address = parts[0].to_string();
        
        // Extract vendor and device IDs from [xxxx:xxxx] format
        let mut vendor_id = String::new();
        let mut device_id = String::new();
        
        for part in &parts {
            if part.starts_with('[') && part.contains(':') && part.ends_with(']') {
                let ids = part.trim_matches('[').trim_matches(']');
                let id_parts: Vec<&str> = ids.split(':').collect();
                if id_parts.len() == 2 {
                    vendor_id = id_parts[0].to_string();
                    device_id = id_parts[1].to_string();
                    break;
                }
            }
        }

        // Get vendor and device names
        let vendor_name = self.get_vendor_name(&vendor_id);
        let device_name = self.get_device_name(&vendor_id, &device_id);

        Some(PciDevice {
            address,
            vendor_id,
            device_id,
            vendor_name,
            device_name,
            class: "0200".to_string(), // Network controller class
            subclass: "00".to_string(),
            driver: None,
            interfaces: Vec::new(),
        })
    }

    /// Get vendor name from vendor ID
    fn get_vendor_name(&self, vendor_id: &str) -> String {
        match vendor_id {
            "8086" => "Intel Corporation".to_string(),
            "10ec" => "Realtek Semiconductor Co., Ltd.".to_string(),
            "14e4" => "Broadcom Inc.".to_string(),
            "1969" => "Qualcomm Atheros".to_string(),
            "15b3" => "Mellanox Technologies".to_string(),
            "1924" => "Solarflare Communications".to_string(),
            _ => format!("Unknown Vendor ({})", vendor_id),
        }
    }

    /// Get device name from vendor and device IDs
    fn get_device_name(&self, vendor_id: &str, device_id: &str) -> String {
        match (vendor_id, device_id) {
            ("8086", "100e") => "82540EM Gigabit Ethernet Controller".to_string(),
            ("8086", "100f") => "82545EM Gigabit Ethernet Controller".to_string(),
            ("8086", "10d3") => "82574L Gigabit Network Connection".to_string(),
            ("10ec", "8168") => "RTL8111/8168/8411 PCI Express Gigabit Ethernet Controller".to_string(),
            ("10ec", "8125") => "RTL8125 2.5GbE Controller".to_string(),
            ("14e4", "1657") => "NetXtreme BCM5720 Gigabit Ethernet PCIe".to_string(),
            ("14e4", "1684") => "NetXtreme II BCM57810 10 Gigabit Ethernet".to_string(),
            _ => format!("Unknown Device ({})", device_id),
        }
    }

    /// Scan network interfaces from /sys/class/net
    async fn scan_network_interfaces(&self, hardware: &mut NetworkHardware) -> anyhow::Result<()> {
        let net_path = Path::new("/sys/class/net");
        if !net_path.exists() {
            return Ok(());
        }

        for entry in fs::read_dir(net_path)? {
            let entry = entry?;
            let interface_name = entry.file_name().to_string_lossy().to_string();
            
            // Skip loopback and virtual interfaces
            if interface_name == "lo" || interface_name.starts_with("veth") || 
               interface_name.starts_with("docker") || interface_name.starts_with("br-") {
                hardware.virtual_interfaces.push(interface_name);
                continue;
            }

            // Check if this is a physical interface
            let device_path = entry.path().join("device");
            if device_path.exists() {
                // This is likely a physical interface
                let mut port = PhysicalPort {
                    port_id: interface_name.clone(),
                    interface_name: Some(interface_name.clone()),
                    pci_address: None,
                    vendor_id: None,
                    device_id: None,
                    vendor_name: None,
                    device_name: None,
                    speed: None,
                    duplex: None,
                    status: "unknown".to_string(),
                    mac_address: None,
                    link_detected: false,
                    carrier_up: false,
                    port_type: PortType::Ethernet,
                    location: None,
                };

                // Get interface details
                self.get_interface_details(&mut port, &entry.path()).await?;
                hardware.physical_ports.push(port);
            }
        }

        Ok(())
    }

    /// Get detailed information for a network interface
    async fn get_interface_details(&self, port: &mut PhysicalPort, interface_path: &Path) -> anyhow::Result<()> {
        // Get MAC address
        if let Ok(mac) = fs::read_to_string(interface_path.join("address")) {
            port.mac_address = Some(mac.trim().to_string());
        }

        // Get carrier status
        if let Ok(carrier) = fs::read_to_string(interface_path.join("carrier")) {
            port.carrier_up = carrier.trim() == "1";
        }

        // Get link status
        if let Ok(operstate) = fs::read_to_string(interface_path.join("operstate")) {
            port.status = operstate.trim().to_string();
            port.link_detected = port.status == "up";
        }

        // Get speed information
        if let Ok(speed) = fs::read_to_string(interface_path.join("speed")) {
            port.speed = Some(speed.trim().to_string());
        }

        // Get duplex information
        if let Ok(duplex) = fs::read_to_string(interface_path.join("duplex")) {
            port.duplex = Some(duplex.trim().to_string());
        }

        // Try to get PCI address from device symlink
        let device_path = interface_path.join("device");
        if device_path.exists() {
            if let Ok(device_link) = fs::read_link(&device_path) {
                if let Some(device_name) = device_link.file_name() {
                    let device_str = device_name.to_string_lossy();
                    if device_str.contains(':') {
                        port.pci_address = Some(device_str.to_string());
                    }
                }
            }
        }

        Ok(())
    }

    /// Map network interfaces to physical ports
    async fn map_interfaces_to_ports(&self, hardware: &mut NetworkHardware) -> anyhow::Result<()> {
        for port in &mut hardware.physical_ports {
            if let Some(ref pci_addr) = port.pci_address {
                if let Some(pci_device) = hardware.pci_devices.get(pci_addr) {
                    port.vendor_id = Some(pci_device.vendor_id.clone());
                    port.device_id = Some(pci_device.device_id.clone());
                    port.vendor_name = Some(pci_device.vendor_name.clone());
                    port.device_name = Some(pci_device.device_name.clone());
                    
                    // Add interface to PCI device
                    if let Some(ref interface_name) = port.interface_name {
                        hardware.pci_devices.get_mut(pci_addr)
                            .map(|device| device.interfaces.push(interface_name.clone()));
                    }
                }
            }
        }

        Ok(())
    }

    /// Get detailed port information using ethtool
    async fn get_port_details_with_ethtool(&self, hardware: &mut NetworkHardware) -> anyhow::Result<()> {
        for port in &mut hardware.physical_ports {
            if let Some(ref interface_name) = port.interface_name {
                // Get driver information
                if let Ok(output) = Command::new("ethtool")
                    .args(["-i", interface_name])
                    .output() {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    for line in output_str.lines() {
                        if line.starts_with("driver:") {
                            let driver = line.split(':').nth(1).unwrap_or("").trim();
                            if let Some(ref pci_addr) = port.pci_address {
                                if let Some(pci_device) = hardware.pci_devices.get_mut(pci_addr) {
                                    pci_device.driver = Some(driver.to_string());
                                }
                            }
                            break;
                        }
                    }
                }

                // Get port capabilities and max speed/type
                if let Ok(output) = Command::new("ethtool")
                    .args([interface_name])
                    .output() {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    let mut found_port = false;
                    let mut found_supported = false;
                    let mut found_link_modes = false;
                    let mut max_speed: Option<&str> = None;
                    let mut max_speed_val: u32 = 0;
                    for line in output_str.lines() {
                        // Port type (RJ45/SFP)
                        if line.starts_with("Port:") {
                            found_port = true;
                            if line.contains("TP") {
                                port.port_type = PortType::Ethernet;
                            } else if line.contains("FIBRE") {
                                port.port_type = PortType::Fiber;
                            }
                        }
                        // Supported ports (legacy)
                        if line.contains("Supported ports:") {
                            found_supported = true;
                            if line.contains("TP") {
                                port.port_type = PortType::Ethernet;
                            } else if line.contains("FIBRE") {
                                port.port_type = PortType::Fiber;
                            }
                        }
                        // Supported link modes (detect max speed)
                        if line.contains("Supported link modes:") {
                            found_link_modes = true;
                        }
                        if found_link_modes && (line.contains("baseT") || line.contains("baseX") || line.contains("baseSR") || line.contains("baseLR") || line.contains("baseCR") || line.contains("baseKR") || line.contains("baseCX4") || line.contains("baseSR4") || line.contains("baseLR4")) {
                            // RJ45
                            if line.contains("100000baseT") { if max_speed_val < 100 { max_speed = Some("100GbE"); max_speed_val = 100; } port.port_type = PortType::Ethernet; }
                            else if line.contains("40000baseT") { if max_speed_val < 40 { max_speed = Some("40GbE"); max_speed_val = 40; } port.port_type = PortType::Ethernet; }
                            else if line.contains("25000baseT") { if max_speed_val < 25 { max_speed = Some("25GbE"); max_speed_val = 25; } port.port_type = PortType::Ethernet; }
                            else if line.contains("10000baseT") { if max_speed_val < 10 { max_speed = Some("10GbE"); max_speed_val = 10; } port.port_type = PortType::Ethernet; }
                            else if line.contains("5000baseT") { if max_speed_val < 5 { max_speed = Some("5GbE"); max_speed_val = 5; } port.port_type = PortType::Ethernet; }
                            else if line.contains("2500baseT") { if max_speed_val < 2 { max_speed = Some("2.5GbE"); max_speed_val = 2; } port.port_type = PortType::Ethernet; }
                            else if line.contains("1000baseT") { if max_speed_val < 1 { max_speed = Some("1GbE"); max_speed_val = 1; } port.port_type = PortType::Ethernet; }
                            // SFP/SFP+/SFP28/QSFP+/QSFP28
                            if line.contains("100000base") { if max_speed_val < 100 { max_speed = Some("100GbE"); max_speed_val = 100; } port.port_type = PortType::Fiber; }
                            else if line.contains("40000base") { if max_speed_val < 40 { max_speed = Some("40GbE"); max_speed_val = 40; } port.port_type = PortType::Fiber; }
                            else if line.contains("25000base") { if max_speed_val < 25 { max_speed = Some("25GbE"); max_speed_val = 25; } port.port_type = PortType::Fiber; }
                            else if line.contains("10000base") { if max_speed_val < 10 { max_speed = Some("10GbE"); max_speed_val = 10; } port.port_type = PortType::Fiber; }
                            else if line.contains("1000baseX") { if max_speed_val < 1 { max_speed = Some("1GbE"); max_speed_val = 1; } port.port_type = PortType::Fiber; }
                        }
                        // End of Supported link modes block
                        if found_link_modes && line.trim().is_empty() {
                            found_link_modes = false;
                        }
                    }
                    if let Some(speed) = max_speed {
                        port.speed = Some(speed.to_string());
                    }
                    // Nếu không phát hiện được, fallback sang /sys/class/net speed
                }
            }
        }
        Ok(())
    }

    /// Get summary of physical ports
    pub async fn get_physical_ports_summary(&self) -> anyhow::Result<serde_json::Value> {
        let hardware = self.detect_physical_ports().await?;
        
        let summary = serde_json::json!({
            "total_physical_ports": hardware.total_ports,
            "ports_by_type": {
                "ethernet": hardware.physical_ports.iter().filter(|p| p.port_type == PortType::Ethernet).count(),
                "fiber": hardware.physical_ports.iter().filter(|p| p.port_type == PortType::Fiber).count(),
                "wireless": hardware.physical_ports.iter().filter(|p| p.port_type == PortType::Wireless).count(),
            },
            "ports_by_status": {
                "up": hardware.physical_ports.iter().filter(|p| p.carrier_up).count(),
                "down": hardware.physical_ports.iter().filter(|p| !p.carrier_up).count(),
            },
            "ports_by_vendor": {
                "intel": hardware.physical_ports.iter().filter(|p| p.vendor_name.as_ref().map_or(false, |v| v.contains("Intel"))).count(),
                "realtek": hardware.physical_ports.iter().filter(|p| p.vendor_name.as_ref().map_or(false, |v| v.contains("Realtek"))).count(),
                "broadcom": hardware.physical_ports.iter().filter(|p| p.vendor_name.as_ref().map_or(false, |v| v.contains("Broadcom"))).count(),
                "other": hardware.physical_ports.iter().filter(|p| p.vendor_name.as_ref().map_or(true, |v| !v.contains("Intel") && !v.contains("Realtek") && !v.contains("Broadcom"))).count(),
            },
            "ports": hardware.physical_ports,
            "pci_devices": hardware.pci_devices,
        });

        Ok(summary)
    }

    /// Get detailed information for a specific port
    pub async fn get_port_details(&self, port_id: &str) -> anyhow::Result<Option<PhysicalPort>> {
        let hardware = self.detect_physical_ports().await?;
        
        for port in hardware.physical_ports {
            if port.port_id == port_id || port.interface_name.as_ref().map_or(false, |name| name == port_id) {
                return Ok(Some(port));
            }
        }

        Ok(None)
    }

    /// Get real-time statistics for a port
    pub async fn get_port_statistics(&self, interface_name: &str) -> anyhow::Result<serde_json::Value> {
        let mut stats = serde_json::Map::new();

        // Read interface statistics from /sys/class/net
        let stats_path = format!("/sys/class/net/{}/statistics", interface_name);
        
        if let Ok(entries) = fs::read_dir(stats_path) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let stat_name = entry.file_name().to_string_lossy().to_string();
                    if let Ok(value) = fs::read_to_string(entry.path()) {
                        if let Ok(num_value) = value.trim().parse::<u64>() {
                            stats.insert(stat_name, serde_json::Value::Number(num_value.into()));
                        }
                    }
                }
            }
        }

        // Get additional information using ethtool
        if let Ok(output) = Command::new("ethtool")
            .args(["-S", interface_name])
            .output() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                if line.contains(':') {
                    let parts: Vec<&str> = line.split(':').collect();
                    if parts.len() == 2 {
                        let stat_name = parts[0].trim();
                        if let Ok(value) = parts[1].trim().parse::<u64>() {
                            stats.insert(format!("ethtool_{}", stat_name), serde_json::Value::Number(value.into()));
                        }
                    }
                }
            }
        }

        Ok(serde_json::Value::Object(stats))
    }
} 