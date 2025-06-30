use rusqlite::{params, Connection, Result};

const DB_PATH: &str = "data/lab_open_ngfw_database_storage.db";
const DB_PASSPHRASE: &str = "Lab_SQLCI_2099";

fn main() -> Result<()> {
    let conn = Connection::open(DB_PATH)?;
    conn.pragma_update(None, "key", &DB_PASSPHRASE)?;
    
    // Delete all logs
    conn.execute("DELETE FROM logs", params![])?;
    println!("✅ Deleted all logs from database");
    
    // Reset auto-increment
    conn.execute("DELETE FROM sqlite_sequence WHERE name='logs'", params![])?;
    println!("✅ Reset auto-increment for logs table");
    
    Ok(())
} 