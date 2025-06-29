#!/bin/bash

# Open-NGFW Installer
# For embedded systems and Linux distributions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="open-ngfw"
APP_VERSION="0.1.0"
INSTALL_DIR="/opt/open-ngfw"
SERVICE_NAME="open-ngfw"
BINARY_NAME="open-ngfw"

# Logging
LOG_FILE="/var/log/open-ngfw-install.log"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Detect OS and architecture
detect_system() {
    info "Detecting system..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "Cannot detect OS"
    fi
    
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) ARCH="x86_64" ;;
        aarch64) ARCH="aarch64" ;;
        armv7l) ARCH="armv7" ;;
        *) error "Unsupported architecture: $ARCH" ;;
    esac
    
    info "OS: $OS $VER"
    info "Architecture: $ARCH"
}

# Install dependencies
install_dependencies() {
    info "Installing dependencies..."
    
    case $OS in
        *"Ubuntu"*|*"Debian"*)
            apt-get update
            apt-get install -y curl wget systemd-sysv
            ;;
        *"CentOS"*|*"Red Hat"*|*"Fedora"*)
            yum install -y curl wget systemd
            ;;
        *"Alpine"*)
            apk add --no-cache curl wget
            ;;
        *)
            warning "Unknown OS, skipping package installation"
            ;;
    esac
}

# Create open-ngfw user
create_user() {
    info "Creating open-ngfw user..."
    
    if ! id "open-ngfw" &>/dev/null; then
        useradd -r -s /bin/false -d /opt/open-ngfw open-ngfw
        log "Created open-ngfw user"
    else
        info "open-ngfw user already exists"
    fi
}

# Create directories
create_directories() {
    info "Creating directories..."
    
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$INSTALL_DIR/data"
    mkdir -p "$INSTALL_DIR/logs"
    mkdir -p /etc/open-ngfw
    
    chown -R open-ngfw:open-ngfw "$INSTALL_DIR"
    chmod 755 "$INSTALL_DIR"
    chmod 700 "$INSTALL_DIR/data"
    
    log "Created installation directories"
}

# Install binary
install_binary() {
    info "Installing Open-NGFW application..."
    
    # Check if binary exists in current directory
    if [[ -f "./target/release/$BINARY_NAME" ]]; then
        cp "./target/release/$BINARY_NAME" "$INSTALL_DIR/"
        log "Copied binary from local build"
    else
        error "Binary not found. Please build the application first with: cargo build --release"
    fi
    
    # Copy static files
    if [[ -d "./static" ]]; then
        cp -r ./static "$INSTALL_DIR/"
        log "Copied static files"
    fi
    
    # Set permissions
    chown open-ngfw:open-ngfw "$INSTALL_DIR/$BINARY_NAME"
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
    chown -R open-ngfw:open-ngfw "$INSTALL_DIR/static"
    
    log "Binary installed successfully"
}

# Install systemd service
install_service() {
    info "Installing systemd service..."
    
    if [[ -f "./open-ngfw.service" ]]; then
        cp ./open-ngfw.service /etc/systemd/system/open-ngfw.service
        systemctl daemon-reload
        systemctl enable "$SERVICE_NAME"
        log "Systemd service installed and enabled"
    else
        error "Service file not found"
    fi
}

# Create configuration
create_config() {
    info "Creating configuration..."
    
    cat > /etc/open-ngfw/config.json << EOF
{
    "server": {
        "host": "0.0.0.0",
        "port": 3000
    },
    "firewall": {
        "default_policy": "DROP",
        "log_level": "info"
    },
    "network": {
        "wan_interface": "eth0",
        "lan_interface": "eth1"
    }
}
EOF
    
    chown open-ngfw:open-ngfw /etc/open-ngfw/config.json
    chmod 600 /etc/open-ngfw/config.json
    
    log "Configuration created"
}

# Setup firewall rules (basic)
setup_firewall() {
    info "Setting up basic firewall rules..."
    
    # This is a basic setup - in production you'd want more sophisticated rules
    if command -v iptables &> /dev/null; then
        # Allow SSH
        iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        # Allow HTTP/HTTPS for dashboard
        iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        # Allow established connections
        iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
        # Allow loopback
        iptables -A INPUT -i lo -j ACCEPT
        # Drop everything else
        iptables -A INPUT -j DROP
        
        # Save rules
        if command -v iptables-save &> /dev/null; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || \
            iptables-save > /etc/iptables.rules 2>/dev/null || \
            warning "Could not save iptables rules"
        fi
        
        log "Basic firewall rules configured"
    else
        warning "iptables not found, skipping firewall setup"
    fi
}

# Start service
start_service() {
    info "Starting Open-NGFW service..."
    
    systemctl start "$SERVICE_NAME"
    
    # Wait a moment and check status
    sleep 3
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "Service started successfully"
    else
        error "Failed to start service"
    fi
}

# Display installation summary
show_summary() {
    echo
    echo "=========================================="
    echo "  Open-NGFW Installation Complete!"
    echo "=========================================="
    echo
    echo "Installation Directory: $INSTALL_DIR"
    echo "Configuration: /etc/open-ngfw/config.json"
    echo "Service Name: $SERVICE_NAME"
    echo "Dashboard URL: http://localhost:3000"
    echo
    echo "Useful commands:"
    echo "  Start service:   systemctl start $SERVICE_NAME"
    echo "  Stop service:    systemctl stop $SERVICE_NAME"
    echo "  Status:          systemctl status $SERVICE_NAME"
    echo "  View logs:       journalctl -u $SERVICE_NAME -f"
    echo
    echo "Log file: $LOG_FILE"
    echo
}

# Main installation function
main() {
    log "Starting Open-NGFW installation..."
    
    check_root
    detect_system
    install_dependencies
    create_user
    create_directories
    install_binary
    install_service
    create_config
    setup_firewall
    start_service
    show_summary
    
    log "Installation completed successfully!"
}

# Run main function
main "$@" 