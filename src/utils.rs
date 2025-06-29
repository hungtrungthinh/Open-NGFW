use std::net::IpAddr;
use std::str::FromStr;

/// Validate if a string represents a valid IP address
pub fn is_valid_ip(ip: &str) -> bool {
    IpAddr::from_str(ip).is_ok()
}

/// Validate if a port number is within valid range (1-65535)
pub fn is_valid_port(port: u16) -> bool {
    port > 0 && port <= 65535
}

/// Format bytes into human-readable format (B, KB, MB, GB)
pub fn format_bytes(bytes: u64) -> String {
    const UNITS: [&str; 4] = ["B", "KB", "MB", "GB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;
    
    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }
    
    format!("{:.2} {}", size, UNITS[unit_index])
}

/// Format duration in seconds to human-readable format (h m s)
pub fn format_duration(seconds: u64) -> String {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    
    if hours > 0 {
        format!("{}h {}m {}s", hours, minutes, secs)
    } else if minutes > 0 {
        format!("{}m {}s", minutes, secs)
    } else {
        format!("{}s", secs)
    }
}

/// Get system information including hostname, OS, and kernel version
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        hostname: get_hostname(),
        os: get_os_info(),
        kernel: get_kernel_version(),
    }
}

/// System information structure
#[derive(Debug, Clone)]
pub struct SystemInfo {
    pub hostname: String,
    pub os: String,
    pub kernel: String,
}

/// Get the system hostname
fn get_hostname() -> String {
    std::env::var("HOSTNAME").unwrap_or_else(|_| "unknown".to_string())
}

/// Get operating system information
fn get_os_info() -> String {
    #[cfg(target_os = "linux")]
    {
        if let Ok(content) = std::fs::read_to_string("/etc/os-release") {
            for line in content.lines() {
                if line.starts_with("PRETTY_NAME=") {
                    return line.trim_start_matches("PRETTY_NAME=").trim_matches('"').to_string();
                }
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        "macOS".to_string()
    }
    
    #[cfg(target_os = "windows")]
    {
        "Windows".to_string()
    }
    
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        "Unknown".to_string()
    }
}

/// Get kernel version information
fn get_kernel_version() -> String {
    #[cfg(target_os = "linux")]
    {
        if let Ok(content) = std::fs::read_to_string("/proc/version") {
            if let Some(version) = content.split_whitespace().nth(2) {
                return version.to_string();
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = std::process::Command::new("uname").arg("-r").output() {
            if let Ok(version) = String::from_utf8(output.stdout) {
                return version.trim().to_string();
            }
        }
    }
    
    "Unknown".to_string()
} 