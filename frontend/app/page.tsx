'use client';

import { useState, useEffect } from 'react';
import { apiClient, type FirewallStatus, type FirewallStatistics } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Activity, 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Server,
  Wifi,
  Globe,
  Settings,
  KeyRound,
  Users,
  PieChart,
  ShieldCheck,
  BarChart,
  ListChecks,
  Table,
  ChevronRight,
  Monitor,
  Zap,
  Target,
  MapPin,
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react';
import DashboardWidget from "@/components/DashboardWidget";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const assetPieData = [
  { name: "Normal", value: 7, color: "#22c55e" },
  { name: "Warning", value: 1, color: "#facc15" },
  { name: "Critical", value: 1, color: "#ef4444" },
];

const threatPieData = [
  { name: "Clean", value: 3187688, color: "#22c55e" },
  { name: "Malicious", value: 120, color: "#ef4444" },
  { name: "Suspicious", value: 80, color: "#facc15" },
  { name: "Other", value: 50, color: "#a3a3a3" },
];

const routingPieData = [
  { name: "BGP", value: 51, color: "#6366f1" },
  { name: "Connected", value: 14, color: "#f59e42" },
  { name: "Static", value: 12, color: "#22c55e" },
];

const applicationsData = [
  { app: "HTTPS.BROWSER", category: "Web Client", bytes: "2.64 GB" },
  { app: "Microsoft.Portal", category: "Collaboration", bytes: "523.92 MB" },
  { app: "SSL", category: "Network Service", bytes: "203.13 MB" },
  { app: "HTTP.BROWSER", category: "Web Client", bytes: "134.18 MB" },
  { app: "Amazon CloudFront", category: "Cloud/IT", bytes: "82.25 MB" },
];

const botnetActivity = [
  { label: "Known IPs", value: 5 },
  { label: "Known Domains", value: 3 },
  { label: "Activity Since", value: "2h 10m" },
  { label: "Blocked Domains", value: 2 },
  { label: "Blocked Connections", value: 1 },
];

const topSourcesData = [
  { source: "192.168.1.100", bytes: "1.2 GB", sessions: 1250 },
  { source: "192.168.1.101", bytes: "856 MB", sessions: 890 },
  { source: "192.168.1.102", bytes: "634 MB", sessions: 567 },
  { source: "192.168.1.103", bytes: "445 MB", sessions: 423 },
  { source: "192.168.1.104", bytes: "298 MB", sessions: 234 },
];

const topDestinationsData = [
  { destination: "8.8.8.8", bytes: "2.1 GB", sessions: 2100 },
  { destination: "1.1.1.1", bytes: "1.8 GB", sessions: 1800 },
  { destination: "208.67.222.222", bytes: "1.5 GB", sessions: 1500 },
  { destination: "9.9.9.9", bytes: "1.2 GB", sessions: 1200 },
  { destination: "8.8.4.4", bytes: "950 MB", sessions: 950 },
];

const systemResources = [
  { name: "CPU", value: 45, unit: "%", icon: Cpu, color: "text-blue-600" },
  { name: "Memory", value: 62, unit: "%", icon: HardDrive, color: "text-green-600" },
  { name: "Disk", value: 28, unit: "%", icon: HardDrive, color: "text-yellow-600" },
  { name: "Network", value: 78, unit: "%", icon: Wifi, color: "text-purple-600" },
];

const securityRating = [
  { category: "System", score: 95, status: "Excellent" },
  { category: "Network", score: 88, status: "Good" },
  { category: "Application", score: 92, status: "Excellent" },
  { category: "User", score: 85, status: "Good" },
];

// Custom label render for donut chart
function renderThreatLabels(props: any) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, index = 0, name, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = (outerRadius as number) + 24;
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
  if (!value) return null;
  return (
    <g>
      <text x={x} y={y} fill="#222" textAnchor={x > (cx as number) ? "start" : "end"} dominantBaseline="central" fontSize="14" fontWeight="bold">
        {value}
      </text>
      <text x={x} y={y + 16} fill={threatPieData[index!].color} textAnchor={x > (cx as number) ? "start" : "end"} fontSize="13">
        {name}
      </text>
    </g>
  );
}

// Add placeholder data for logs, top sources, top destinations, applications, etc.
const logsData = [
  { time: '2024-07-01 10:00', type: 'Allow', source: '192.168.1.10', destination: '8.8.8.8', detail: 'HTTPS', severity: 'Info' },
  { time: '2024-07-01 10:01', type: 'Deny', source: '192.168.1.11', destination: '1.1.1.1', detail: 'Blocked by policy', severity: 'Warning' },
];

export default function Dashboard() {
  const [status, setStatus] = useState<FirewallStatus | null>(null);
  const [statistics, setStatistics] = useState<FirewallStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, statsData] = await Promise.all([
          apiClient.getStatus(),
          apiClient.getStatistics()
        ]);
        setStatus(statusData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-firewall-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-8 pt-8 w-full">
      {/* Header */}
      <header className="bg-white shadow-sm border border-gray-200 rounded-md mb-6 w-full">
        <div className="flex justify-between items-center py-4 w-full">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-firewall-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Open-NGFW Dashboard</h1>
              <p className="text-sm text-gray-500">Next-Generation Firewall Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={status?.enabled ? "default" : "destructive"}>
              {status?.enabled ? "Firewall Active" : "Firewall Inactive"}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 w-full">
          <DashboardWidget
            title="System Status"
            icon={<Monitor className="h-6 w-6 text-green-600" />}
          >
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Hostname:</span>
                <span className="font-bold">NGFW_PRI</span>
              </div>
              <div className="flex justify-between">
                <span>Serial:</span>
                <span className="font-mono text-xs">NGO1BFT2283753829</span>
              </div>
              <div className="flex justify-between">
                <span>Firmware:</span>
                <span className="font-bold">v1.0.1 build21</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-bold">NAT</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-bold">21h 13m 59s</span>
              </div>
              <div className="flex justify-between">
                <span>IP:</span>
                <span className="font-bold">96.45.36.230</span>
              </div>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Licenses"
            icon={<KeyRound className="h-6 w-6 text-yellow-500" />}
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-100 text-green-700 rounded flex flex-col items-center py-2">
                <span className="font-bold text-lg">IPS</span>
                <span className="text-xs">Active</span>
              </div>
              <div className="bg-green-100 text-green-700 rounded flex flex-col items-center py-2">
                <span className="font-bold text-lg">AV</span>
                <span className="text-xs">Active</span>
              </div>
              <div className="bg-green-100 text-green-700 rounded flex flex-col items-center py-2">
                <span className="font-bold text-lg">Web</span>
                <span className="text-xs">Active</span>
              </div>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Security Entry"
            icon={<Users className="h-6 w-6 text-blue-600" />}
          >
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span>Firewall:</span>
                <span className="font-bold">1</span>
              </div>
              <div className="flex justify-between">
                <span>Switch:</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span>AP:</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Extender:</span>
                <span className="font-bold">0</span>
              </div>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Assets"
            icon={<PieChart className="h-6 w-6 text-pink-600" />}
          >
            <div className="flex flex-col items-center">
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={assetPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={48}
                      fill="#22c55e"
                      label
                    >
                      {assetPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-2xl font-bold mt-2">9 Devices</div>
            </div>
          </DashboardWidget>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 w-full">
          <DashboardWidget
            title="Security Rating"
            icon={<ShieldCheck className="h-6 w-6 text-green-600" />}
          >
            <div className="space-y-3">
              {securityRating.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 items-center gap-2">
                  <div className="text-base font-medium text-gray-900">{item.category}</div>
                  <div className="text-xl font-extrabold text-gray-900 text-right w-14">{item.score}</div>
                  <div>
                    <span className={`h-8 px-3 flex items-center rounded-full text-xs font-semibold ${item.status === 'Excellent' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="System Resources"
            icon={<Activity className="h-6 w-6 text-blue-500" />}
          >
            <div className="space-y-4">
              {systemResources.map((resource, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-[90px]">
                    <resource.icon className={`h-5 w-5 ${resource.color}`} />
                    <span className="text-base font-medium text-gray-900">{resource.name}</span>
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${resource.value}%` }}></div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-gray-900 min-w-[40px] text-right">{resource.value}{resource.unit}</span>
                </div>
              ))}
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Advanced Threat Protection"
            icon={<Zap className="h-6 w-6 text-orange-500" />}
          >
            <div className="flex flex-col items-center w-full">
              <div className="h-32 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={threatPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={54}
                      fill="#22c55e"
                      label={false}
                      isAnimationActive={false}
                    >
                      {threatPieData.map((entry, idx) => (
                        <Cell key={`cell-threat-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-4 text-base font-medium">
                {threatPieData.map((entry, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 rounded" style={{ background: entry.color }}></span>
                    <span style={{ color: entry.color }}>{entry.name}</span>
                  </span>
                ))}
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mt-2">
                {threatPieData.reduce((acc, cur) => acc + cur.value, 0).toLocaleString()} <span className="text-lg font-bold">Total</span>
              </div>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Static & Dynamic Routing"
            icon={<Network className="h-6 w-6 text-indigo-500" />}
          >
            <div className="flex flex-col items-center w-full">
              <div className="h-32 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={routingPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={54}
                      label={false}
                      isAnimationActive={false}
                    >
                      {routingPieData.map((entry, idx) => (
                        <Cell key={`cell-routing-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-4 text-base font-medium">
                {routingPieData.map((entry, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 rounded" style={{ background: entry.color }}></span>
                    <span style={{ color: entry.color }}>{entry.name}</span>
                    <span className="font-bold text-gray-900 ml-1">{entry.value}</span>
                  </span>
                ))}
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mt-2">
                {routingPieData.reduce((acc, cur) => acc + cur.value, 0).toLocaleString()} <span className="text-lg font-bold">Total</span>
              </div>
            </div>
          </DashboardWidget>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          <DashboardWidget
            title="Applications by Bytes"
            icon={<BarChart className="h-6 w-6 text-blue-500" />}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-1 px-2 text-left font-semibold">Application</th>
                    <th className="py-1 px-2 text-left font-semibold">Category</th>
                    <th className="py-1 px-2 text-right font-semibold">Bytes</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationsData.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1 px-2">{row.app}</td>
                      <td className="py-1 px-2">{row.category}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">{row.bytes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Top Sources"
            icon={<Target className="h-6 w-6 text-green-500" />}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-1 px-2 text-left font-semibold">Source IP</th>
                    <th className="py-1 px-2 text-right font-semibold">Bytes</th>
                    <th className="py-1 px-2 text-right font-semibold">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {topSourcesData.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1 px-2 font-mono">{row.source}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">{row.bytes}</td>
                      <td className="py-1 px-2 text-right font-bold">{row.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Top Destinations"
            icon={<MapPin className="h-6 w-6 text-purple-500" />}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-1 px-2 text-left font-semibold">Destination IP</th>
                    <th className="py-1 px-2 text-right font-semibold">Bytes</th>
                    <th className="py-1 px-2 text-right font-semibold">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {topDestinationsData.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1 px-2 font-mono">{row.destination}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">{row.bytes}</td>
                      <td className="py-1 px-2 text-right font-bold">{row.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
          <DashboardWidget
            title="Logs"
            icon={<Table className="h-6 w-6 text-gray-500" />}
          >
            <div className="flex items-center gap-2 mb-2">
              <input type="text" placeholder="Search..." className="border rounded px-2 py-1 text-xs" />
              <select className="border rounded px-2 py-1 text-xs">
                <option>All Types</option>
                <option>Allow</option>
                <option>Deny</option>
              </select>
              <select className="border rounded px-2 py-1 text-xs">
                <option>All Severity</option>
                <option>Info</option>
                <option>Warning</option>
                <option>Error</option>
              </select>
              <Button size="sm" variant="outline">Export</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-1 px-2 text-left font-semibold">Time</th>
                    <th className="py-1 px-2 text-left font-semibold">Type</th>
                    <th className="py-1 px-2 text-left font-semibold">Source</th>
                    <th className="py-1 px-2 text-left font-semibold">Destination</th>
                    <th className="py-1 px-2 text-left font-semibold">Detail</th>
                    <th className="py-1 px-2 text-left font-semibold">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1 px-2 font-mono">{row.time}</td>
                      <td className="py-1 px-2">{row.type}</td>
                      <td className="py-1 px-2 font-mono">{row.source}</td>
                      <td className="py-1 px-2 font-mono">{row.destination}</td>
                      <td className="py-1 px-2">{row.detail}</td>
                      <td className="py-1 px-2">
                        <Badge variant={row.severity === 'Info' ? 'default' : row.severity === 'Warning' ? 'secondary' : 'destructive'}>{row.severity}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </div>
      </main>
    </div>
  );
} 