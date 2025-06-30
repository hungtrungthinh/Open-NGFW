# Open-NGFW Features & Architecture

## 1. Overview
Open-NGFW is a Rust-based next-generation firewall with a modern web dashboard. The project is designed for embedded devices or Linux-based hardware appliances. It features a modular backend (Axum) and a responsive frontend (HTML + Tailwind CSS + Chart.js).

---

## 2. Feature Groups & Functions (Menu Structure)

### 1. Dashboard
- **Status**: System health, resource usage, uptime, WAN IP
- **Security**: Security events summary
- **Network**: Network status, interface summary
- **Users & Devices**: Active users, device inventory
- **System**: System info, firmware, time, serial
- **OT Dashboard**: Industrial/OT status (optional)

### 2. Security Entry
- **Topology**: Visual network topology
- **Physical Topology**: Physical device map
- **Logical Topology**: Logical network map
- **Automation**: Security automation status
- **Entry Connectors**: List of connectors/integrations

### 3. Network
- **Interfaces**: List, status, config of network interfaces
- **Static Routes**: Routing table, add/remove static routes
- **Policy Routes**: Policy-based routing
- **Routing Objects**: Address/route objects
- **SD-WAN**: SD-WAN status/config
- **DNS**: DNS settings, status
- **Extender**: Extender device management

### 4. Policy & Objects
- **Firewall Policy**: List, add, edit, delete firewall rules
- **Virtual IPs**: VIP/NAT config
- **Traffic Shaping**: Bandwidth management
- **Addresses**: Address objects
- **Services**: Service objects
- **Schedules**: Time-based policy schedules

### 5. Security Profiles
- **Antivirus**: AV profile config
- **Web Filter**: Web filtering rules
- **DNS Filter**: DNS filtering
- **IPS**: Intrusion Prevention
- **Application Control**: App control rules
- **DLP**: Data Loss Prevention

### 6. VPN
- **IPsec Tunnels**: List, config, status
- **SSL-VPN Settings**: Portal/settings
- **SSL-VPN Portals**: Portal management

### 7. System
- **Administrators**: User management
- **Guard**: System guard/monitor
- **Certificates**: Certificate management
- **Settings**: System settings
- **High Availability (HA)**: HA config/status

### 8. Log & Report
- **Local Traffic Log**: Traffic logs
- **Analyzer**: Log analyzer
- **Reports**: Scheduled/realtime reports

### 9. Monitor
- **Routing Monitor**: Routing status
- **VPN Monitor**: VPN status
- **SD-WAN Monitor**: SD-WAN status
- **Wi-Fi Monitor**: Wi-Fi status

### 10. Wi-Fi & Switch Controller
- **Wi-Fi SSIDs**: SSID management

---

## 3. Backend (Rust/Axum) Structure
- **API for each feature group/submenu** (RESTful, JSON)
- **Models**: Rust structs for each entity (rule, user, log, etc.)
- **Handlers**: CRUD for each resource
- **Mock data**: For initial development/testing
- **Static file serving**: Serve dashboard UI
- **System integration**: Ready for Linux/embedded (systemd, low resource)

---

## 4. Frontend (HTML/JS) Structure
- **Sidebar/Topbar**: Navigation, user info
- **Section per submenu**: Each section loads data via fetch API
- **Widgets/Cards**: System info, charts, tables
- **SPA behavior**: Show/hide sections, no reload
- **Charts**: Chart.js for resource/session stats
- **Responsive**: Tailwind CSS, mobile-friendly

---

## 5. Extensibility & Deployment
- **Lightweight**: No heavy dependencies, suitable for embedded Linux
- **Cross-compile**: Build for ARM/x86_64
- **Systemd service**: Easy to run as a background service
- **Configurable**: All features modular, easy to enable/disable
- **Future**: Can add DB, real-time event, clustering, etc.

---

## 6. Example API Endpoints (to be implemented)
- `GET /api/status` — System status
- `GET /api/rules` — List firewall rules
- `POST /api/rules` — Add firewall rule
- `GET /api/interfaces` — List network interfaces
- `GET /api/logs/local` — Get local traffic logs
- ... (one for each submenu)

---

## 7. Development Roadmap
1. Create skeleton API for all menu/submenu
2. Connect frontend to fetch data for each section
3. Add CRUD, validation, and notifications
4. Optimize for embedded/Linux, packaging, and security

---

*This file will be continuously updated as new features are developed.* 