use rusqlite::{params, Connection, Result};
use std::path::Path;
use std::fs;

const DB_PATH: &str = "data/lab_open_ngfw_database_storage.db";
const DB_PASSPHRASE: &str = "Lab_SQLCI_2099";

#[derive(Debug, Clone)]
pub struct FirewallRule {
    pub id: i64,
    pub name: String,
    pub src_ip: Option<String>,
    pub dst_ip: Option<String>,
    pub src_port: Option<i64>,
    pub dst_port: Option<i64>,
    pub protocol: Option<String>,
    pub action: String,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub struct FirewallDB {
    conn: Connection,
}

impl FirewallDB {
    pub fn new(db_path: &str) -> Result<Self> {
        // Ensure data directory exists
        if let Some(parent) = std::path::Path::new(db_path).parent() {
            let _ = fs::create_dir_all(parent);
        }
        let conn = match Connection::open(db_path) {
            Ok(c) => c,
            Err(e) => {
                eprintln!("[FirewallDB] Failed to open DB file: {:?}", e);
                return Err(e);
            }
        };
        if let Err(e) = conn.pragma_update(None, "key", &DB_PASSPHRASE) {
            eprintln!("[FirewallDB] Failed to set SQLCipher key: {:?}", e);
            return Err(e);
        }
        if let Err(e) = conn.execute_batch(include_str!("../database_schema.sql")) {
            eprintln!("[FirewallDB] Failed to migrate schema: {:?}", e);
            return Err(e);
        }
        Ok(FirewallDB { conn })
    }

    pub fn add_rule(&self, rule: &FirewallRule) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO firewall_rules (name, src_ip, dst_ip, src_port, dst_port, protocol, action, enabled) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                rule.name,
                rule.src_ip,
                rule.dst_ip,
                rule.src_port,
                rule.dst_port,
                rule.protocol,
                rule.action,
                rule.enabled as i64
            ],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_rules(&self) -> Result<Vec<FirewallRule>> {
        let mut stmt = self.conn.prepare("SELECT id, name, src_ip, dst_ip, src_port, dst_port, protocol, action, enabled, created_at, updated_at FROM firewall_rules")?;
        let rules = stmt
            .query_map((), |row| {
                Ok(FirewallRule {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    src_ip: row.get(2).ok(),
                    dst_ip: row.get(3).ok(),
                    src_port: row.get(4).ok(),
                    dst_port: row.get(5).ok(),
                    protocol: row.get(6).ok(),
                    action: row.get(7)?,
                    enabled: row.get::<_, i64>(8)? != 0,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            })?
            .filter_map(Result::ok)
            .collect();
        Ok(rules)
    }

    pub fn update_rule(&self, rule: &FirewallRule) -> Result<()> {
        self.conn.execute(
            "UPDATE firewall_rules SET name=?1, src_ip=?2, dst_ip=?3, src_port=?4, dst_port=?5, protocol=?6, action=?7, enabled=?8, updated_at=CURRENT_TIMESTAMP WHERE id=?9",
            params![
                rule.name,
                rule.src_ip,
                rule.dst_ip,
                rule.src_port,
                rule.dst_port,
                rule.protocol,
                rule.action,
                rule.enabled as i64,
                rule.id
            ],
        )?;
        Ok(())
    }

    pub fn delete_rule(&self, id: i64) -> Result<()> {
        self.conn.execute("DELETE FROM firewall_rules WHERE id=?1", params![id])?;
        Ok(())
    }

    pub fn toggle_rule(&self, id: i64, enabled: bool) -> Result<()> {
        self.conn.execute(
            "UPDATE firewall_rules SET enabled=?1, updated_at=CURRENT_TIMESTAMP WHERE id=?2",
            params![enabled as i64, id],
        )?;
        Ok(())
    }
}

// Helper to open default DB
pub fn open_default_db() -> Result<FirewallDB> {
    FirewallDB::new(DB_PATH)
} 