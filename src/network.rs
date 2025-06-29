use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Arc;
use tokio::sync::RwLock;

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
} 