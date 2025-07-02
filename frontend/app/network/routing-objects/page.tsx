"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Box, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MapPin,
  Users,
  Building,
  Server,
  Database,
  Folder,
  Clock
} from "lucide-react";

interface RoutingObject {
  id: string;
  name: string;
  type: "address" | "address_group" | "service" | "service_group" | "schedule" | "user" | "user_group";
  description: string;
  status: "active" | "inactive";
  
  // Address objects
  addresses?: string[];
  subnet?: string;
  fqdn?: string;
  wildcard?: string;
  
  // Service objects
  protocol?: string;
  port_range?: string;
  icmp_type?: string;
  
  // Schedule objects
  schedule_type?: "daily" | "weekly" | "monthly" | "once";
  start_time?: string;
  end_time?: string;
  days?: string[];
  
  // User objects
  username?: string;
  email?: string;
  group?: string;
  
  // Common
  tags?: string[];
  created_at: string;
  last_updated: string;
}

export default function RoutingObjectsPage() {
  const [objects, setObjects] = useState<RoutingObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObject, setSelectedObject] = useState<RoutingObject | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<RoutingObject>>({});
  const [filterType, setFilterType] = useState<string>("all");

  // Mock data for demonstration
  useEffect(() => {
    const mockObjects: RoutingObject[] = [
      {
        id: "1",
        name: "LAN_Network",
        type: "address",
        description: "Local area network addresses",
        status: "active",
        addresses: ["192.168.1.0/24"],
        tags: ["lan", "internal"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "2",
        name: "WAN_Network",
        type: "address",
        description: "Wide area network addresses",
        status: "active",
        addresses: ["203.0.113.0/24"],
        tags: ["wan", "external"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "3",
        name: "Internal_Servers",
        type: "address_group",
        description: "Group of internal server addresses",
        status: "active",
        addresses: ["192.168.1.10", "192.168.1.11", "192.168.1.12"],
        tags: ["servers", "internal"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "4",
        name: "Web_Services",
        type: "service",
        description: "HTTP and HTTPS services",
        status: "active",
        protocol: "TCP",
        port_range: "80,443",
        tags: ["web", "http"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "5",
        name: "Business_Hours",
        type: "schedule",
        description: "Business hours schedule",
        status: "active",
        schedule_type: "weekly",
        start_time: "09:00",
        end_time: "17:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        tags: ["schedule", "business"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "6",
        name: "Admin_Users",
        type: "user_group",
        description: "Administrative user group",
        status: "active",
        group: "administrators",
        tags: ["users", "admin"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "7",
        name: "Guest_Network",
        type: "address",
        description: "Guest network addresses",
        status: "active",
        addresses: ["10.0.100.0/24"],
        tags: ["guest", "internal"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "8",
        name: "Database_Services",
        type: "service_group",
        description: "Database related services",
        status: "active",
        protocol: "TCP",
        port_range: "3306,5432,1433",
        tags: ["database", "sql"],
        created_at: "2024-01-01 00:00:00",
        last_updated: "2024-01-15 10:30:00"
      }
    ];

    setTimeout(() => {
      setObjects(mockObjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (object: RoutingObject) => {
    setSelectedObject(object);
    setFormData(object);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedObject(null);
    setFormData({
      status: "active",
      type: "address"
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedObject) {
      // Update existing object
      setObjects(prev => prev.map(obj => 
        obj.id === selectedObject.id ? { ...obj, ...formData } : obj
      ));
    } else {
      // Add new object
      const newObject: RoutingObject = {
        id: Date.now().toString(),
        name: formData.name || "Object " + (objects.length + 1),
        type: formData.type || "address",
        description: formData.description || "",
        status: formData.status || "active",
        addresses: formData.addresses,
        subnet: formData.subnet,
        fqdn: formData.fqdn,
        wildcard: formData.wildcard,
        protocol: formData.protocol,
        port_range: formData.port_range,
        icmp_type: formData.icmp_type,
        schedule_type: formData.schedule_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        days: formData.days,
        username: formData.username,
        email: formData.email,
        group: formData.group,
        tags: formData.tags || [],
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      setObjects(prev => [...prev, newObject]);
    }
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, status: obj.status === "active" ? "inactive" : "active" } : obj
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "address":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "address_group":
        return <Folder className="w-4 h-4 text-green-500" />;
      case "service":
        return <Server className="w-4 h-4 text-orange-500" />;
      case "service_group":
        return <Database className="w-4 h-4 text-purple-500" />;
      case "schedule":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "user":
        return <Users className="w-4 h-4 text-indigo-500" />;
      case "user_group":
        return <Building className="w-4 h-4 text-pink-500" />;
      default:
        return <Box className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredObjects = filterType === "all" 
    ? objects 
    : objects.filter(obj => obj.type === filterType);

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
          <h1 className="text-3xl font-bold text-gray-900">Routing Objects</h1>
          <p className="text-gray-600 mt-1">Manage address groups, services, schedules, and user objects</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Object
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Objects</p>
                <p className="text-2xl font-bold text-gray-900">{objects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Addresses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objects.filter(o => o.type === "address" || o.type === "address_group").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objects.filter(o => o.type === "service" || o.type === "service_group").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Schedules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objects.filter(o => o.type === "schedule").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objects.filter(o => o.type === "user" || o.type === "user_group").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="filter-type">Filter by Type:</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="address">Addresses</SelectItem>
                <SelectItem value="address_group">Address Groups</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="service_group">Service Groups</SelectItem>
                <SelectItem value="schedule">Schedules</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="user_group">User Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Objects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Objects</CardTitle>
          <CardDescription>
            Manage address groups, services, schedules, and user objects for routing policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Object Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tags</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredObjects.map((object) => (
                  <tr key={object.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{object.name}</div>
                        <div className="text-sm text-gray-500">{object.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(object.type)}
                        <Badge variant="outline" className="capitalize">
                          {object.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-1">
                        {object.addresses && (
                          <div>
                            <span className="font-medium">Addresses:</span> {object.addresses.join(", ")}
                          </div>
                        )}
                        {object.subnet && (
                          <div>
                            <span className="font-medium">Subnet:</span> {object.subnet}
                          </div>
                        )}
                        {object.fqdn && (
                          <div>
                            <span className="font-medium">FQDN:</span> {object.fqdn}
                          </div>
                        )}
                        {object.protocol && (
                          <div>
                            <span className="font-medium">Protocol:</span> {object.protocol}
                          </div>
                        )}
                        {object.port_range && (
                          <div>
                            <span className="font-medium">Ports:</span> {object.port_range}
                          </div>
                        )}
                        {object.schedule_type && (
                          <div>
                            <span className="font-medium">Schedule:</span> {object.start_time} - {object.end_time}
                          </div>
                        )}
                        {object.username && (
                          <div>
                            <span className="font-medium">User:</span> {object.username}
                          </div>
                        )}
                        {object.group && (
                          <div>
                            <span className="font-medium">Group:</span> {object.group}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {object.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(object.status)}
                        <Badge 
                          variant={object.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {object.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(object.id)}
                        >
                          {object.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(object)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(object.id)}
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
              {selectedObject ? "Edit Routing Object" : "Add New Routing Object"}
            </DialogTitle>
            <DialogDescription>
              Configure routing object parameters and properties
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Object Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Object Name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Object Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="address">Address</SelectItem>
                    <SelectItem value="address_group">Address Group</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="service_group">Service Group</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="user_group">User Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Object description"
              />
            </div>

            {/* Address-specific fields */}
            {(formData.type === "address" || formData.type === "address_group") && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Address Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subnet">Subnet/CIDR</Label>
                    <Input
                      id="subnet"
                      value={formData.subnet || ""}
                      onChange={(e) => setFormData({...formData, subnet: e.target.value})}
                      placeholder="192.168.1.0/24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fqdn">FQDN</Label>
                    <Input
                      id="fqdn"
                      value={formData.fqdn || ""}
                      onChange={(e) => setFormData({...formData, fqdn: e.target.value})}
                      placeholder="example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Service-specific fields */}
            {(formData.type === "service" || formData.type === "service_group") && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Service Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="protocol">Protocol</Label>
                    <Select value={formData.protocol} onValueChange={(value) => setFormData({...formData, protocol: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TCP">TCP</SelectItem>
                        <SelectItem value="UDP">UDP</SelectItem>
                        <SelectItem value="ICMP">ICMP</SelectItem>
                        <SelectItem value="ANY">ANY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="port_range">Port Range</Label>
                    <Input
                      id="port_range"
                      value={formData.port_range || ""}
                      onChange={(e) => setFormData({...formData, port_range: e.target.value})}
                      placeholder="80,443,8080-8090"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule-specific fields */}
            {formData.type === "schedule" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Schedule Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_type">Schedule Type</Label>
                    <Select value={formData.schedule_type} onValueChange={(value) => setFormData({...formData, schedule_type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="once">Once</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time || ""}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time || ""}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* User-specific fields */}
            {(formData.type === "user" || formData.type === "user_group") && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">User Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username || ""}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="group">Group</Label>
                    <Input
                      id="group"
                      value={formData.group || ""}
                      onChange={(e) => setFormData({...formData, group: e.target.value})}
                      placeholder="group_name"
                    />
                  </div>
                </div>
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
              {selectedObject ? "Update" : "Create"} Object
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 