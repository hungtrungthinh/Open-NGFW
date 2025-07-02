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
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Network,
  Globe,
  Users,
  Settings
} from "lucide-react";

interface FirewallRule {
  id: string;
  name: string;
  source: string;
  destination: string;
  service: string;
  action: "allow" | "deny";
  schedule: string;
  status: "enabled" | "disabled";
  description: string;
  priority: number;
  created: string;
  hits: number;
}

const mockRules: FirewallRule[] = [
  {
    id: "1",
    name: "Allow HTTP/HTTPS",
    source: "192.168.1.0/24",
    destination: "any",
    service: "HTTP,HTTPS",
    action: "allow",
    schedule: "Always",
    status: "enabled",
    description: "Allow web traffic from internal network",
    priority: 1,
    created: "2024-01-15",
    hits: 15420
  },
  {
    id: "2",
    name: "Block Malicious IPs",
    source: "any",
    destination: "10.0.0.0/8",
    service: "any",
    action: "deny",
    schedule: "Always",
    status: "enabled",
    description: "Block known malicious IP addresses",
    priority: 2,
    created: "2024-01-14",
    hits: 23
  },
  {
    id: "3",
    name: "Allow DNS",
    source: "192.168.1.0/24",
    destination: "8.8.8.8,1.1.1.1",
    service: "DNS",
    action: "allow",
    schedule: "Always",
    status: "enabled",
    description: "Allow DNS queries to public DNS servers",
    priority: 3,
    created: "2024-01-13",
    hits: 8900
  },
  {
    id: "4",
    name: "Block P2P",
    source: "any",
    destination: "any",
    service: "BitTorrent,eMule",
    action: "deny",
    schedule: "Always",
    status: "enabled",
    description: "Block peer-to-peer applications",
    priority: 4,
    created: "2024-01-12",
    hits: 156
  },
  {
    id: "5",
    name: "Allow VPN",
    source: "192.168.1.100",
    destination: "any",
    service: "OpenVPN,IPSec",
    action: "allow",
    schedule: "Business Hours",
    status: "enabled",
    description: "Allow VPN access for specific user",
    priority: 5,
    created: "2024-01-11",
    hits: 2340
  }
];

const services = [
  "HTTP", "HTTPS", "FTP", "SSH", "SMTP", "DNS", "DHCP", "NTP", "SNMP",
  "Telnet", "POP3", "IMAP", "RDP", "VNC", "BitTorrent", "eMule", "OpenVPN", "IPSec"
];

const schedules = [
  "Always", "Business Hours", "Weekends", "Night Hours", "Custom"
];

export default function FirewallRules() {
  const [rules, setRules] = useState<FirewallRule[]>(mockRules);
  const [filteredRules, setFilteredRules] = useState<FirewallRule[]>(mockRules);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FirewallRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<FirewallRule>>({
    name: "",
    source: "",
    destination: "",
    service: "",
    action: "allow",
    schedule: "Always",
    status: "enabled",
    description: "",
    priority: 1
  });

  useEffect(() => {
    let filtered = rules;

    if (searchTerm) {
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter(rule => rule.action === actionFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(rule => rule.status === statusFilter);
    }

    setFilteredRules(filtered);
  }, [rules, searchTerm, actionFilter, statusFilter]);

  const handleAddRule = () => {
    const rule: FirewallRule = {
      id: Date.now().toString(),
      name: newRule.name || "",
      source: newRule.source || "",
      destination: newRule.destination || "",
      service: newRule.service || "",
      action: newRule.action || "allow",
      schedule: newRule.schedule || "Always",
      status: newRule.status || "enabled",
      description: newRule.description || "",
      priority: newRule.priority || 1,
      created: new Date().toISOString().split('T')[0],
      hits: 0
    };

    setRules([rule, ...rules]);
    setNewRule({
      name: "",
      source: "",
      destination: "",
      service: "",
      action: "allow",
      schedule: "Always",
      status: "enabled",
      description: "",
      priority: 1
    });
    setIsAddDialogOpen(false);
  };

  const handleEditRule = (rule: FirewallRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setIsAddDialogOpen(true);
  };

  const handleUpdateRule = () => {
    if (!editingRule) return;

    const updatedRules = rules.map(rule =>
      rule.id === editingRule.id ? { ...newRule, id: rule.id, created: rule.created, hits: rule.hits } as FirewallRule : rule
    );

    setRules(updatedRules);
    setEditingRule(null);
    setNewRule({
      name: "",
      source: "",
      destination: "",
      service: "",
      action: "allow",
      schedule: "Always",
      status: "enabled",
      description: "",
      priority: 1
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

  const getActionIcon = (action: string) => {
    return action === "allow" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getActionBadge = (action: string) => {
    return action === "allow" ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Allow</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">Deny</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Firewall Rules</h1>
          <p className="text-gray-600">Manage access control policies and traffic filtering rules</p>
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
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? "Edit Firewall Rule" : "Add New Firewall Rule"}
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
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newRule.source}
                    onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                    placeholder="e.g. 192.168.1.0/24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={newRule.destination}
                    onChange={(e) => setNewRule({ ...newRule, destination: e.target.value })}
                    placeholder="e.g. 10.0.0.0/8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service/Port</Label>
                  <Select value={newRule.service} onValueChange={(value) => setNewRule({ ...newRule, service: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select value={newRule.action} onValueChange={(value: "allow" | "deny") => setNewRule({ ...newRule, action: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select value={newRule.schedule} onValueChange={(value) => setNewRule({ ...newRule, schedule: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule} value={schedule}>{schedule}</SelectItem>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="deny">Deny</SelectItem>
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

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Firewall Rules ({filteredRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
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
                    <td className="py-3 px-4 font-mono text-sm">{rule.source}</td>
                    <td className="py-3 px-4 font-mono text-sm">{rule.destination}</td>
                    <td className="py-3 px-4 text-sm">{rule.service}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(rule.action)}
                        {getActionBadge(rule.action)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{rule.schedule}</span>
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