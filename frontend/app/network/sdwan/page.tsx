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
  GitBranch, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Network,
  Globe,
  Shield,
  Clock,
  BarChart3,
  TrendingUp
} from "lucide-react";

interface SDWANInterface {
  id: string;
  name: string;
  type: "wan" | "lan" | "vpn";
  interface: string;
  status: "up" | "down" | "disabled";
  ip_address: string;
  gateway: string;
  cost: number;
  priority: number;
  bandwidth: number;
  latency: number;
  jitter: number;
  packet_loss: number;
  last_updated: string;
}

interface SDWANRule {
  id: string;
  name: string;
  priority: number;
  status: "active" | "inactive";
  description: string;
  
  // Match criteria
  source_address: string;
  destination_address: string;
  service: string;
  application: string;
  
  // Action
  action: "load_balance" | "failover" | "preferred" | "block";
  interfaces: string[];
  load_balance_method: "round_robin" | "weighted" | "spillover" | "lowest_cost";
  health_check: boolean;
  health_check_ip: string;
  
  created_at: string;
  last_updated: string;
}

export default function SDWANPage() {
  const [interfaces, setInterfaces] = useState<SDWANInterface[]>([]);
  const [rules, setRules] = useState<SDWANRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState<SDWANInterface | null>(null);
  const [selectedRule, setSelectedRule] = useState<SDWANRule | null>(null);
  const [isInterfaceDialogOpen, setIsInterfaceDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isAddInterfaceDialogOpen, setIsAddInterfaceDialogOpen] = useState(false);
  const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState(false);
  const [interfaceFormData, setInterfaceFormData] = useState<Partial<SDWANInterface>>({});
  const [ruleFormData, setRuleFormData] = useState<Partial<SDWANRule>>({});

  // Mock data for demonstration
  useEffect(() => {
    const mockInterfaces: SDWANInterface[] = [
      {
        id: "1",
        name: "Primary WAN",
        type: "wan",
        interface: "eth1",
        status: "up",
        ip_address: "203.0.113.1",
        gateway: "203.0.113.254",
        cost: 10,
        priority: 1,
        bandwidth: 100000000,
        latency: 15,
        jitter: 2,
        packet_loss: 0.1,
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "2",
        name: "Secondary WAN",
        type: "wan",
        interface: "pppoe0",
        status: "up",
        ip_address: "198.51.100.1",
        gateway: "198.51.100.254",
        cost: 20,
        priority: 2,
        bandwidth: 50000000,
        latency: 25,
        jitter: 5,
        packet_loss: 0.5,
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "3",
        name: "VPN Tunnel",
        type: "vpn",
        interface: "tun0",
        status: "up",
        ip_address: "10.0.0.1",
        gateway: "10.0.0.254",
        cost: 30,
        priority: 3,
        bandwidth: 25000000,
        latency: 50,
        jitter: 10,
        packet_loss: 1.0,
        last_updated: "2024-01-15 10:30:00"
      }
    ];

    const mockRules: SDWANRule[] = [
      {
        id: "1",
        name: "VoIP Traffic",
        priority: 10,
        status: "active",
        description: "Route VoIP traffic through primary WAN",
        source_address: "192.168.1.0/24",
        destination_address: "0.0.0.0/0",
        service: "SIP,RTP",
        application: "voip",
        action: "preferred",
        interfaces: ["Primary WAN"],
        load_balance_method: "round_robin",
        health_check: true,
        health_check_ip: "8.8.8.8",
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "2",
        name: "Web Traffic Load Balance",
        priority: 20,
        status: "active",
        description: "Load balance web traffic across all interfaces",
        source_address: "192.168.1.0/24",
        destination_address: "0.0.0.0/0",
        service: "HTTP,HTTPS",
        application: "web",
        action: "load_balance",
        interfaces: ["Primary WAN", "Secondary WAN"],
        load_balance_method: "weighted",
        health_check: true,
        health_check_ip: "1.1.1.1",
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "3",
        name: "Failover Rule",
        priority: 30,
        status: "active",
        description: "Failover to secondary WAN if primary fails",
        source_address: "0.0.0.0/0",
        destination_address: "0.0.0.0/0",
        service: "ANY",
        application: "any",
        action: "failover",
        interfaces: ["Primary WAN", "Secondary WAN", "VPN Tunnel"],
        load_balance_method: "round_robin",
        health_check: true,
        health_check_ip: "8.8.8.8",
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      }
    ];

    setTimeout(() => {
      setInterfaces(mockInterfaces);
      setRules(mockRules);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddInterface = () => {
    setSelectedInterface(null);
    setInterfaceFormData({
      type: "wan",
      status: "down",
      cost: 10,
      priority: 1,
      bandwidth: 100000000,
      latency: 0,
      jitter: 0,
      packet_loss: 0
    });
    setIsAddInterfaceDialogOpen(true);
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setRuleFormData({
      status: "active",
      priority: 100,
      action: "load_balance",
      load_balance_method: "round_robin",
      health_check: true,
      service: "ANY",
      application: "any"
    });
    setIsAddRuleDialogOpen(true);
  };

  const handleSaveInterface = () => {
    if (selectedInterface) {
      setInterfaces(prev => prev.map(intf => 
        intf.id === selectedInterface.id ? { ...intf, ...interfaceFormData } : intf
      ));
    } else {
      const newInterface: SDWANInterface = {
        id: Date.now().toString(),
        name: interfaceFormData.name || "SD-WAN Interface " + (interfaces.length + 1),
        type: interfaceFormData.type || "wan",
        interface: interfaceFormData.interface || "",
        status: interfaceFormData.status || "down",
        ip_address: interfaceFormData.ip_address || "",
        gateway: interfaceFormData.gateway || "",
        cost: interfaceFormData.cost || 10,
        priority: interfaceFormData.priority || 1,
        bandwidth: interfaceFormData.bandwidth || 100000000,
        latency: interfaceFormData.latency || 0,
        jitter: interfaceFormData.jitter || 0,
        packet_loss: interfaceFormData.packet_loss || 0,
        last_updated: new Date().toISOString()
      };
      setInterfaces(prev => [...prev, newInterface]);
    }
    setIsInterfaceDialogOpen(false);
    setIsAddInterfaceDialogOpen(false);
    setInterfaceFormData({});
  };

  const handleSaveRule = () => {
    if (selectedRule) {
      setRules(prev => prev.map(rule => 
        rule.id === selectedRule.id ? { ...rule, ...ruleFormData } : rule
      ));
    } else {
      const newRule: SDWANRule = {
        id: Date.now().toString(),
        name: ruleFormData.name || "SD-WAN Rule " + (rules.length + 1),
        priority: ruleFormData.priority || 100,
        status: ruleFormData.status || "active",
        description: ruleFormData.description || "",
        source_address: ruleFormData.source_address || "",
        destination_address: ruleFormData.destination_address || "",
        service: ruleFormData.service || "ANY",
        application: ruleFormData.application || "any",
        action: ruleFormData.action || "load_balance",
        interfaces: ruleFormData.interfaces || [],
        load_balance_method: ruleFormData.load_balance_method || "round_robin",
        health_check: ruleFormData.health_check || false,
        health_check_ip: ruleFormData.health_check_ip || "",
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      setRules(prev => [...prev, newRule]);
    }
    setIsRuleDialogOpen(false);
    setIsAddRuleDialogOpen(false);
    setRuleFormData({});
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
      case "wan":
        return <Globe className="w-4 h-4 text-blue-500" />;
      case "lan":
        return <Network className="w-4 h-4 text-green-500" />;
      case "vpn":
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <GitBranch className="w-4 h-4 text-gray-400" />;
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
          <h1 className="text-3xl font-bold text-gray-900">SD-WAN</h1>
          <p className="text-gray-600 mt-1">Software-defined WAN configuration and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddInterface}>
            <Plus className="w-4 h-4 mr-2" />
            Add Interface
          </Button>
          <Button onClick={handleAddRule}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Active Interfaces</p>
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
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bandwidth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(interfaces.reduce((sum, i) => sum + i.bandwidth, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SD-WAN Interfaces */}
      <Card>
        <CardHeader>
          <CardTitle>SD-WAN Interfaces</CardTitle>
          <CardDescription>
            Configure and monitor SD-WAN interfaces and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Interface Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cost/Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interfaces.map((interface_) => (
                  <tr key={interface_.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{interface_.name}</div>
                        <div className="text-sm text-gray-500">{interface_.interface}</div>
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
                        <div className="text-sm text-gray-500">GW: {interface_.gateway}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span>{formatBytes(interface_.bandwidth)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{interface_.latency}ms</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span>{interface_.packet_loss}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>Cost: {interface_.cost}</div>
                        <div>Priority: {interface_.priority}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInterface(interface_);
                            setInterfaceFormData(interface_);
                            setIsInterfaceDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInterfaces(prev => prev.filter(i => i.id !== interface_.id));
                          }}
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

      {/* SD-WAN Rules */}
      <Card>
        <CardHeader>
          <CardTitle>SD-WAN Rules</CardTitle>
          <CardDescription>
            Configure traffic steering rules and load balancing policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rule Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Match Criteria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Interfaces</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{rule.name}</div>
                        <div className="text-sm text-gray-500">{rule.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{rule.priority}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Src:</span> {rule.source_address}
                        </div>
                        <div>
                          <span className="font-medium">Dst:</span> {rule.destination_address}
                        </div>
                        <div>
                          <span className="font-medium">Service:</span> {rule.service}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={rule.action === "load_balance" ? "default" : 
                                   rule.action === "failover" ? "secondary" : 
                                   rule.action === "preferred" ? "outline" : "destructive"}
                          className="capitalize"
                        >
                          {rule.action.replace("_", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {rule.interfaces.map((intf, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {intf}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(rule.status)}
                        <Badge 
                          variant={rule.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {rule.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setRuleFormData(rule);
                            setIsRuleDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRules(prev => prev.filter(r => r.id !== rule.id));
                          }}
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

      {/* Interface Dialog */}
      <Dialog open={isInterfaceDialogOpen || isAddInterfaceDialogOpen} onOpenChange={setIsInterfaceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInterface ? "Edit SD-WAN Interface" : "Add New SD-WAN Interface"}
            </DialogTitle>
            <DialogDescription>
              Configure SD-WAN interface parameters and performance settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Interface Name</Label>
                <Input
                  id="name"
                  value={interfaceFormData.name || ""}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, name: e.target.value})}
                  placeholder="Primary WAN"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Interface Type</Label>
                <Select value={interfaceFormData.type} onValueChange={(value) => setInterfaceFormData({...interfaceFormData, type: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wan">WAN</SelectItem>
                    <SelectItem value="lan">LAN</SelectItem>
                    <SelectItem value="vpn">VPN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interface">Physical Interface</Label>
                <Input
                  id="interface"
                  value={interfaceFormData.interface || ""}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, interface: e.target.value})}
                  placeholder="eth1"
                />
              </div>

              <div>
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={interfaceFormData.ip_address || ""}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, ip_address: e.target.value})}
                  placeholder="203.0.113.1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  value={interfaceFormData.gateway || ""}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, gateway: e.target.value})}
                  placeholder="203.0.113.254"
                />
              </div>

              <div>
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={interfaceFormData.cost || 10}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, cost: parseInt(e.target.value)})}
                  min="1"
                  max="255"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={interfaceFormData.priority || 1}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, priority: parseInt(e.target.value)})}
                  min="1"
                  max="255"
                />
              </div>

              <div>
                <Label htmlFor="bandwidth">Bandwidth (bps)</Label>
                <Input
                  id="bandwidth"
                  type="number"
                  value={interfaceFormData.bandwidth || 100000000}
                  onChange={(e) => setInterfaceFormData({...interfaceFormData, bandwidth: parseInt(e.target.value)})}
                  placeholder="100000000"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsInterfaceDialogOpen(false);
              setIsAddInterfaceDialogOpen(false);
              setInterfaceFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveInterface}>
              {selectedInterface ? "Update" : "Create"} Interface
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog open={isRuleDialogOpen || isAddRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? "Edit SD-WAN Rule" : "Add New SD-WAN Rule"}
            </DialogTitle>
            <DialogDescription>
              Configure SD-WAN traffic steering rules and policies
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={ruleFormData.name || ""}
                  onChange={(e) => setRuleFormData({...ruleFormData, name: e.target.value})}
                  placeholder="VoIP Traffic"
                />
              </div>
              
              <div>
                <Label htmlFor="rule_priority">Priority</Label>
                <Input
                  id="rule_priority"
                  type="number"
                  value={ruleFormData.priority || 100}
                  onChange={(e) => setRuleFormData({...ruleFormData, priority: parseInt(e.target.value)})}
                  min="1"
                  max="65535"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rule_description">Description</Label>
              <Input
                id="rule_description"
                value={ruleFormData.description || ""}
                onChange={(e) => setRuleFormData({...ruleFormData, description: e.target.value})}
                placeholder="Rule description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source_address">Source Address</Label>
                <Input
                  id="source_address"
                  value={ruleFormData.source_address || ""}
                  onChange={(e) => setRuleFormData({...ruleFormData, source_address: e.target.value})}
                  placeholder="192.168.1.0/24"
                />
              </div>

              <div>
                <Label htmlFor="destination_address">Destination Address</Label>
                <Input
                  id="destination_address"
                  value={ruleFormData.destination_address || ""}
                  onChange={(e) => setRuleFormData({...ruleFormData, destination_address: e.target.value})}
                  placeholder="0.0.0.0/0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={ruleFormData.service} onValueChange={(value) => setRuleFormData({...ruleFormData, service: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">ANY</SelectItem>
                    <SelectItem value="HTTP,HTTPS">HTTP/HTTPS</SelectItem>
                    <SelectItem value="SIP,RTP">SIP/RTP</SelectItem>
                    <SelectItem value="FTP">FTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={ruleFormData.action} onValueChange={(value) => setRuleFormData({...ruleFormData, action: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="load_balance">Load Balance</SelectItem>
                    <SelectItem value="failover">Failover</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="health_check"
                checked={ruleFormData.health_check}
                onCheckedChange={(checked) => setRuleFormData({...ruleFormData, health_check: checked})}
              />
              <Label htmlFor="health_check">Enable Health Check</Label>
            </div>

            {ruleFormData.health_check && (
              <div>
                <Label htmlFor="health_check_ip">Health Check IP</Label>
                <Input
                  id="health_check_ip"
                  value={ruleFormData.health_check_ip || ""}
                  onChange={(e) => setRuleFormData({...ruleFormData, health_check_ip: e.target.value})}
                  placeholder="8.8.8.8"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRuleDialogOpen(false);
              setIsAddRuleDialogOpen(false);
              setRuleFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              {selectedRule ? "Update" : "Create"} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 