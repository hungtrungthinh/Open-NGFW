"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe2, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Database
} from "lucide-react";

interface DNSServer {
  id: string;
  name: string;
  ip_address: string;
  type: "primary" | "secondary" | "forwarder";
  status: "active" | "inactive";
  priority: number;
  description: string;
  last_updated: string;
}

interface DNSRecord {
  id: string;
  name: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "PTR";
  value: string;
  ttl: number;
  status: "active" | "inactive";
  description: string;
  created_at: string;
}

export default function DNSPage() {
  const [servers, setServers] = useState<DNSServer[]>([]);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockServers: DNSServer[] = [
      {
        id: "1",
        name: "Primary DNS",
        ip_address: "8.8.8.8",
        type: "primary",
        status: "active",
        priority: 1,
        description: "Google DNS Primary",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "2",
        name: "Secondary DNS",
        ip_address: "8.8.4.4",
        type: "secondary",
        status: "active",
        priority: 2,
        description: "Google DNS Secondary",
        last_updated: "2024-01-15 10:30:00"
      },
      {
        id: "3",
        name: "Local DNS",
        ip_address: "192.168.1.1",
        type: "forwarder",
        status: "active",
        priority: 3,
        description: "Local DNS Forwarder",
        last_updated: "2024-01-15 10:30:00"
      }
    ];

    const mockRecords: DNSRecord[] = [
      {
        id: "1",
        name: "www.example.com",
        type: "A",
        value: "192.168.1.100",
        ttl: 3600,
        status: "active",
        description: "Web server",
        created_at: "2024-01-01 00:00:00"
      },
      {
        id: "2",
        name: "mail.example.com",
        type: "A",
        value: "192.168.1.101",
        ttl: 3600,
        status: "active",
        description: "Mail server",
        created_at: "2024-01-01 00:00:00"
      }
    ];

    setTimeout(() => {
      setServers(mockServers);
      setRecords(mockRecords);
      setLoading(false);
    }, 1000);
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">DNS Configuration</h1>
          <p className="text-gray-600 mt-1">Manage DNS server settings and resolver configuration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add DNS Server
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">DNS Servers</p>
                <p className="text-2xl font-bold text-gray-900">{servers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">DNS Records</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Servers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {servers.filter(s => s.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DNS Servers */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Servers</CardTitle>
          <CardDescription>
            Configure DNS server settings and resolver configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Server Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server) => (
                  <tr key={server.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{server.name}</div>
                        <div className="text-sm text-gray-500">{server.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{server.ip_address}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {server.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {server.status === "active" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge 
                          variant={server.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {server.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{server.priority}</Badge>
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

      {/* DNS Records */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Records</CardTitle>
          <CardDescription>
            Manage local DNS records and hostname mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">TTL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{record.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{record.value}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span>{record.ttl}s</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {record.status === "active" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge 
                          variant={record.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {record.status}
                        </Badge>
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