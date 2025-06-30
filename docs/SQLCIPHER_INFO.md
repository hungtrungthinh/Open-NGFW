# SQLCipher Integration for Open-NGFW

This project uses **SQLCipher** for encrypted database storage of sensitive firewall data.

## SQLCipher Passphrase

- **Passphrase:** `Lab_SQLCI_2099`
- **Location:** Hardcoded for development/demo. For production, use environment variable or secure vault.

## How it works
- All firewall rules and sensitive data are stored in an encrypted SQLite database using SQLCipher (AES-256).
- The passphrase is required to open and operate on the database.

## Configuration

- The passphrase is currently set to:
  ```
  Lab_SQLCI_2099
  ```
- In production, set the passphrase via environment variable:
  ```sh
  export SQLCIPHER_PASSPHRASE=Lab_SQLCI_2099
  ```
- Or configure in your systemd service file:
  ```ini
  [Service]
  Environment=SQLCIPHER_PASSPHRASE=Lab_SQLCI_2099
  ```

## Security Notes
- **Never commit real production passphrases to source code.**
- For demo/lab, this passphrase is public and for testing only.
- For production, use a strong, unique passphrase and store it securely (vault, environment, etc).
- SQLCipher uses AES-256 by default for maximum security.

## References
- [SQLCipher Documentation](https://www.zetetic.net/sqlcipher/)
- [rusqlite SQLCipher Support](https://docs.rs/rusqlite/latest/rusqlite/) 