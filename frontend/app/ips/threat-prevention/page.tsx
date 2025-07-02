"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShieldX, 
  Plus, 
  Edit, 
  Search, 
  AlertTriangle, 
  Eye,
  FileText,
  Bug,
  Shield,
  Zap,
  Globe,
  Lock,
  Activity
} from "lucide-react";

interface ThreatPreventionPolicy {
  id: string;
  name: string;
  description: string;
  threat_type: "malware" | "exploit" | "botnet" | "ddos" | "phishing" | "spam" | "web_attack";
  severity: "critical" | "high" | "medium" | "low";
  action: "block" | "alert" | "quarantine" | "log";
  status: "enabled" | "disabled";
  source_zones: string[];
  destination_zones: string[];
  affected_protocols: string[];
  threshold: number;
  time_window: number;
  created_at: string;
  last_modified: string;
  detection_count: number;
  false_positive_rate: number;
}

interface ThreatStats {
  total_threats: number;
  blocked_threats: number;
  quarantined_threats: number;
  alerted_threats: number;
  malware_detected: number;
  exploits_blocked: number;
  botnet_connections: number;
  ddos_attacks: number;
  phishing_attempts: number;
}

export default function ThreatPreventionPage() {
  const [policies, setPolicies] = useState<ThreatPreventionPolicy[]>([]);
  const [stats, setStats] = useState<ThreatStats>({
    total_threats: 0,
    blocked_threats: 0,
    quarantined_threats: 0,
    alerted_threats: 0,
    malware_detected: 0,
    exploits_blocked: 0,
    botnet_connections: 0,
    ddos_attacks: 0,
    phishing_attempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThreatType, setSelectedThreatType] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    const mockPolicies: ThreatPreventionPolicy[] = [
      {
        id: "1",
        name: "Malware Prevention Policy",
        description: "Blocks known malware and suspicious files",
        threat_type: "malware",
        severity: "critical",
        action: "block",
        status: "enabled",
        source_zones: ["wan", "dmz"],
        destination_zones: ["lan"],
        affected_protocols: ["HTTP", "HTTPS", "FTP", "SMTP"],
        threshold: 1,
        time_window: 300,
        created_at: "2024-01-01 00:00:00",
        last_modified: "2024-01-15 10:30:00",
        detection_count: 45,
        false_positive_rate: 0.05
      },
      {
        id: "2",
        name: "Exploit Prevention Policy",
        description: "Blocks exploitation attempts and vulnerability scans",
        threat_type: "exploit",
        severity: "high",
        action: "block",
        status: "enabled",
        source_zones: ["wan"],
        destination_zones: ["lan", "dmz"],
        affected_protocols: ["TCP", "UDP"],
        threshold: 5,
        time_window: 60,
        created_at: "2024-01-01 00:00:00",
        last_modified: "2024-01-15 10:30:00",
        detection_count: 23,
        false_positive_rate: 0.1
      },
      {
        id: "3",
        name: "Botnet Prevention Policy",
        description: "Blocks communication with known botnet C&C servers",
        threat_type: "botnet",
        severity: "high",
        action: "block",
        status: "enabled",
        source_zones: ["lan"],
        destination_zones: ["wan"],
        affected_protocols: ["HTTP", "HTTPS", "DNS"],
        threshold: 1,
        time_window: 3600,
        created_at: "2024-01-01 00:00:00",
        last_modified: "2024-01-15 10:30:00",
        detection_count: 8,
        false_positive_rate: 0.2
      },
      {
        id: "4",
        name: "DDoS Protection Policy",
        description: "Protects against distributed denial of service attacks",
        threat_type: "ddos",
        severity: "critical",
        action: "block",
        status: "enabled",
        source_zones: ["wan"],
        destination_zones: ["lan", "dmz"],
        affected_protocols: ["TCP", "UDP", "ICMP"],
        threshold: 1000,
        time_window: 60,
        created_at: "2024-01-01 00:00:00",
        last_modified: "2024-01-15 10:30:00",
        detection_count: 34,
        false_positive_rate: 0.1
      },
      {
        id: "5",
        name: "Phishing Prevention Policy",
        description: "Blocks access to known phishing websites",
        threat_type: "phishing",
        severity: "medium",
        action: "block",
        status: "enabled",
        source_zones: ["lan"],
        destination_zones: ["wan"],
        affected_protocols: ["HTTP", "HTTPS"],
        threshold: 1,
        time_window: 300,
        created_at: "2024-01-01 00:00:00",
        last_modified: "2024-01-15 10:30:00",
        detection_count: 67,
        false_positive_rate: 0.3
      },
      {
        id: "6",
        name: "Web Attack Prevention Policy",
        description: "Blocks web-based attacks like SQL injection and XSS",
        threat_type: "web_attack",
        severity: "high",
        action: "block",
        status: "enabled",
        source_zones: ["wan"],
        destination_zones: ["lan", "dmz"],
        affected_protocols: ["HTTP", "HTTPS"],
        threshold: 3,
        time_window: 300,
        created_at: "2024-01-01 00:00:00",
        last_modified: "2024-01-15 10:30:00",
        detection_count: 89,
        false_positive_rate: 0.15
      }
    ];

    setPolicies(mockPolicies);
    setStats({
      total_threats: 266,
      blocked_threats: 245,
      quarantined_threats: 12,
      alerted_threats: 9,
      malware_detected: 45,
      exploits_blocked: 23,
      botnet_connections: 8,
      ddos_attacks: 34,
      phishing_attempts: 67
    });
    setLoading(false);
  }, []);

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case "malware": return <Bug className="w-4 h-4" />;
      case "exploit": return <Bug className="w-4 h-4" />;
      case "botnet": return <Shield className="w-4 h-4" />;
      case "ddos": return <Zap className="w-4 h-4" />;
      case "phishing": return <Globe className="w-4 h-4" />;
      case "web_attack": return <Shield className="w-4 h-4" />;
      case "spam": return <FileText className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "block": return "bg-red-100 text-red-800";
      case "quarantine": return "bg-orange-100 text-orange-800";
      case "alert": return "bg-yellow-100 text-yellow-800";
      case "log": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesThreatType = selectedThreatType === "all" || policy.threat_type === selectedThreatType;
    
    return matchesSearch && matchesThreatType;
  });

  const handleTogglePolicy = (id: string) => {
    setPolicies(policies.map(policy => 
      policy.id === id 
        ? { ...policy, status: policy.status === "enabled" ? "disabled" : "enabled" }
        : policy
    ));
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
          <h1 className="text-3xl font-bold text-gray-900">Threat Prevention</h1>
          <p className="text-gray-600 mt-1">Configure threat prevention policies and rules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldX className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Threats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_threats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.blocked_threats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Malware Detected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.malware_detected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {policies.filter(p => p.status === "enabled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threat Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-orange-600" />
              <span>Exploits Blocked</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.exploits_blocked}</p>
            <p className="text-sm text-gray-600">Vulnerability exploitation attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Botnet Connections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.botnet_connections}</p>
            <p className="text-sm text-gray-600">C&C server communication attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>DDoS Attacks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.ddos_attacks}</p>
            <p className="text-sm text-gray-600">Distributed denial of service attacks</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedThreatType} onValueChange={setSelectedThreatType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Threat Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threat Types</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="exploit">Exploit</SelectItem>
                <SelectItem value="botnet">Botnet</SelectItem>
                <SelectItem value="ddos">DDoS</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="web_attack">Web Attack</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Prevention Policies</CardTitle>
          <CardDescription>
            Configure and manage threat prevention policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Policy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Threat Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Zones</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Detections</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{policy.name}</div>
                        <div className="text-sm text-gray-500">{policy.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Threshold: {policy.threshold} in {policy.time_window}s
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getThreatTypeIcon(policy.threat_type)}
                        <Badge variant="outline" className="capitalize">
                          {policy.threat_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getSeverityColor(policy.severity)}>
                        {policy.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getActionColor(policy.action)}>
                        {policy.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">Src: {policy.source_zones.join(', ')}</div>
                        <div className="text-gray-500">Dst: {policy.destination_zones.join(', ')}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={policy.status === "enabled"}
                          onCheckedChange={() => handleTogglePolicy(policy.id)}
                        />
                        <Badge 
                          variant={policy.status === "enabled" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {policy.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{policy.detection_count}</div>
                        <div className="text-xs text-gray-500">
                          FP: {(policy.false_positive_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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