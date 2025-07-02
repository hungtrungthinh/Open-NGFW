"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  Globe,
  Network,
  Server,
  BarChart3,
  TrendingUp,
  Eye
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Session {
  id: string;
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  port: number;
  state: "NEW" | "ESTABLISHED" | "RELATED" | "INVALID";
  bytes: number;
  duration: string;
  application: string;
  user: string;
  timestamp: string;
}

const mockSessions: Session[] = [
  {
    id: "1",
    sourceIp: "192.168.1.100",
    destinationIp: "8.8.8.8",
    protocol: "TCP",
    port: 443,
    state: "ESTABLISHED",
    bytes: 15420,
    duration: "2m 15s",
    application: "HTTPS",
    user: "admin",
    timestamp: "14:32:15"
  },
  {
    id: "2",
    sourceIp: "192.168.1.101",
    destinationIp: "1.1.1.1",
    protocol: "UDP",
    port: 53,
    state: "ESTABLISHED",
    bytes: 890,
    duration: "45s",
    application: "DNS",
    user: "user1",
    timestamp: "14:31:42"
  },
  {
    id: "3",
    sourceIp: "10.0.0.50",
    destinationIp: "192.168.1.100",
    protocol: "TCP",
    port: 22,
    state: "NEW",
    bytes: 0,
    duration: "0s",
    application: "SSH",
    user: "unknown",
    timestamp: "14:30:18"
  },
  {
    id: "4",
    sourceIp: "192.168.1.102",
    destinationIp: "208.67.222.222",
    protocol: "TCP",
    port: 80,
    state: "ESTABLISHED",
    bytes: 2340,
    duration: "1m 30s",
    application: "HTTP",
    user: "user2",
    timestamp: "14:29:55"
  },
  {
    id: "5",
    sourceIp: "192.168.1.103",
    destinationIp: "9.9.9.9",
    protocol: "UDP",
    port: 53,
    state: "ESTABLISHED",
    bytes: 1560,
    duration: "1m 5s",
    application: "DNS",
    user: "user3",
    timestamp: "14:28:33"
  }
];

const trafficData = [
  { time: "14:25", incoming: 1200, outgoing: 800, connections: 45 },
  { time: "14:26", incoming: 1800, outgoing: 1200, connections: 52 },
  { time: "14:27", incoming: 2400, outgoing: 1600, connections: 48 },
  { time: "14:28", incoming: 3000, outgoing: 2000, connections: 61 },
  { time: "14:29", incoming: 2800, outgoing: 1800, connections: 58 },
  { time: "14:30", incoming: 2200, outgoing: 1400, connections: 55 },
  { time: "14:31", incoming: 2600, outgoing: 1600, connections: 62 },
  { time: "14:32", incoming: 3200, outgoing: 2200, connections: 67 },
];

const protocolData = [
  { protocol: "HTTPS", connections: 25, bytes: 15420 },
  { protocol: "HTTP", connections: 15, bytes: 8900 },
  { protocol: "DNS", connections: 12, bytes: 5600 },
  { protocol: "SSH", connections: 8, bytes: 3200 },
  { protocol: "FTP", connections: 5, bytes: 1800 },
];

export default function TrafficMonitor() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(mockSessions);
  const [searchTerm, setSearchTerm] = useState("");
  const [protocolFilter, setProtocolFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    let filtered = sessions;

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.sourceIp.includes(searchTerm) ||
        session.destinationIp.includes(searchTerm) ||
        session.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (protocolFilter !== "all") {
      filtered = filtered.filter(session => session.protocol === protocolFilter);
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter(session => session.state === stateFilter);
    }

    setFilteredSessions(filtered);
  }, [sessions, searchTerm, protocolFilter, stateFilter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      const updatedSessions = sessions.map(session => ({
        ...session,
        bytes: session.bytes + Math.floor(Math.random() * 100),
        duration: updateDuration(session.duration)
      }));
      setSessions(updatedSessions);
    }, 5000);

    return () => clearInterval(interval);
  }, [sessions, autoRefresh]);

  const updateDuration = (duration: string): string => {
    const parts = duration.split(' ');
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    const newSeconds = seconds + 5;
    if (newSeconds >= 60) {
      return `${minutes + 1}m ${newSeconds - 60}s`;
    }
    return `${minutes}m ${newSeconds}s`;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case "ESTABLISHED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{state}</Badge>;
      case "NEW":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{state}</Badge>;
      case "RELATED":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{state}</Badge>;
      case "INVALID":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{state}</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traffic Monitor</h1>
          <p className="text-gray-600">Real-time network traffic monitoring and session analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <TrendingUp className="inline w-3 h-3 text-green-600 mr-1" />
              +5 from last minute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
            <Network className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(sessions.reduce((sum, session) => sum + session.bytes, 0))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Last 5 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(sessions.map(s => s.sourceIp).concat(sessions.map(s => s.destinationIp))).size}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Server className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {new Set(sessions.map(s => s.application)).size}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Different protocols
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Traffic Over Time
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Protocol Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={protocolData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="protocol" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="connections" fill="#8b5cf6" name="Connections" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by IP, application, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={protocolFilter} onValueChange={setProtocolFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="TCP">TCP</SelectItem>
                <SelectItem value="UDP">UDP</SelectItem>
                <SelectItem value="ICMP">ICMP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="ESTABLISHED">ESTABLISHED</SelectItem>
                <SelectItem value="RELATED">RELATED</SelectItem>
                <SelectItem value="INVALID">INVALID</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoRefresh" className="text-sm">Auto-refresh</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Live Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Source IP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destination IP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Protocol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Port</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">State</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Bytes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Application</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{session.sourceIp}</td>
                    <td className="py-3 px-4 font-mono text-sm">{session.destinationIp}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{session.protocol}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{session.port}</td>
                    <td className="py-3 px-4">
                      {getStateBadge(session.state)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{formatBytes(session.bytes)}</td>
                    <td className="py-3 px-4 text-sm">{session.duration}</td>
                    <td className="py-3 px-4 text-sm">{session.application}</td>
                    <td className="py-3 px-4 text-sm">{session.user}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 