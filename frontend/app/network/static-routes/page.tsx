"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Route, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Network,
  Activity,
  ArrowRight,
  Shield
} from "lucide-react";

interface StaticRoute {
  id: string;
  name: string;
  destination: string;
  netmask: string;
  gateway: string;
  interface: string;
  distance: number;
  priority: number;
  status: "active" | "inactive";
  description: string;
  blackhole: boolean;
  monitor: boolean;
  monitor_ip?: string;
  created_at: string;
  last_updated: string;
}

export default function StaticRoutesPage() {
  const [routes, setRoutes] = useState<StaticRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<StaticRoute | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<StaticRoute>>({});

  // Mock data for demonstration
  useEffect(() => {
    const mockRoutes: StaticRoute[] = [
      {
        id: "1",
        name: "Default Route",
        destination: "0.0.0.0",
        netmask: "0.0.0.0",
        gateway: "203.0.113.254",
        interface: "eth1",
        distance: 1,
        priority: 1,
        status: "active",
        description: "Default route to internet",
        blackhole: false,
        monitor: true,
        monitor_ip: "8.8.8.8",
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "2",
        name: "LAN Route",
        destination: "192.168.1.0",
        netmask: "255.255.255.0",
        gateway: "192.168.1.1",
        interface: "eth0",
        distance: 1,
        priority: 1,
        status: "active",
        description: "Local network route",
        blackhole: false,
        monitor: false,
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "3",
        name: "Guest Network",
        destination: "10.0.100.0",
        netmask: "255.255.255.0",
        gateway: "10.0.100.1",
        interface: "vlan100",
        distance: 1,
        priority: 2,
        status: "active",
        description: "Guest network route",
        blackhole: false,
        monitor: true,
        monitor_ip: "10.0.100.100",
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "4",
        name: "Blackhole Route",
        destination: "192.168.100.0",
        netmask: "255.255.255.0",
        gateway: "0.0.0.0",
        interface: "null",
        distance: 255,
        priority: 255,
        status: "active",
        description: "Blocked network route",
        blackhole: true,
        monitor: false,
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      }
    ];

    setTimeout(() => {
      setRoutes(mockRoutes);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (route: StaticRoute) => {
    setSelectedRoute(route);
    setFormData(route);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoute(null);
    setFormData({
      status: "active",
      distance: 1,
      priority: 1,
      blackhole: false,
      monitor: false
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
      const newRoute: StaticRoute = {
        id: Date.now().toString(),
        name: formData.name || "Route " + (routes.length + 1),
        destination: formData.destination || "",
        netmask: formData.netmask || "",
        gateway: formData.gateway || "",
        interface: formData.interface || "",
        distance: formData.distance || 1,
        priority: formData.priority || 1,
        status: formData.status || "active",
        description: formData.description || "",
        blackhole: formData.blackhole || false,
        monitor: formData.monitor || false,
        monitor_ip: formData.monitor_ip,
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
          <h1 className="text-3xl font-bold text-gray-900">Static Routes</h1>
          <p className="text-gray-600 mt-1">Configure static routing tables and network paths</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
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
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Blackhole</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.blackhole).length}
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
                <p className="text-sm font-medium text-gray-600">Monitored</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.monitor).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Static Routes</CardTitle>
          <CardDescription>
            Configure static routing entries and network paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Route Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Gateway</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Interface</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Distance</th>
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
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{route.destination}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-500">{route.netmask}</span>
                        {route.blackhole && (
                          <Badge variant="destructive" className="text-xs">
                            Blackhole
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{route.gateway}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Network className="w-4 h-4 text-gray-400" />
                        <Badge variant="outline">{route.interface}</Badge>
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
                        <span className="font-medium">{route.distance}</span>
                        <span className="text-gray-500">(Prio: {route.priority})</span>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRoute ? "Edit Static Route" : "Add New Static Route"}
            </DialogTitle>
            <DialogDescription>
              Configure static route parameters and network path
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Default Route"
                />
              </div>
              
              <div>
                <Label htmlFor="destination">Destination Network</Label>
                <Input
                  id="destination"
                  value={formData.destination || ""}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="192.168.1.0"
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
            </div>

            <div className="space-y-4">
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
                    <SelectItem value="null">null (Blackhole)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="distance">Administrative Distance</Label>
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
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority || 1}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  min="1"
                  max="255"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Route description"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Advanced Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="blackhole"
                  checked={formData.blackhole}
                  onCheckedChange={(checked) => setFormData({...formData, blackhole: checked})}
                />
                <Label htmlFor="blackhole">Blackhole Route</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="monitor"
                  checked={formData.monitor}
                  onCheckedChange={(checked) => setFormData({...formData, monitor: checked})}
                />
                <Label htmlFor="monitor">Enable Monitoring</Label>
              </div>
            </div>

            {formData.monitor && (
              <div>
                <Label htmlFor="monitor_ip">Monitor IP</Label>
                <Input
                  id="monitor_ip"
                  value={formData.monitor_ip || ""}
                  onChange={(e) => setFormData({...formData, monitor_ip: e.target.value})}
                  placeholder="8.8.8.8"
                />
              </div>
            )}
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
              {selectedRoute ? "Update" : "Create"} Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 