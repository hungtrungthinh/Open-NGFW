use rusqlite::{params, Connection, Result};
use crate::models::{NetworkInterface, AddressingMode};
use chrono::{DateTime, Utc};
use std::fs;
use crate::network::get_physical_ports;
use get_if_addrs::get_if_addrs;

const DB_PATH: &str = "data/lab_open_ngfw_database_storage.db";
const DB_PASSPHRASE: &str = "Lab_SQLCI_2099";

pub struct NetworkDB {
    conn: Connection,
}

impl NetworkDB {
    pub fn new(db_path: &str) -> Result<Self> {
        // Ensure data directory exists
        if let Some(parent) = std::path::Path::new(db_path).parent() {
            let _ = fs::create_dir_all(parent);
        }
        let conn = match Connection::open(db_path) {
            Ok(c) => c,
            Err(e) => {
                eprintln!("[NetworkDB] Failed to open DB file: {:?}", e);
                return Err(e);
            }
        };
        if let Err(e) = conn.pragma_update(None, "key", &DB_PASSPHRASE) {
            eprintln!("[NetworkDB] Failed to set SQLCipher key: {:?}", e);
            return Err(e);
        }
        if let Err(e) = conn.execute_batch(include_str!("../database_schema.sql")) {
            eprintln!("[NetworkDB] Failed to migrate schema: {:?}", e);
            return Err(e);
        }
        Ok(NetworkDB { conn })
    }

    pub fn add_interface(&self, iface: &NetworkInterface) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO network_interfaces (name, alias, interface_type, vrf_id, role, bandwidth_up, bandwidth_down, addressing_mode, status, manual_ip, manual_netmask, manual_gateway, manual_dns, dhcp_ip, dhcp_netmask, dhcp_gateway, dhcp_dns, pppoe_username, pppoe_password, pppoe_ip, pppoe_netmask, pppoe_gateway, pppoe_dns, last_renewed, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26)",
            params![
                iface.name,
                iface.alias,
                iface.interface_type,
                iface.vrf_id,
                iface.role,
                iface.bandwidth_up,
                iface.bandwidth_down,
                match iface.addressing_mode {
                    AddressingMode::Manual => "Manual",
                    AddressingMode::DHCP => "DHCP",
                    AddressingMode::PPPoE => "PPPoE",
                },
                iface.status,
                iface.manual_ip,
                iface.manual_netmask,
                iface.manual_gateway,
                iface.manual_dns,
                iface.dhcp_ip,
                iface.dhcp_netmask,
                iface.dhcp_gateway,
                iface.dhcp_dns,
                iface.pppoe_username,
                iface.pppoe_password,
                iface.pppoe_ip,
                iface.pppoe_netmask,
                iface.pppoe_gateway,
                iface.pppoe_dns,
                iface.last_renewed.map(|dt| dt.to_rfc3339()),
                iface.created_at.to_rfc3339(),
                iface.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_interfaces(&self) -> Result<Vec<NetworkInterface>> {
        let mut stmt = self.conn.prepare("SELECT id, name, alias, interface_type, vrf_id, role, bandwidth_up, bandwidth_down, addressing_mode, status, manual_ip, manual_netmask, manual_gateway, manual_dns, dhcp_ip, dhcp_netmask, dhcp_gateway, dhcp_dns, pppoe_username, pppoe_password, pppoe_ip, pppoe_netmask, pppoe_gateway, pppoe_dns, last_renewed, created_at, updated_at FROM network_interfaces")?;
        let rows = stmt.query_map([], |row| {
            // Helper function to parse datetime strings from SQLite
            let parse_datetime = |s: String| -> Result<DateTime<Utc>> {
                // Try RFC3339 first
                if let Ok(dt) = DateTime::parse_from_rfc3339(&s) {
                    return Ok(dt.with_timezone(&Utc));
                }
                // Try SQLite's default format (YYYY-MM-DD HH:MM:SS)
                if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(&s, "%Y-%m-%d %H:%M:%S") {
                    return Ok(dt.and_utc());
                }
                // Try with microseconds
                if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(&s, "%Y-%m-%d %H:%M:%S%.f") {
                    return Ok(dt.and_utc());
                }
                // Fallback to current time if parsing fails
                Ok(Utc::now())
            };

            Ok(NetworkInterface {
                id: row.get(0)?,
                name: row.get(1)?,
                alias: row.get(2).ok(),
                interface_type: row.get(3)?,
                vrf_id: row.get(4).ok(),
                role: row.get(5).ok(),
                bandwidth_up: row.get(6).ok(),
                bandwidth_down: row.get(7).ok(),
                addressing_mode: match row.get::<_, String>(8)?.as_str() {
                    "Manual" => AddressingMode::Manual,
                    "DHCP" => AddressingMode::DHCP,
                    "PPPoE" => AddressingMode::PPPoE,
                    _ => AddressingMode::Manual,
                },
                status: row.get(9).ok(),
                manual_ip: row.get(10).ok(),
                manual_netmask: row.get(11).ok(),
                manual_gateway: row.get(12).ok(),
                manual_dns: row.get(13).ok(),
                dhcp_ip: row.get(14).ok(),
                dhcp_netmask: row.get(15).ok(),
                dhcp_gateway: row.get(16).ok(),
                dhcp_dns: row.get(17).ok(),
                pppoe_username: row.get(18).ok(),
                pppoe_password: row.get(19).ok(),
                pppoe_ip: row.get(20).ok(),
                pppoe_netmask: row.get(21).ok(),
                pppoe_gateway: row.get(22).ok(),
                pppoe_dns: row.get(23).ok(),
                last_renewed: row.get::<_, Option<String>>(24)?.and_then(|s| parse_datetime(s).ok()),
                created_at: parse_datetime(row.get::<_, String>(25)?)?,
                updated_at: parse_datetime(row.get::<_, String>(26)?)?,
            })
        })?;
        Ok(rows.filter_map(Result::ok).collect())
    }

    pub fn update_interface(&self, iface: &NetworkInterface) -> Result<()> {
        self.conn.execute(
            "UPDATE network_interfaces SET name=?1, alias=?2, interface_type=?3, vrf_id=?4, role=?5, bandwidth_up=?6, bandwidth_down=?7, addressing_mode=?8, status=?9, manual_ip=?10, manual_netmask=?11, manual_gateway=?12, manual_dns=?13, dhcp_ip=?14, dhcp_netmask=?15, dhcp_gateway=?16, dhcp_dns=?17, pppoe_username=?18, pppoe_password=?19, pppoe_ip=?20, pppoe_netmask=?21, pppoe_gateway=?22, pppoe_dns=?23, last_renewed=?24, updated_at=?25 WHERE id=?26",
            params![
                iface.name,
                iface.alias,
                iface.interface_type,
                iface.vrf_id,
                iface.role,
                iface.bandwidth_up,
                iface.bandwidth_down,
                match iface.addressing_mode {
                    AddressingMode::Manual => "Manual",
                    AddressingMode::DHCP => "DHCP",
                    AddressingMode::PPPoE => "PPPoE",
                },
                iface.status,
                iface.manual_ip,
                iface.manual_netmask,
                iface.manual_gateway,
                iface.manual_dns,
                iface.dhcp_ip,
                iface.dhcp_netmask,
                iface.dhcp_gateway,
                iface.dhcp_dns,
                iface.pppoe_username,
                iface.pppoe_password,
                iface.pppoe_ip,
                iface.pppoe_netmask,
                iface.pppoe_gateway,
                iface.pppoe_dns,
                iface.last_renewed.map(|dt| dt.to_rfc3339()),
                iface.updated_at.to_rfc3339(),
                iface.id,
            ],
        )?;
        Ok(())
    }

    pub fn delete_interface(&self, id: i32) -> Result<()> {
        self.conn.execute("DELETE FROM network_interfaces WHERE id=?1", params![id])?;
        Ok(())
    }

    pub fn sync_physical_ports(&self) -> Result<()> {
        let now = Utc::now();
        let physical_ports = get_physical_ports();
        let mut db_ifaces = self.get_interfaces()?;
        // Add new physical ports if not in DB
        for port_name in &physical_ports {
            if !db_ifaces.iter().any(|iface| &iface.name == port_name) {
                let new_iface = NetworkInterface {
                    id: 0,
                    name: port_name.clone(),
                    alias: None,
                    interface_type: "physical".to_string(),
                    vrf_id: None,
                    role: None,
                    bandwidth_up: None,
                    bandwidth_down: None,
                    addressing_mode: AddressingMode::Manual,
                    status: Some("Connected".to_string()),
                    manual_ip: None,
                    manual_netmask: None,
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
                    created_at: now,
                    updated_at: now,
                };
                let _ = self.add_interface(&new_iface);
            }
        }
        // Remove interfaces in DB that are not in physical_ports
        db_ifaces = self.get_interfaces()?;
        for iface in db_ifaces {
            if iface.interface_type == "physical" && !physical_ports.contains(&iface.name) {
                let _ = self.delete_interface(iface.id);
            }
        }
        Ok(())
    }
}

pub fn open_default_network_db() -> Result<NetworkDB> {
    NetworkDB::new(DB_PATH)
} 