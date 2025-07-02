"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Network,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Server,
  Globe
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data for charts
const trafficData = [
  { time: "00:00", incoming: 1200, outgoing: 800 },
  { time: "04:00", incoming: 1800, outgoing: 1200 },
  { time: "08:00", incoming: 2400, outgoing: 1600 },
  { time: "12:00", incoming: 3000, outgoing: 2000 },
  { time: "16:00", incoming: 2800, outgoing: 1800 },
  { time: "20:00", incoming: 2200, outgoing: 1400 },
  { time: "23:59", incoming: 1500, outgoing: 1000 },
];

const threatData = [
  { name: "Malware", value: 35, color: "#ef4444" },
  { name: "DDoS", value: 25, color: "#f97316" },
  { name: "Phishing", value: 20, color: "#eab308" },
  { name: "Exploits", value: 15, color: "#8b5cf6" },
  { name: "Other", value: 5, color: "#6b7280" },
];

const applicationData = [
  { name: "HTTP/HTTPS", value: 45 },
  { name: "FTP", value: 15 },
  { name: "SSH", value: 10 },
  { name: "SMTP", value: 8 },
  { name: "DNS", value: 7 },
  { name: "Other", value: 15 },
];

const topSources = [
  { ip: "192.168.1.100", traffic: "2.5 GB", connections: 1250 },
  { ip: "192.168.1.101", traffic: "1.8 GB", connections: 890 },
  { ip: "192.168.1.102", traffic: "1.2 GB", connections: 650 },
  { ip: "192.168.1.103", traffic: "950 MB", connections: 420 },
  { ip: "192.168.1.104", traffic: "750 MB", connections: 380 },
];

const topDestinations = [
  { ip: "8.8.8.8", traffic: "1.5 GB", connections: 850 },
  { ip: "1.1.1.1", traffic: "1.2 GB", connections: 720 },
  { ip: "208.67.222.222", traffic: "900 MB", connections: 540 },
  { ip: "9.9.9.9", traffic: "750 MB", connections: 420 },
  { ip: "8.8.4.4", traffic: "600 MB", connections: 380 },
];

interface DashboardStats {
  securityRating: number;
  activeConnections: number;
  blockedThreats: number;
  allowedConnections: number;
  systemCpu: number;
  systemMemory: number;
  systemDisk: number;
  uptime: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    securityRating: 92,
    activeConnections: 1240,
    blockedThreats: 37,
    allowedConnections: 1203,
    systemCpu: 32,
    systemMemory: 68,
    systemDisk: 54,
    uptime: "3 days 12:45:22"
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getSecurityRatingColor = (rating: number) => {
    if (rating >= 80) return "text-green-600";
    if (rating >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSecurityRatingIcon = (rating: number) => {
    if (rating >= 80) return <ShieldCheck className="w-6 h-6 text-green-600" />;
    if (rating >= 60) return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    return <ShieldX className="w-6 h-6 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">System overview and security status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            System Online
          </Badge>
          <span className="text-sm text-gray-500">Uptime: {stats.uptime}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Security Rating Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Rating</CardTitle>
            {getSecurityRatingIcon(stats.securityRating)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getSecurityRatingColor(stats.securityRating)}>
                {stats.securityRating}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Excellent protection level
            </p>
          </CardContent>
        </Card>

        {/* Active Connections Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Network className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeConnections.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <TrendingUp className="inline w-3 h-3 text-green-600 mr-1" />
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        {/* Blocked Threats Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Threats</CardTitle>
            <ShieldX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.blockedThreats}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        {/* Allowed Connections Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allowed Connections</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.allowedConnections.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources and Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Resources Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{stats.systemCpu}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.systemCpu}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{stats.systemMemory}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.systemMemory}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disk Usage</span>
                <span>{stats.systemDisk}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${stats.systemDisk}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Monitor Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Traffic Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="incoming" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Incoming"
                />
                <Area 
                  type="monotone" 
                  dataKey="outgoing" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Outgoing"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Threat Protection and Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Protection Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Threat Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {threatData.map((threat, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: threat.color }}
                  ></div>
                  <span className="flex-1">{threat.name}</span>
                  <span className="font-medium">{threat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Applications Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Sources and Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sources Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Top Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{source.ip}</div>
                    <div className="text-sm text-gray-600">{source.connections} connections</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">{source.traffic}</div>
                    <div className="text-sm text-gray-600">Traffic</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Destinations Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownRight className="w-5 h-5 mr-2" />
              Top Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDestinations.map((dest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{dest.ip}</div>
                    <div className="text-sm text-gray-600">{dest.connections} connections</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{dest.traffic}</div>
                    <div className="text-sm text-gray-600">Traffic</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "14:32:15", type: "Firewall", message: "Blocked connection from 192.168.1.100", severity: "high" },
              { time: "14:31:42", type: "IPS", message: "Detected SQL injection attempt", severity: "high" },
              { time: "14:30:18", type: "VPN", message: "User admin connected from 203.0.113.45", severity: "info" },
              { time: "14:29:55", type: "System", message: "Backup completed successfully", severity: "info" },
              { time: "14:28:33", type: "Antivirus", message: "Quarantined suspicious file", severity: "medium" },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500 w-16">{log.time}</div>
                  <Badge 
                    variant="outline" 
                    className={
                      log.severity === "high" ? "border-red-200 text-red-700 bg-red-50" :
                      log.severity === "medium" ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                      "border-blue-200 text-blue-700 bg-blue-50"
                    }
                  >
                    {log.type}
                  </Badge>
                  <span className="text-sm text-gray-700">{log.message}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {log.severity === "high" && <XCircle className="w-4 h-4 text-red-500" />}
                  {log.severity === "medium" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                  {log.severity === "info" && <CheckCircle className="w-4 h-4 text-blue-500" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full">
              View All Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 