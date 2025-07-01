'use client';

import React, { useState } from "react";
import {
  Gauge,
  ShieldHalf,
  Network,
  Shield,
  ShieldCheck,
  Lock,
  Cog,
  FileText,
  MonitorSmartphone,
  Wifi,
  Layers,
  Users,
  Info,
  Server,
  GitBranch,
  Bot,
  Plug,
  Globe,
  Signal,
  Route,
  Shuffle,
  Box,
  SlidersHorizontal,
  Contact,
  ConciergeBell,
  Calendar,
  Bug,
  Filter,
  ShieldAlert,
  AppWindow,
  Link,
  DoorOpen,
  Award,
  TrafficCone,
  BarChart,
  FileText as FileTextIcon,
  Factory
} from "lucide-react";

const icons = {
  dashboard: <Gauge size={18} />, // Dashboard
  status: <Info size={16} />, // Status
  security: <ShieldCheck size={16} />, // Security
  network: <Network size={16} />, // Network
  users_devices: <Users size={16} />, // Users & Devices
  system: <Cog size={16} />, // System
  ot_dashboard: <Factory size={16} />, // OT Dashboard
  security_entry: <ShieldHalf size={18} />, // Security Entry
  entry_topology: <GitBranch size={16} />,
  entry_physical: <Server size={16} />,
  entry_logical: <Layers size={16} />,
  entry_automation: <Bot size={16} />,
  entry_connectors: <Plug size={16} />,
  network_main: <Network size={18} />,
  interfaces: <Network size={16} />,
  static_routes: <Route size={16} />,
  policy_routes: <Shuffle size={16} />,
  routing_objects: <Box size={16} />,
  sdwan: <Network size={16} />,
  dns: <Globe size={16} />,
  extender: <Signal size={16} />,
  policy: <Shield size={18} />,
  firewall_policy: <ShieldHalf size={16} />,
  virtual_ips: <Network size={16} />,
  traffic_shaping: <SlidersHorizontal size={16} />,
  addresses: <Contact size={16} />,
  services: <ConciergeBell size={16} />,
  schedules: <Calendar size={16} />,
  profiles: <ShieldCheck size={18} />,
  antivirus: <Bug size={16} />,
  web_filter: <Filter size={16} />,
  dns_filter: <Globe size={16} />,
  ips: <ShieldAlert size={16} />,
  app_control: <AppWindow size={16} />,
  dlp: <Lock size={16} />,
  vpn: <Lock size={18} />,
  ipsec_tunnels: <Link size={16} />,
  ssl_vpn_settings: <Cog size={16} />,
  ssl_vpn_portals: <DoorOpen size={16} />,
  system_main: <Cog size={18} />,
  administrators: <ShieldCheck size={16} />,
  guard: <Shield size={16} />,
  certificates: <Award size={16} />,
  settings: <SlidersHorizontal size={16} />,
  ha: <Layers size={16} />,
  log: <FileText size={18} />,
  local_traffic_log: <TrafficCone size={16} />,
  analyzer: <BarChart size={16} />,
  reports: <FileTextIcon size={16} />,
  monitor: <MonitorSmartphone size={18} />,
  routing_monitor: <Route size={16} />,
  vpn_monitor: <Lock size={16} />,
  sdwan_monitor: <Network size={16} />,
  wifi_monitor: <Wifi size={16} />,
  wifi_switch: <Wifi size={18} />,
  wifi_ssids: <Wifi size={16} />,
};

const menuData = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: icons.dashboard,
    submenu: [
      { key: "status", label: "Status", icon: icons.status },
      { key: "security", label: "Security", icon: icons.security },
      { key: "network", label: "Network", icon: icons.network },
      { key: "users_devices", label: "Users & Devices", icon: icons.users_devices },
      { key: "system", label: "System", icon: icons.system },
      { key: "ot_dashboard", label: "OT Dashboard", icon: icons.ot_dashboard },
    ],
  },
  {
    key: "security_entry",
    label: "Security Entry",
    icon: icons.security_entry,
    submenu: [
      { key: "entry_topology", label: "Topology", icon: icons.entry_topology },
      { key: "entry_physical", label: "Physical Topology", icon: icons.entry_physical },
      { key: "entry_logical", label: "Logical Topology", icon: icons.entry_logical },
      { key: "entry_automation", label: "Automation", icon: icons.entry_automation },
      { key: "entry_connectors", label: "Entry Connectors", icon: icons.entry_connectors },
    ],
  },
  {
    key: "network_main",
    label: "Network",
    icon: icons.network_main,
    submenu: [
      { key: "interfaces", label: "Interfaces", icon: icons.interfaces, href: "/network_interfaces.html" },
      { key: "static_routes", label: "Static Routes", icon: icons.static_routes },
      { key: "policy_routes", label: "Policy Routes", icon: icons.policy_routes },
      { key: "routing_objects", label: "Routing Objects", icon: icons.routing_objects },
      { key: "sdwan", label: "SD-WAN", icon: icons.sdwan },
      { key: "dns", label: "DNS", icon: icons.dns },
      { key: "extender", label: "Extender", icon: icons.extender },
    ],
  },
  {
    key: "policy",
    label: "Policy & Objects",
    icon: icons.policy,
    submenu: [
      { key: "firewall_policy", label: "Firewall Policy", icon: icons.firewall_policy },
      { key: "virtual_ips", label: "Virtual IPs", icon: icons.virtual_ips },
      { key: "traffic_shaping", label: "Traffic Shaping", icon: icons.traffic_shaping },
      { key: "addresses", label: "Addresses", icon: icons.addresses },
      { key: "services", label: "Services", icon: icons.services },
      { key: "schedules", label: "Schedules", icon: icons.schedules },
    ],
  },
  {
    key: "profiles",
    label: "Security Profiles",
    icon: icons.profiles,
    submenu: [
      { key: "antivirus", label: "Antivirus", icon: icons.antivirus },
      { key: "web_filter", label: "Web Filter", icon: icons.web_filter },
      { key: "dns_filter", label: "DNS Filter", icon: icons.dns_filter },
      { key: "ips", label: "Intrusion Prevention (IPS)", icon: icons.ips },
      { key: "app_control", label: "Application Control", icon: icons.app_control },
      { key: "dlp", label: "Data Loss Prevention (DLP)", icon: icons.dlp },
    ],
  },
  {
    key: "vpn",
    label: "VPN",
    icon: icons.vpn,
    submenu: [
      { key: "ipsec_tunnels", label: "IPsec Tunnels", icon: icons.ipsec_tunnels },
      { key: "ssl_vpn_settings", label: "SSL-VPN Settings", icon: icons.ssl_vpn_settings },
      { key: "ssl_vpn_portals", label: "SSL-VPN Portals", icon: icons.ssl_vpn_portals },
    ],
  },
  {
    key: "system_main",
    label: "System",
    icon: icons.system_main,
    submenu: [
      { key: "administrators", label: "Administrators", icon: icons.administrators },
      { key: "guard", label: "Guard", icon: icons.guard },
      { key: "certificates", label: "Certificates", icon: icons.certificates },
      { key: "settings", label: "Settings", icon: icons.settings },
      { key: "ha", label: "High Availability (HA)", icon: icons.ha },
    ],
  },
  {
    key: "log",
    label: "Log & Report",
    icon: icons.log,
    submenu: [
      { key: "local_traffic_log", label: "Local Traffic Log", icon: icons.local_traffic_log, href: "/logs.html" },
      { key: "analyzer", label: "Analyzer", icon: icons.analyzer, href: "/analyzer.html" },
      { key: "reports", label: "Reports", icon: icons.reports, href: "/reports.html" },
    ],
  },
  {
    key: "monitor",
    label: "Monitor",
    icon: icons.monitor,
    submenu: [
      { key: "routing_monitor", label: "Routing Monitor", icon: icons.routing_monitor },
      { key: "vpn_monitor", label: "VPN Monitor", icon: icons.vpn_monitor },
      { key: "sdwan_monitor", label: "SD-WAN Monitor", icon: icons.sdwan_monitor },
      { key: "wifi_monitor", label: "Wi-Fi Monitor", icon: icons.wifi_monitor },
    ],
  },
  {
    key: "wifi_switch",
    label: "Wi-Fi & Switch Controller",
    icon: icons.wifi_switch,
    submenu: [
      { key: "wifi_ssids", label: "Wi-Fi SSIDs", icon: icons.wifi_ssids },
    ],
  },
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-72 bg-green-700 text-white flex flex-col justify-between z-40 shadow-lg">
      <div>
        <div className="p-6 pb-2 text-2xl font-bold">Open-NGFW</div>
        <ul className="space-y-1 px-2" id="sidebarMenu">
          {menuData.map((menu) => (
            <li key={menu.key}>
              <button
                className="menu-item flex items-center gap-2 px-3 py-2 rounded hover:bg-green-800 cursor-pointer font-semibold w-full text-left"
                onClick={() => toggleMenu(menu.key)}
                aria-expanded={!!openMenus[menu.key]}
                aria-controls={`${menu.key}-sub`}
              >
                {menu.icon} {menu.label}
                <span className="ml-auto text-xs">{openMenus[menu.key] ? '-' : '+'}</span>
              </button>
              <ul
                className={`submenu ${openMenus[menu.key] ? '' : 'hidden'} ml-4 border-l border-green-800 pl-3 space-y-1`}
                id={`${menu.key}-sub`}
              >
                {menu.submenu.map((sub) => (
                  <li key={sub.key}>
                    {sub.href ? (
                      <a
                        href={sub.href}
                        className="submenu-item flex items-center gap-2 px-2 py-1 rounded hover:bg-green-800 cursor-pointer text-sm w-full h-full"
                      >
                        {sub.icon} {sub.label}
                      </a>
                    ) : (
                      <button
                        className="submenu-item flex items-center gap-2 px-2 py-1 rounded hover:bg-green-800 cursor-pointer text-sm w-full text-left"
                        // onClick={() => ...} // handle section change if needed
                      >
                        {sub.icon} {sub.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 text-center text-gray-200 text-sm">Open-NGFW v1.1.2</div>
    </aside>
  );
} 