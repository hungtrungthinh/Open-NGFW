"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Network,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Wifi,
  Server,
  ArrowRight,
  Settings,
  RefreshCw,
  Eye,
  BarChart3
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NATRule {
  id: string;
  name: string;
  originalIp: string;
  originalPort: string;
  translatedIp: string;
  translatedPort: string;
  type: "SNAT" | "DNAT" | "PAT";
  status: "enabled" | "disabled";
  description: string;
  interface: string;
  created: string;
  hits: number;
}

const mockNATRules: NATRule[] = [
  {
    id: "1",
    name: "Internet Access",
    originalIp: "192.168.1.0/24",
    originalPort: "any",
    translatedIp: "203.0.113.1",
    translatedPort: "any",
    type: "SNAT",
    status: "enabled",
    description: "Allow internal network to access internet",
    interface: "wan1",
    created: "2024-01-15",
    hits: 15420
  },
  {
    id: "2",
    name: "Web Server",
    originalIp: "any",
    originalPort: "80,443",
    translatedIp: "192.168.1.100",
    translatedPort: "80,443",
    type: "DNAT",
    status: "enabled",
    description: "Forward web traffic to internal server",
    interface: "wan1",
    created: "2024-01-14",
    hits: 8900
  },
  {
    id: "3",
    name: "SSH Access",
    originalIp: "any",
    originalPort: "2222",
    translatedIp: "192.168.1.101",
    translatedPort: "22",
    type: "DNAT",
    status: "enabled",
    description: "SSH access to internal server",
    interface: "wan1",
    created: "2024-01-13",
    hits: 2340
  },
  {
    id: "4",
    name: "FTP Server",
    originalIp: "any",
    originalPort: "21",
    translatedIp: "192.168.1.102",
    translatedPort: "21",
    type: "DNAT",
    status: "enabled",
    description: "FTP server access",
    interface: "wan1",
    created: "2024-01-12",
    hits: 1560
  },
  {
    id: "5",
    name: "DMZ Access",
    originalIp: "192.168.1.0/24",
    originalPort: "any",
    translatedIp: "10.0.0.1",
    translatedPort: "any",
    type: "SNAT",
    status: "enabled",
    description: "Access to DMZ network",
    interface: "dmz",
    created: "2024-01-11",
    hits: 890
  }
];

const natTypes = ["SNAT", "DNAT", "PAT"];
const interfaces = ["wan1", "wan2", "dmz", "lan1", "lan2"];

const natStatsData = [
  { time: "14:25", snat: 1200, dnat: 800, pat: 400 },
  { time: "14:26", snat: 1800, dnat: 1200, pat: 600 },
  { time: "14:27", snat: 2400, dnat: 1600, pat: 800 },
  { time: "14:28", snat: 3000, dnat: 2000, pat: 1000 },
  { time: "14:29", snat: 2800, dnat: 1800, pat: 900 },
  { time: "14:30", snat: 2200, dnat: 1400, pat: 700 },
  { time: "14:31", snat: 2600, dnat: 1600, pat: 800 },
  { time: "14:32", snat: 3200, dnat: 2200, pat: 1100 },
];

export default function NAT() {
  const [rules, setRules] = useState<NATRule[]>(mockNATRules);
  const [filteredRules, setFilteredRules] = useState<NATRule[]>(mockNATRules);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NATRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<NATRule>>({
    name: "",
    originalIp: "",
    originalPort: "",
    translatedIp: "",
    translatedPort: "",
    type: "SNAT",
    status: "enabled",
    description: "",
    interface: "wan1"
  });

  useEffect(() => {
    let filtered = rules;

    if (searchTerm) {
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.originalIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.translatedIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(rule => rule.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(rule => rule.status === statusFilter);
    }

    setFilteredRules(filtered);
  }, [rules, searchTerm, typeFilter, statusFilter]);

  const handleAddRule = () => {
    const rule: NATRule = {
      id: Date.now().toString(),
      name: newRule.name || "",
      originalIp: newRule.originalIp || "",
      originalPort: newRule.originalPort || "",
      translatedIp: newRule.translatedIp || "",
      translatedPort: newRule.translatedPort || "",
      type: newRule.type || "SNAT",
      status: newRule.status || "enabled",
      description: newRule.description || "",
      interface: newRule.interface || "wan1",
      created: new Date().toISOString().split('T')[0],
      hits: 0
    };

    setRules([rule, ...rules]);
    setNewRule({
      name: "",
      originalIp: "",
      originalPort: "",
      translatedIp: "",
      translatedPort: "",
      type: "SNAT",
      status: "enabled",
      description: "",
      interface: "wan1"
    });
    setIsAddDialogOpen(false);
  };

  const handleEditRule = (rule: NATRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setIsAddDialogOpen(true);
  };

  const handleUpdateRule = () => {
    if (!editingRule) return;

    const updatedRules = rules.map(rule =>
      rule.id === editingRule.id ? { ...newRule, id: rule.id, created: rule.created, hits: rule.hits } as NATRule : rule
    );

    setRules(updatedRules);
    setEditingRule(null);
    setNewRule({
      name: "",
      originalIp: "",
      originalPort: "",
      translatedIp: "",
      translatedPort: "",
      type: "SNAT",
      status: "enabled",
      description: "",
      interface: "wan1"
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const toggleRuleStatus = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, status: rule.status === "enabled" ? "disabled" : "enabled" } : rule
    ));
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SNAT":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{type}</Badge>;
      case "DNAT":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{type}</Badge>;
      case "PAT":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Address Translation (NAT)</h1>
          <p className="text-gray-600">Manage IP address translation and port forwarding rules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add NAT Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? "Edit NAT Rule" : "Add New NAT Rule"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="Enter rule name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">NAT Type</Label>
                  <Select value={newRule.type} onValueChange={(value: "SNAT" | "DNAT" | "PAT") => setNewRule({ ...newRule, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {natTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalIp">Original IP</Label>
                  <Input
                    id="originalIp"
                    value={newRule.originalIp}
                    onChange={(e) => setNewRule({ ...newRule, originalIp: e.target.value })}
                    placeholder="e.g. 192.168.1.0/24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPort">Original Port</Label>
                  <Input
                    id="originalPort"
                    value={newRule.originalPort}
                    onChange={(e) => setNewRule({ ...newRule, originalPort: e.target.value })}
                    placeholder="e.g. 80,443 or any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="translatedIp">Translated IP</Label>
                  <Input
                    id="translatedIp"
                    value={newRule.translatedIp}
                    onChange={(e) => setNewRule({ ...newRule, translatedIp: e.target.value })}
                    placeholder="e.g. 203.0.113.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="translatedPort">Translated Port</Label>
                  <Input
                    id="translatedPort"
                    value={newRule.translatedPort}
                    onChange={(e) => setNewRule({ ...newRule, translatedPort: e.target.value })}
                    placeholder="e.g. 80,443 or any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interface">Interface</Label>
                  <Select value={newRule.interface} onValueChange={(value) => setNewRule({ ...newRule, interface: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interfaces.map((iface) => (
                        <SelectItem key={iface} value={iface}>{iface}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={newRule.status === "enabled"}
                      onCheckedChange={(checked) => setNewRule({ ...newRule, status: checked ? "enabled" : "disabled" })}
                    />
                    <Label htmlFor="status">{newRule.status === "enabled" ? "Enabled" : "Disabled"}</Label>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Enter rule description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingRule ? handleUpdateRule : handleAddRule}>
                  {editingRule ? "Update Rule" : "Add Rule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* NAT Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            NAT Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={natStatsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="snat" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="SNAT"
              />
              <Area 
                type="monotone" 
                dataKey="dnat" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="DNAT"
              />
              <Area 
                type="monotone" 
                dataKey="pat" 
                stackId="1" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6}
                name="PAT"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search NAT rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SNAT">SNAT</SelectItem>
                <SelectItem value="DNAT">DNAT</SelectItem>
                <SelectItem value="PAT">PAT</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* NAT Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="w-5 h-5 mr-2" />
            NAT Rules ({filteredRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Original IP/Port</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Translated IP/Port</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Interface</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Hits</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{rule.name}</div>
                        <div className="text-sm text-gray-500">{rule.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm">
                        <div>{rule.originalIp}</div>
                        <div className="text-gray-500">{rule.originalPort}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="font-mono text-sm">
                          <div>{rule.translatedIp}</div>
                          <div className="text-gray-500">{rule.translatedPort}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getTypeBadge(rule.type)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{rule.interface}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.status === "enabled"}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                        />
                        <span className="text-sm">{rule.status === "enabled" ? "Enabled" : "Disabled"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{rule.hits.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
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
    </div>
  );
} 