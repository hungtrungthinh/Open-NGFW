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
  Shuffle, 
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
  Settings,
  Activity,
  ArrowRight,
  MapPin,
  Filter,
  Users,
  Clock,
  Target
} from "lucide-react";

interface PolicyRoute {
  id: string;
  name: string;
  priority: number;
  status: "active" | "inactive";
  description: string;
  
  // Match criteria
  source_address: string;
  source_interface: string;
  destination_address: string;
  service: string;
  user: string;
  schedule: string;
  
  // Action
  action: "route" | "block" | "shape";
  next_hop: string;
  interface: string;
  distance: number;
  
  // Advanced
  tos: number;
  dscp: number;
  bandwidth_limit?: number;
  priority_level?: number;
  
  created_at: string;
  last_updated: string;
}

export default function PolicyRoutesPage() {
  const [routes, setRoutes] = useState<PolicyRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<PolicyRoute | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PolicyRoute>>({});

  // Mock data for demonstration
  useEffect(() => {
    const mockRoutes: PolicyRoute[] = [
      {
        id: "1",
        name: "Guest Traffic Route",
        priority: 10,
        status: "active",
        description: "Route guest traffic through separate WAN",
        source_address: "10.0.100.0/24",
        source_interface: "vlan100",
        destination_address: "0.0.0.0/0",
        service: "ANY",
        user: "ANY",
        schedule: "Always",
        action: "route",
        next_hop: "203.0.113.2",
        interface: "eth1",
        distance: 1,
        tos: 0,
        dscp: 0,
        bandwidth_limit: 100000,
        priority_level: 3,
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "2",
        name: "VoIP Traffic Priority",
        priority: 5,
        status: "active",
        description: "Prioritize VoIP traffic",
        source_address: "192.168.1.100-192.168.1.200",
        source_interface: "eth0",
        destination_address: "0.0.0.0/0",
        service: "SIP,RTP",
        user: "ANY",
        schedule: "Always",
        action: "route",
        next_hop: "203.0.113.1",
        interface: "eth1",
        distance: 1,
        tos: 184,
        dscp: 46,
        bandwidth_limit: 500000,
        priority_level: 1,
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "3",
        name: "Block P2P Traffic",
        priority: 20,
        status: "active",
        description: "Block peer-to-peer applications",
        source_address: "0.0.0.0/0",
        source_interface: "ANY",
        destination_address: "0.0.0.0/0",
        service: "P2P",
        user: "ANY",
        schedule: "Always",
        action: "block",
        next_hop: "",
        interface: "",
        distance: 0,
        tos: 0,
        dscp: 0,
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "4",
        name: "Business Hours Route",
        priority: 15,
        status: "active",
        description: "Route business traffic during work hours",
        source_address: "192.168.1.0/24",
        source_interface: "eth0",
        destination_address: "0.0.0.0/0",
        service: "HTTP,HTTPS,FTP",
        user: "business_users",
        schedule: "Business Hours",
        action: "route",
        next_hop: "203.0.113.3",
        interface: "eth1",
        distance: 1,
        tos: 0,
        dscp: 0,
        bandwidth_limit: 2000000,
        priority_level: 2,
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      }
    ];

    setTimeout(() => {
      setRoutes(mockRoutes);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (route: PolicyRoute) => {
    setSelectedRoute(route);
    setFormData(route);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoute(null);
    setFormData({
      status: "active",
      priority: 100,
      action: "route",
      distance: 1,
      tos: 0,
      dscp: 0,
      service: "ANY",
      user: "ANY",
      schedule: "Always"
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedRoute) {
      // Update existing route
      setRoutes(prev => prev.map(route => 
        route.id === selectedRoute.id ? { ...route, ...formData } : route
      ));
    } else {
      // Add new route
      const newRoute: PolicyRoute = {
        id: Date.now().toString(),
        name: formData.name || "Policy Route " + (routes.length + 1),
        priority: formData.priority || 100,
        status: formData.status || "active",
        description: formData.description || "",
        source_address: formData.source_address || "",
        source_interface: formData.source_interface || "",
        destination_address: formData.destination_address || "",
        service: formData.service || "ANY",
        user: formData.user || "ANY",
        schedule: formData.schedule || "Always",
        action: formData.action || "route",
        next_hop: formData.next_hop || "",
        interface: formData.interface || "",
        distance: formData.distance || 1,
        tos: formData.tos || 0,
        dscp: formData.dscp || 0,
        bandwidth_limit: formData.bandwidth_limit,
        priority_level: formData.priority_level,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      setRoutes(prev => [...prev, newRoute]);
    }
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setRoutes(prev => prev.filter(route => route.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setRoutes(prev => prev.map(route => 
      route.id === id ? { ...route, status: route.status === "active" ? "inactive" : "active" } : route
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "route":
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case "block":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "shape":
        return <Activity className="w-4 h-4 text-orange-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Policy Routes</h1>
          <p className="text-gray-600 mt-1">Configure policy-based routing and traffic steering</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Policy Route
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shuffle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
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
                  {routes.filter(r => r.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Route Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.action === "route").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Block Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.action === "block").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Routes</CardTitle>
          <CardDescription>
            Configure policy-based routing rules and traffic steering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Policy Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Match Criteria</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{route.name}</div>
                        <div className="text-sm text-gray-500">{route.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{route.priority}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Src:</span> {route.source_address}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Dst:</span> {route.destination_address}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Service:</span> {route.service}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(route.action)}
                        <Badge 
                          variant={route.action === "route" ? "default" : route.action === "block" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {route.action}
                        </Badge>
                        {route.action === "route" && route.next_hop && (
                          <span className="text-sm text-gray-500">→ {route.next_hop}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(route.status)}
                        <Badge 
                          variant={route.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {route.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(route.id)}
                        >
                          {route.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(route)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(route.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRoute ? "Edit Policy Route" : "Add New Policy Route"}
            </DialogTitle>
            <DialogDescription>
              Configure policy-based routing rules and traffic steering parameters
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Basic Settings</h3>
              
              <div>
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Policy Route Name"
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority || 100}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  min="1"
                  max="65535"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Policy description"
                />
              </div>

              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({...formData, action: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route">Route</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="shape">Shape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Match Criteria */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Match Criteria</h3>
              
              <div>
                <Label htmlFor="source_address">Source Address</Label>
                <Input
                  id="source_address"
                  value={formData.source_address || ""}
                  onChange={(e) => setFormData({...formData, source_address: e.target.value})}
                  placeholder="192.168.1.0/24"
                />
              </div>

              <div>
                <Label htmlFor="source_interface">Source Interface</Label>
                <Select value={formData.source_interface} onValueChange={(value) => setFormData({...formData, source_interface: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interface" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">ANY</SelectItem>
                    <SelectItem value="eth0">eth0 (LAN)</SelectItem>
                    <SelectItem value="eth1">eth1 (WAN)</SelectItem>
                    <SelectItem value="vlan100">vlan100 (Guest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="destination_address">Destination Address</Label>
                <Input
                  id="destination_address"
                  value={formData.destination_address || ""}
                  onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
                  placeholder="0.0.0.0/0"
                />
              </div>

              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">ANY</SelectItem>
                    <SelectItem value="HTTP,HTTPS">HTTP/HTTPS</SelectItem>
                    <SelectItem value="FTP">FTP</SelectItem>
                    <SelectItem value="SIP,RTP">SIP/RTP</SelectItem>
                    <SelectItem value="P2P">P2P</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Settings */}
          {formData.action === "route" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">Route Action Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="next_hop">Next Hop</Label>
                  <Input
                    id="next_hop"
                    value={formData.next_hop || ""}
                    onChange={(e) => setFormData({...formData, next_hop: e.target.value})}
                    placeholder="192.168.1.254"
                  />
                </div>
                <div>
                  <Label htmlFor="interface">Interface</Label>
                  <Select value={formData.interface} onValueChange={(value) => setFormData({...formData, interface: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interface" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eth0">eth0 (LAN)</SelectItem>
                      <SelectItem value="eth1">eth1 (WAN)</SelectItem>
                      <SelectItem value="vlan100">vlan100 (Guest)</SelectItem>
                      <SelectItem value="pppoe0">pppoe0 (PPPoE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Distance</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={formData.distance || 1}
                    onChange={(e) => setFormData({...formData, distance: parseInt(e.target.value)})}
                    min="1"
                    max="255"
                  />
                </div>
                <div>
                  <Label htmlFor="bandwidth_limit">Bandwidth Limit (bps)</Label>
                  <Input
                    id="bandwidth_limit"
                    type="number"
                    value={formData.bandwidth_limit || ""}
                    onChange={(e) => setFormData({...formData, bandwidth_limit: parseInt(e.target.value)})}
                    placeholder="1000000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-900">Advanced Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user">User/Group</Label>
                <Select value={formData.user} onValueChange={(value) => setFormData({...formData, user: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">ANY</SelectItem>
                    <SelectItem value="business_users">Business Users</SelectItem>
                    <SelectItem value="guest_users">Guest Users</SelectItem>
                    <SelectItem value="admin_users">Admin Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Select value={formData.schedule} onValueChange={(value) => setFormData({...formData, schedule: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Always">Always</SelectItem>
                    <SelectItem value="Business Hours">Business Hours</SelectItem>
                    <SelectItem value="After Hours">After Hours</SelectItem>
                    <SelectItem value="Weekends">Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tos">ToS (Type of Service)</Label>
                <Input
                  id="tos"
                  type="number"
                  value={formData.tos || 0}
                  onChange={(e) => setFormData({...formData, tos: parseInt(e.target.value)})}
                  min="0"
                  max="255"
                />
              </div>
              
              <div>
                <Label htmlFor="dscp">DSCP</Label>
                <Input
                  id="dscp"
                  type="number"
                  value={formData.dscp || 0}
                  onChange={(e) => setFormData({...formData, dscp: parseInt(e.target.value)})}
                  min="0"
                  max="63"
                />
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
              {selectedRoute ? "Update" : "Create"} Policy Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 