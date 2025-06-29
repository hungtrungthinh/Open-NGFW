#!/bin/bash

# Build Release Script for Open-NGFW
# Optimized for embedded systems

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_NAME="open-ngfw"
VERSION="0.1.0"
BUILD_DIR="target/release"
DIST_DIR="dist"

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if Rust is installed
check_rust() {
    if ! command -v cargo &> /dev/null; then
        error "Rust is not installed. Please install Rust first: https://rustup.rs/"
    fi
    
    log "Rust version: $(rustc --version)"
}

# Clean previous builds
clean() {
    log "Cleaning previous builds..."
    cargo clean
    rm -rf "$DIST_DIR"
    mkdir -p "$DIST_DIR"
}

# Build for different targets
build_targets() {
    log "Building for multiple targets..."
    
    # Native target (current system)
    log "Building for native target..."
    RUSTFLAGS="-C target-cpu=native -C target-feature=+crt-static" cargo build --release
    
    # Cross-compilation targets (if cross is installed)
    if command -v cross &> /dev/null; then
        log "Building for x86_64-unknown-linux-musl..."
        cross build --release --target x86_64-unknown-linux-musl
        
        log "Building for aarch64-unknown-linux-musl..."
        cross build --release --target aarch64-unknown-linux-musl
        
        log "Building for armv7-unknown-linux-musleabihf..."
        cross build --release --target armv7-unknown-linux-musleabihf
    else
        warning "Cross-compilation tool 'cross' not found. Install with: cargo install cross"
        warning "Only building for native target"
    fi
}

# Create distribution packages
create_packages() {
    log "Creating distribution packages..."
    
    # Native package
    if [[ -f "$BUILD_DIR/$APP_NAME" ]]; then
        mkdir -p "$DIST_DIR/native"
        cp "$BUILD_DIR/$APP_NAME" "$DIST_DIR/native/"
        cp -r static "$DIST_DIR/native/"
        cp install.sh "$DIST_DIR/native/"
        cp open-ngfw.service "$DIST_DIR/native/"
        
        # Create tar.gz
        cd "$DIST_DIR/native"
        tar -czf "../${APP_NAME}-${VERSION}-native.tar.gz" .
        cd ../..
        
        log "Created native package: $DIST_DIR/${APP_NAME}-${VERSION}-native.tar.gz"
    fi
    
    # Cross-compiled packages
    for target in x86_64-unknown-linux-musl aarch64-unknown-linux-musl armv7-unknown-linux-musleabihf; do
        if [[ -f "target/$target/release/$APP_NAME" ]]; then
            mkdir -p "$DIST_DIR/$target"
            cp "target/$target/release/$APP_NAME" "$DIST_DIR/$target/"
            cp -r static "$DIST_DIR/$target/"
            cp install.sh "$DIST_DIR/$target/"
            cp open-ngfw.service "$DIST_DIR/$target/"
            
            # Create tar.gz
            cd "$DIST_DIR/$target"
            tar -czf "../${APP_NAME}-${VERSION}-${target}.tar.gz" .
            cd ../..
            
            log "Created $target package: $DIST_DIR/${APP_NAME}-${VERSION}-${target}.tar.gz"
        fi
    done
}

# Create Docker image
build_docker() {
    log "Building Docker image..."
    
    if command -v docker &> /dev/null; then
        docker build -t "$APP_NAME:$VERSION" .
        docker tag "$APP_NAME:$VERSION" "$APP_NAME:latest"
        
        # Save Docker image
        docker save "$APP_NAME:$VERSION" | gzip > "$DIST_DIR/${APP_NAME}-${VERSION}-docker.tar.gz"
        
        log "Created Docker image: $DIST_DIR/${APP_NAME}-${VERSION}-docker.tar.gz"
    else
        warning "Docker not found, skipping Docker build"
    fi
}

# Create installation script
create_installer() {
    log "Creating installer script..."
    
    cat > "$DIST_DIR/install.sh" << 'EOF'
#!/bin/bash

# Auto-installer for Open-NGFW
# This script will detect the system and install the appropriate package

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Detect system
detect_system() {
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) ARCH="x86_64-unknown-linux-musl" ;;
        aarch64) ARCH="aarch64-unknown-linux-musl" ;;
        armv7l) ARCH="armv7-unknown-linux-musleabihf" ;;
        *) ARCH="native" ;;
    esac
    
    log "Detected architecture: $ARCH"
}

# Find and extract package
install_package() {
    local arch=$1
    
    # Look for package
    for pkg in open-ngfw-*-${arch}.tar.gz open-ngfw-*-native.tar.gz; do
        if [[ -f "$pkg" ]]; then
            log "Found package: $pkg"
            
            # Extract
            tar -xzf "$pkg"
            
            # Run installer
            if [[ -f "install.sh" ]]; then
                chmod +x install.sh
                sudo ./install.sh
            else
                error "install.sh not found in package"
            fi
            
            return 0
        fi
    done
    
    error "No suitable package found for architecture: $arch"
}

# Main
main() {
    log "Starting auto-installation..."
    
    if [[ $EUID -eq 0 ]]; then
        error "Please run this script as a regular user, not as root"
    fi
    
    detect_system
    install_package "$ARCH"
    
    log "Installation completed!"
    echo
    echo "Dashboard available at: http://localhost:3000"
    echo "Service status: sudo systemctl status open-ngfw"
}

main "$@"
EOF
    
    chmod +x "$DIST_DIR/install.sh"
    log "Created installer script: $DIST_DIR/install.sh"
}

# Show build summary
show_summary() {
    echo
    echo "=========================================="
    echo "  Build Summary"
    echo "=========================================="
    echo
    echo "Distribution packages created in: $DIST_DIR/"
    echo
    
    if [[ -d "$DIST_DIR" ]]; then
        echo "Available packages:"
        ls -la "$DIST_DIR"/*.tar.gz 2>/dev/null || echo "No packages found"
        echo
        echo "Installation script: $DIST_DIR/install.sh"
    fi
    
    echo
    echo "To install on target system:"
    echo "1. Copy the appropriate .tar.gz file to target"
    echo "2. Extract: tar -xzf open-ngfw-*.tar.gz"
    echo "3. Run: sudo ./install.sh"
    echo
}

# Main build process
main() {
    log "Starting release build for $APP_NAME v$VERSION..."
    
    check_rust
    clean
    build_targets
    create_packages
    build_docker
    create_installer
    show_summary
    
    log "Build completed successfully!"
}

# Run main function
main "$@" 