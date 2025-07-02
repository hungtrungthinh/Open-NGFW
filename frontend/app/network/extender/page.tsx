"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Signal, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Activity,
  Wifi,
  Globe,
  MapPin,
  Users,
  Clock
} from "lucide-react";

interface NetworkExtender {
  id: string;
  name: string;
  type: "wifi" | "ethernet" | "cellular" | "satellite";
  status: "connected" | "disconnected" | "error";
  ip_address: string;
  mac_address: string;
  ssid?: string;
  signal_strength?: number;
  bandwidth: number;
  latency: number;
  priority: number;
  description: string;
  location: string;
  last_seen: string;
  connected_clients: number;
  max_clients: number;
}

export default function NetworkExtenderPage() {
  const [extenders, setExtenders] = useState<NetworkExtender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockExtenders: NetworkExtender[] = [
      {
        id: "1",
        name: "WiFi Extender 1",
        type: "wifi",
        status: "connected",
        ip_address: "192.168.1.50",
        mac_address: "00:1B:44:11:3A:C1",
        ssid: "Office_Network",
        signal_strength: 85,
        bandwidth: 50000000,
        latency: 15,
        priority: 1,
        description: "Main office WiFi extender",
        location: "Building A - Floor 1",
        last_seen: "2024-01-15 10:30:00",
        connected_clients: 12,
        max_clients: 50
      },
      {
        id: "2",
        name: "Cellular Backup",
        type: "cellular",
        status: "connected",
        ip_address: "10.0.0.10",
        mac_address: "00:1B:44:11:3A:C2",
        bandwidth: 25000000,
        latency: 45,
        priority: 2,
        description: "4G LTE backup connection",
        location: "Server Room",
        last_seen: "2024-01-15 10:30:00",
        connected_clients: 0,
        max_clients: 10
      },
      {
        id: "3",
        name: "Satellite Link",
        type: "satellite",
        status: "error",
        ip_address: "172.16.0.5",
        mac_address: "00:1B:44:11:3A:C3",
        bandwidth: 10000000,
        latency: 600,
        priority: 3,
        description: "Satellite internet connection",
        location: "Remote Office",
        last_seen: "2024-01-15 09:15:00",
        connected_clients: 0,
        max_clients: 5
      }
    ];

    setTimeout(() => {
      setExtenders(mockExtenders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "wifi":
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case "ethernet":
        return <Globe className="w-4 h-4 text-green-500" />;
      case "cellular":
        return <Signal className="w-4 h-4 text-purple-500" />;
      case "satellite":
        return <MapPin className="w-4 h-4 text-orange-500" />;
      default:
        return <Signal className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Extenders</h1>
          <p className="text-gray-600 mt-1">Manage network extender configuration and monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Extender
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Signal className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Extenders</p>
                <p className="text-2xl font-bold text-gray-900">{extenders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {extenders.filter(e => e.status === "connected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {extenders.reduce((sum, e) => sum + e.connected_clients, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bandwidth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(extenders.reduce((sum, e) => sum + e.bandwidth, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Network Extenders</CardTitle>
          <CardDescription>
            Monitor and configure network extenders and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Extender Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Clients</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {extenders.map((extender) => (
                  <tr key={extender.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{extender.name}</div>
                        <div className="text-sm text-gray-500">{extender.description}</div>
                        <div className="text-xs text-gray-400">{extender.location}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(extender.type)}
                        <Badge variant="outline" className="capitalize">
                          {extender.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(extender.status)}
                        <Badge 
                          variant={extender.status === "connected" ? "default" : 
                                   extender.status === "error" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {extender.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{extender.ip_address}</div>
                        <div className="text-sm text-gray-500">{extender.mac_address}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span>{formatBytes(extender.bandwidth)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-green-500" />
                          <span>{extender.latency}ms</span>
                        </div>
                        {extender.signal_strength && (
                          <div className="flex items-center space-x-1">
                            <Signal className="w-3 h-3 text-orange-500" />
                            <span>{extender.signal_strength}%</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{extender.connected_clients}</div>
                        <div className="text-gray-500">/ {extender.max_clients}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
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