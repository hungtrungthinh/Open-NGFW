use std::process::Command;
use std::fs;
use std::path::Path;
use serde_json::json;

/// Demo script to show how physical Ethernet ports are detected
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    println!("🔌 Physical Ethernet Port Detection Demo");
    println!("========================================");
    
    // 1. Check if we're running on Linux
    if !Path::new("/sys/class/net").exists() {
        println!("❌ This demo requires Linux with /sys/class/net");
        println!("   The physical port detection uses Linux sysfs interface");
        return Ok(());
    }

    // 2. Check for required tools
    let required_tools = ["lspci", "ethtool"];
    for tool in &required_tools {
        if Command::new(tool).arg("--version").output().is_err() {
            println!("⚠️  Warning: {} not found. Some features may not work.", tool);
        }
    }

    println!("\n📋 Step 1: Scanning PCI devices for network controllers...");
    scan_pci_devices().await?;

    println!("\n📋 Step 2: Scanning network interfaces...");
    scan_network_interfaces().await?;

    println!("\n📋 Step 3: Getting detailed port information...");
    get_port_details().await?;

    println!("\n📋 Step 4: Generating summary report...");
    generate_summary_report().await?;

    println!("\n✅ Demo completed successfully!");
    println!("\n💡 Key points about physical port detection:");
    println!("   • Uses /sys/class/net for interface enumeration");
    println!("   • Uses lspci for PCI device information");
    println!("   • Uses ethtool for detailed port capabilities");
    println!("   • Maps interfaces to physical hardware");
    println!("   • Provides real-time statistics and status");

    Ok(())
}

/// Scan PCI devices for network controllers
async fn scan_pci_devices() -> anyhow::Result<()> {
    let output = Command::new("lspci")
        .args(["-nn", "-v"])
        .output()
        .map_err(|e| anyhow::anyhow!("Failed to run lspci: {}", e))?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut network_devices = 0;

    for line in output_str.lines() {
        if line.contains("Network controller") || line.contains("Ethernet controller") {
            network_devices += 1;
            println!("   🔍 Found: {}", line);
            
            // Extract vendor and device IDs
            if let Some(ids) = extract_vendor_device_ids(line) {
                println!("      Vendor ID: {}, Device ID: {}", ids.0, ids.1);
                println!("      Vendor: {}", get_vendor_name(&ids.0));
                println!("      Device: {}", get_device_name(&ids.0, &ids.1));
            }
        }
    }

    println!("   📊 Total network devices found: {}", network_devices);
    Ok(())
}

/// Extract vendor and device IDs from lspci output
fn extract_vendor_device_ids(line: &str) -> Option<(String, String)> {
    for part in line.split_whitespace() {
        if part.starts_with('[') && part.contains(':') && part.ends_with(']') {
            let ids = part.trim_matches('[').trim_matches(']');
            let id_parts: Vec<&str> = ids.split(':').collect();
            if id_parts.len() == 2 {
                return Some((id_parts[0].to_string(), id_parts[1].to_string()));
            }
        }
    }
    None
}

/// Get vendor name from vendor ID
fn get_vendor_name(vendor_id: &str) -> String {
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
fn get_device_name(vendor_id: &str, device_id: &str) -> String {
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
async fn scan_network_interfaces() -> anyhow::Result<()> {
    let net_path = Path::new("/sys/class/net");
    let mut physical_interfaces = 0;
    let mut virtual_interfaces = 0;

    for entry in fs::read_dir(net_path)? {
        let entry = entry?;
        let interface_name = entry.file_name().to_string_lossy().to_string();
        
        // Skip loopback and virtual interfaces
        if interface_name == "lo" || interface_name.starts_with("veth") || 
           interface_name.starts_with("docker") || interface_name.starts_with("br-") {
            virtual_interfaces += 1;
            println!("   🔗 Virtual interface: {}", interface_name);
            continue;
        }

        // Check if this is a physical interface
        let device_path = entry.path().join("device");
        if device_path.exists() {
            physical_interfaces += 1;
            println!("   🔌 Physical interface: {}", interface_name);
            
            // Get interface details
            get_interface_info(&interface_name, &entry.path()).await?;
        }
    }

    println!("   📊 Physical interfaces: {}, Virtual interfaces: {}", 
             physical_interfaces, virtual_interfaces);
    Ok(())
}

/// Get detailed information for a network interface
async fn get_interface_info(interface_name: &str, interface_path: &Path) -> anyhow::Result<()> {
    // Get MAC address
    if let Ok(mac) = fs::read_to_string(interface_path.join("address")) {
        println!("      MAC: {}", mac.trim());
    }

    // Get carrier status
    if let Ok(carrier) = fs::read_to_string(interface_path.join("carrier")) {
        let status = if carrier.trim() == "1" { "UP" } else { "DOWN" };
        println!("      Status: {}", status);
    }

    // Get speed information
    if let Ok(speed) = fs::read_to_string(interface_path.join("speed")) {
        println!("      Speed: {} Mbps", speed.trim());
    }

    // Get duplex information
    if let Ok(duplex) = fs::read_to_string(interface_path.join("duplex")) {
        println!("      Duplex: {}", duplex.trim());
    }

    Ok(())
}

/// Get detailed port information using ethtool
async fn get_port_details() -> anyhow::Result<()> {
    let net_path = Path::new("/sys/class/net");
    
    for entry in fs::read_dir(net_path)? {
        let entry = entry?;
        let interface_name = entry.file_name().to_string_lossy().to_string();
        
        // Skip virtual interfaces
        if interface_name == "lo" || interface_name.starts_with("veth") || 
           interface_name.starts_with("docker") || interface_name.starts_with("br-") {
            continue;
        }

        // Check if this is a physical interface
        let device_path = entry.path().join("device");
        if device_path.exists() {
            println!("   🔧 Getting details for {}:", interface_name);
            
            // Get driver information
            if let Ok(output) = Command::new("ethtool")
                .args(["-i", &interface_name])
                .output() {
                let output_str = String::from_utf8_lossy(&output.stdout);
                for line in output_str.lines() {
                    if line.starts_with("driver:") {
                        let driver = line.split(':').nth(1).unwrap_or("").trim();
                        println!("      Driver: {}", driver);
                        break;
                    }
                }
            }

            // Get port capabilities
            if let Ok(output) = Command::new("ethtool")
                .args([&interface_name])
                .output() {
                let output_str = String::from_utf8_lossy(&output.stdout);
                for line in output_str.lines() {
                    if line.contains("Supported ports:") {
                        let port_type = if line.contains("FIBRE") {
                            "Fiber"
                        } else if line.contains("TP") {
                            "Ethernet (Twisted Pair)"
                        } else {
                            "Unknown"
                        };
                        println!("      Port Type: {}", port_type);
                        break;
                    }
                }
            }
        }
    }

    Ok(())
}

/// Generate a summary report
async fn generate_summary_report() -> anyhow::Result<()> {
    let mut report = json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "system_info": {
            "platform": "Linux",
            "detection_methods": [
                "PCI device scanning (lspci)",
                "Network interface enumeration (/sys/class/net)",
                "Hardware capability detection (ethtool)",
                "Real-time statistics (/sys/class/net/*/statistics)"
            ]
        },
        "capabilities": {
            "vendor_detection": true,
            "device_identification": true,
            "port_type_detection": true,
            "speed_duplex_detection": true,
            "link_status_monitoring": true,
            "real_time_statistics": true,
            "driver_information": true
        },
        "api_endpoints": [
            "GET /api/network/physical-ports - Get all physical ports",
            "GET /api/network/physical-ports/summary - Get port summary",
            "GET /api/network/physical-ports/{port_id} - Get specific port details",
            "GET /api/network/physical-ports/{interface_name}/statistics - Get port statistics"
        ]
    });

    println!("   📄 Summary Report:");
    println!("      {}", serde_json::to_string_pretty(&report)?);

    Ok(())
} 