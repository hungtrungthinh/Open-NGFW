"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  Cable, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Shield,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Tag,
  Network
} from "lucide-react";

interface NetworkInterface {
  id: string;
  name: string;
  type: "ethernet" | "wifi" | "pppoe" | "vlan" | "bridge" | "tunnel";
  status: "up" | "down" | "disabled";
  ip_address: string;
  netmask: string;
  gateway: string;
  mac_address: string;
  speed: string;
  duplex: "full" | "half";
  mtu: number;
  description: string;
  zone: string;
  dhcp_enabled: boolean;
  dhcp_server: boolean;
  pppoe_username?: string;
  pppoe_password?: string;
  vlan_id?: number;
  bridge_members?: string[];
  tunnel_remote_ip?: string;
  tunnel_local_ip?: string;
  bandwidth_limit?: number;
  priority?: number;
  security_level?: "high" | "medium" | "low";
  monitoring_enabled: boolean;
  last_seen?: string;
  traffic_in?: number;
  traffic_out?: number;
  errors?: number;
  collisions?: number;
}

export default function NetworkInterfacesPage() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState<NetworkInterface | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<NetworkInterface>>({});
  const [showPasswords, setShowPasswords] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockInterfaces: NetworkInterface[] = [
      {
        id: "1",
        name: "eth0",
        type: "ethernet",
        status: "up",
        ip_address: "192.168.1.1",
        netmask: "255.255.255.0",
        gateway: "192.168.1.254",
        mac_address: "00:1B:44:11:3A:B7",
        speed: "1 Gbps",
        duplex: "full",
        mtu: 1500,
        description: "LAN Interface",
        zone: "lan",
        dhcp_enabled: true,
        dhcp_server: true,
        monitoring_enabled: true,
        last_seen: "2024-01-15 10:30:00",
        traffic_in: 1024000,
        traffic_out: 512000,
        errors: 0,
        collisions: 0,
        bandwidth_limit: 1000000,
        priority: 1,
        security_level: "high"
      },
      {
        id: "2",
        name: "eth1",
        type: "ethernet",
        status: "up",
        ip_address: "203.0.113.1",
        netmask: "255.255.255.0",
        gateway: "203.0.113.254",
        mac_address: "00:1B:44:11:3A:B8",
        speed: "1 Gbps",
        duplex: "full",
        mtu: 1500,
        description: "WAN Interface",
        zone: "wan",
        dhcp_enabled: false,
        dhcp_server: false,
        monitoring_enabled: true,
        last_seen: "2024-01-15 10:30:00",
        traffic_in: 2048000,
        traffic_out: 1024000,
        errors: 2,
        collisions: 1,
        bandwidth_limit: 2000000,
        priority: 2,
        security_level: "high"
      },
      {
        id: "3",
        name: "pppoe0",
        type: "pppoe",
        status: "up",
        ip_address: "198.51.100.1",
        netmask: "255.255.255.255",
        gateway: "198.51.100.254",
        mac_address: "00:1B:44:11:3A:B9",
        speed: "100 Mbps",
        duplex: "full",
        mtu: 1492,
        description: "PPPoE Connection",
        zone: "wan",
        dhcp_enabled: false,
        dhcp_server: false,
        pppoe_username: "user@isp.com",
        pppoe_password: "********",
        monitoring_enabled: true,
        last_seen: "2024-01-15 10:30:00",
        traffic_in: 512000,
        traffic_out: 256000,
        errors: 0,
        collisions: 0,
        bandwidth_limit: 100000,
        priority: 3,
        security_level: "medium"
      },
      {
        id: "4",
        name: "vlan100",
        type: "vlan",
        status: "up",
        ip_address: "10.0.100.1",
        netmask: "255.255.255.0",
        gateway: "",
        mac_address: "00:1B:44:11:3A:BA",
        speed: "1 Gbps",
        duplex: "full",
        mtu: 1500,
        description: "VLAN 100 - Guest Network",
        zone: "guest",
        dhcp_enabled: true,
        dhcp_server: true,
        vlan_id: 100,
        monitoring_enabled: true,
        last_seen: "2024-01-15 10:30:00",
        traffic_in: 256000,
        traffic_out: 128000,
        errors: 0,
        collisions: 0,
        bandwidth_limit: 500000,
        priority: 4,
        security_level: "low"
      },
      {
        id: "5",
        name: "wlan0",
        type: "wifi",
        status: "up",
        ip_address: "192.168.2.1",
        netmask: "255.255.255.0",
        gateway: "",
        mac_address: "00:1B:44:11:3A:BB",
        speed: "300 Mbps",
        duplex: "full",
        mtu: 1500,
        description: "Wireless LAN",
        zone: "lan",
        dhcp_enabled: true,
        dhcp_server: true,
        monitoring_enabled: true,
        last_seen: "2024-01-15 10:30:00",
        traffic_in: 512000,
        traffic_out: 256000,
        errors: 1,
        collisions: 0,
        bandwidth_limit: 300000,
        priority: 5,
        security_level: "medium"
      }
    ];

    setTimeout(() => {
      setInterfaces(mockInterfaces);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (interface_: NetworkInterface) => {
    setSelectedInterface(interface_);
    setFormData(interface_);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedInterface(null);
    setFormData({
      type: "ethernet",
      status: "down",
      dhcp_enabled: false,
      dhcp_server: false,
      monitoring_enabled: true,
      mtu: 1500,
      duplex: "full",
      security_level: "medium",
      priority: 1
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedInterface) {
      // Update existing interface
      setInterfaces(prev => prev.map(intf => 
        intf.id === selectedInterface.id ? { ...intf, ...formData } : intf
      ));
    } else {
      // Add new interface
      const newInterface: NetworkInterface = {
        id: Date.now().toString(),
        name: formData.name || "eth" + (interfaces.length + 1),
        type: formData.type || "ethernet",
        status: formData.status || "down",
        ip_address: formData.ip_address || "",
        netmask: formData.netmask || "",
        gateway: formData.gateway || "",
        mac_address: formData.mac_address || "",
        speed: formData.speed || "1 Gbps",
        duplex: formData.duplex || "full",
        mtu: formData.mtu || 1500,
        description: formData.description || "",
        zone: formData.zone || "lan",
        dhcp_enabled: formData.dhcp_enabled || false,
        dhcp_server: formData.dhcp_server || false,
        pppoe_username: formData.pppoe_username,
        pppoe_password: formData.pppoe_password,
        vlan_id: formData.vlan_id,
        bridge_members: formData.bridge_members,
        tunnel_remote_ip: formData.tunnel_remote_ip,
        tunnel_local_ip: formData.tunnel_local_ip,
        bandwidth_limit: formData.bandwidth_limit,
        priority: formData.priority || 1,
        security_level: formData.security_level || "medium",
        monitoring_enabled: formData.monitoring_enabled || true,
        last_seen: new Date().toISOString(),
        traffic_in: 0,
        traffic_out: 0,
        errors: 0,
        collisions: 0
      };
      setInterfaces(prev => [...prev, newInterface]);
    }
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setInterfaces(prev => prev.filter(intf => intf.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setInterfaces(prev => prev.map(intf => 
      intf.id === id ? { ...intf, status: intf.status === "up" ? "down" : "up" } : intf
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "up":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "down":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "disabled":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ethernet":
        return <Cable className="w-4 h-4" />;
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "pppoe":
        return <Globe className="w-4 h-4" />;
      case "vlan":
        return <Tag className="w-4 h-4" />;
      case "bridge":
        return <Network className="w-4 h-4" />;
      case "tunnel":
        return <Lock className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Network Interfaces</h1>
          <p className="text-gray-600 mt-1">Manage physical and virtual network interfaces</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Interface
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interfaces</p>
                <p className="text-2xl font-bold text-gray-900">{interfaces.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interfaces.filter(i => i.status === "up").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Traffic</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(interfaces.reduce((sum, i) => sum + (i.traffic_in || 0) + (i.traffic_out || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interfaces.reduce((sum, i) => sum + (i.errors || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interfaces Table */}
      <Card>
        <CardHeader>
          <CardTitle>Network Interfaces</CardTitle>
          <CardDescription>
            Configure and monitor network interfaces, VLANs, and tunnels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Interface</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Zone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Traffic</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interfaces.map((interface_) => (
                  <tr key={interface_.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{interface_.name}</div>
                        <div className="text-sm text-gray-500">{interface_.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(interface_.type)}
                        <Badge variant="outline" className="capitalize">
                          {interface_.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(interface_.status)}
                        <Badge 
                          variant={interface_.status === "up" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {interface_.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{interface_.ip_address}</div>
                        <div className="text-sm text-gray-500">{interface_.netmask}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {interface_.zone}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Download className="w-3 h-3 text-green-500" />
                          <span>{formatBytes(interface_.traffic_in || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Upload className="w-3 h-3 text-blue-500" />
                          <span>{formatBytes(interface_.traffic_out || 0)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(interface_.id)}
                        >
                          {interface_.status === "up" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(interface_)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(interface_.id)}
                        >
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

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen || isAddDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedInterface ? "Edit Interface" : "Add New Interface"}
            </DialogTitle>
            <DialogDescription>
              Configure network interface settings and parameters
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Interface Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="eth0"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Interface Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethernet">Ethernet</SelectItem>
                    <SelectItem value="wifi">WiFi</SelectItem>
                    <SelectItem value="pppoe">PPPoE</SelectItem>
                    <SelectItem value="vlan">VLAN</SelectItem>
                    <SelectItem value="bridge">Bridge</SelectItem>
                    <SelectItem value="tunnel">Tunnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Interface description"
                />
              </div>

              <div>
                <Label htmlFor="zone">Zone</Label>
                <Select value={formData.zone} onValueChange={(value) => setFormData({...formData, zone: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lan">LAN</SelectItem>
                    <SelectItem value="wan">WAN</SelectItem>
                    <SelectItem value="dmz">DMZ</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Network Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={formData.ip_address || ""}
                  onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                  placeholder="192.168.1.1"
                />
              </div>

              <div>
                <Label htmlFor="netmask">Netmask</Label>
                <Input
                  id="netmask"
                  value={formData.netmask || ""}
                  onChange={(e) => setFormData({...formData, netmask: e.target.value})}
                  placeholder="255.255.255.0"
                />
              </div>

              <div>
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  value={formData.gateway || ""}
                  onChange={(e) => setFormData({...formData, gateway: e.target.value})}
                  placeholder="192.168.1.254"
                />
              </div>

              <div>
                <Label htmlFor="mtu">MTU</Label>
                <Input
                  id="mtu"
                  type="number"
                  value={formData.mtu || 1500}
                  onChange={(e) => setFormData({...formData, mtu: parseInt(e.target.value)})}
                  min="68"
                  max="9000"
                />
              </div>
            </div>
          </div>

          {/* PPPoE Settings */}
          {formData.type === "pppoe" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">PPPoE Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pppoe_username">Username</Label>
                  <Input
                    id="pppoe_username"
                    value={formData.pppoe_username || ""}
                    onChange={(e) => setFormData({...formData, pppoe_username: e.target.value})}
                    placeholder="user@isp.com"
                  />
                </div>
                <div>
                  <Label htmlFor="pppoe_password">Password</Label>
                  <div className="relative">
                    <Input
                      id="pppoe_password"
                      type={showPasswords ? "text" : "password"}
                      value={formData.pppoe_password || ""}
                      onChange={(e) => setFormData({...formData, pppoe_password: e.target.value})}
                      placeholder="Password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VLAN Settings */}
          {formData.type === "vlan" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">VLAN Settings</h3>
              <div>
                <Label htmlFor="vlan_id">VLAN ID</Label>
                <Input
                  id="vlan_id"
                  type="number"
                  value={formData.vlan_id || ""}
                  onChange={(e) => setFormData({...formData, vlan_id: parseInt(e.target.value)})}
                  placeholder="100"
                  min="1"
                  max="4094"
                />
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Advanced Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dhcp_enabled"
                  checked={formData.dhcp_enabled}
                  onCheckedChange={(checked) => setFormData({...formData, dhcp_enabled: checked})}
                />
                <Label htmlFor="dhcp_enabled">DHCP Client</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="dhcp_server"
                  checked={formData.dhcp_server}
                  onCheckedChange={(checked) => setFormData({...formData, dhcp_server: checked})}
                />
                <Label htmlFor="dhcp_server">DHCP Server</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="monitoring_enabled"
                  checked={formData.monitoring_enabled}
                  onCheckedChange={(checked) => setFormData({...formData, monitoring_enabled: checked})}
                />
                <Label htmlFor="monitoring_enabled">Enable Monitoring</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setIsAddDialogOpen(false);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedInterface ? "Update" : "Create"} Interface
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 