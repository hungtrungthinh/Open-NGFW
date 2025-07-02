"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Shield,
  Network,
  Monitor,
  FileText,
  Users,
  Lock,
  Globe,
  Bug,
  Zap,
  Gauge,
  Server,
  Settings,
  BarChart3,
  Bell,
  Wifi,
  Tag,
  MapPin,
  Clock,
  Database,
  Eye,
  ShieldCheck,
  Router,
  Cable,
  Globe2,
  ShieldX,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Route,
  Layers,
  Signal,
  Box,
  Shuffle,
  Factory
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
    submenu: null
  },
  {
    title: "Traffic Monitor",
    href: "/traffic-monitor",
    icon: Activity,
    badge: null,
    submenu: null
  },
  {
    title: "Firewall Rules",
    href: "/firewall-rules",
    icon: Shield,
    badge: null,
    submenu: null
  },
  {
    title: "Network",
    href: "/network",
    icon: Network,
    badge: null,
    submenu: [
      {
        title: "Interfaces",
        href: "/network/interfaces",
        icon: Wifi,
        description: "Physical and virtual network interfaces"
      },
      {
        title: "Static Routes",
        href: "/network/static-routes",
        icon: Route,
        description: "Configure static routing tables"
      },
      {
        title: "Policy Routes",
        href: "/network/policy-routes",
        icon: Shuffle,
        description: "Policy-based routing configuration"
      },
      {
        title: "Routing Objects",
        href: "/network/routing-objects",
        icon: Box,
        description: "Routing objects and address groups"
      },
      {
        title: "SD-WAN",
        href: "/network/sdwan",
        icon: Network,
        description: "Software-defined WAN configuration"
      },
      {
        title: "DNS",
        href: "/network/dns",
        icon: Globe2,
        description: "DNS server and resolver settings"
      },
      {
        title: "Extender",
        href: "/network/extender",
        icon: Signal,
        description: "Network extender configuration"
      }
    ]
  },
  {
    title: "IPS",
    href: "/ips",
    icon: ShieldCheck,
    badge: null,
    submenu: [
      {
        title: "Signatures",
        href: "/ips/signatures",
        icon: ShieldCheck,
        description: "Manage IPS signatures and rules"
      },
      {
        title: "Threat Prevention",
        href: "/ips/threat-prevention",
        icon: ShieldX,
        description: "Configure threat prevention policies"
      },
      {
        title: "Vulnerability Protection",
        href: "/ips/vulnerability-protection",
        icon: Bug,
        description: "Vulnerability scanning and protection"
      },
      {
        title: "Malware Protection",
        href: "/ips/malware-protection",
        icon: Bug,
        description: "Malware detection and prevention"
      },
      {
        title: "Botnet Protection",
        href: "/ips/botnet-protection",
        icon: Shield,
        description: "Botnet detection and blocking"
      },
      {
        title: "IPS Logs",
        href: "/ips/logs",
        icon: FileText,
        description: "View IPS detection logs and alerts"
      },
      {
        title: "IPS Settings",
        href: "/ips/settings",
        icon: Settings,
        description: "Configure IPS engine settings"
      }
    ]
  },
  {
    title: "Logs",
    href: "/logs",
    icon: FileText,
    badge: null,
    submenu: null
  },
  {
    title: "User Management",
    href: "/user-management",
    icon: Users,
    badge: null,
    submenu: null
  },
  {
    title: "VPN",
    href: "/vpn",
    icon: Lock,
    badge: null,
    submenu: null
  },
  {
    title: "Web Filter",
    href: "/web-filter",
    icon: Globe,
    badge: null,
    submenu: null
  },
  {
    title: "Antivirus",
    href: "/antivirus",
    icon: Bug,
    badge: null,
    submenu: null
  },
  {
    title: "DoS Protection",
    href: "/dos-protection",
    icon: Zap,
    badge: null,
    submenu: null
  },
  {
    title: "Traffic Shaping",
    href: "/traffic-shaping",
    icon: Gauge,
    badge: null,
    submenu: [
      {
        title: "Layer 3 Rules",
        href: "/traffic-shaping/layer3",
        icon: Gauge,
        description: "IP/Port/Protocol-based QoS policies"
      },
      {
        title: "Layer 7 Rules",
        href: "/traffic-shaping/layer7",
        icon: Gauge,
        description: "Application/User/Protocol-based QoS policies"
      }
    ]
  },
  {
    title: "High Availability",
    href: "/high-availability",
    icon: Server,
    badge: null,
    submenu: null
  },
  {
    title: "Central Management",
    href: "/central-management",
    icon: Settings,
    badge: null,
    submenu: null
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    badge: null,
    submenu: null
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
    badge: null,
    submenu: null
  },
  {
    title: "VLAN",
    href: "/vlan",
    icon: Tag,
    badge: null,
    submenu: null
  },
  {
    title: "Zones",
    href: "/zones",
    icon: MapPin,
    badge: null,
    submenu: null
  },
  {
    title: "Policy Schedule",
    href: "/policy-schedule",
    icon: Clock,
    badge: null,
    submenu: null
  },
  {
    title: "SIEM Integration",
    href: "/siem-integration",
    icon: Database,
    badge: null,
    submenu: null
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isMenuActive = (item: any) => {
    if (item.href === "/" && pathname === "/") return true;
    if (item.href !== "/" && pathname.startsWith(item.href)) return true;
    if (item.submenu) {
      return item.submenu.some((sub: any) => pathname === sub.href);
    }
    return false;
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Open-NGFW</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = isMenuActive(item);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = openMenus[item.title];

          return (
            <div key={item.href}>
              {hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 mr-3",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    <span className="flex-1 text-left">{item.title}</span>
                    {isSubmenuOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                  {isSubmenuOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((sub: any) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                              isSubActive
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <sub.icon className={cn(
                              "w-4 h-4 mr-3",
                              isSubActive ? "text-blue-600" : "text-gray-400"
                            )} />
                            <div className="flex-1">
                              <div className="font-medium">{sub.title}</div>
                              <div className="text-xs text-gray-500">{sub.description}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 mr-3",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
} 