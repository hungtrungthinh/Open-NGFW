"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ShieldCheck, 
  ShieldX, 
  Bug, 
  Shield, 
  FileText, 
  Settings, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  TrendingUp, 
  Eye,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Zap,
  Globe
} from "lucide-react";

interface IPSSignature {
  id: string;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  action: "block" | "alert" | "allow";
  status: "enabled" | "disabled";
  last_updated: string;
  threat_type: string;
  cve_id?: string;
  affected_protocols: string[];
}

interface IPSThreat {
  id: string;
  name: string;
  type: "malware" | "exploit" | "botnet" | "ddos" | "phishing";
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "blocked" | "monitoring";
  source_ip: string;
  destination_ip: string;
  timestamp: string;
  description: string;
  action_taken: string;
}

interface IPSStats {
  total_signatures: number;
  active_signatures: number;
  threats_blocked: number;
  threats_detected: number;
  vulnerabilities_protected: number;
  malware_blocked: number;
  botnet_connections: number;
  last_update: string;
}

export default function IPSPage() {
  const [signatures, setSignatures] = useState<IPSSignature[]>([]);
  const [threats, setThreats] = useState<IPSThreat[]>([]);
  const [stats, setStats] = useState<IPSStats>({
    total_signatures: 0,
    active_signatures: 0,
    threats_blocked: 0,
    threats_detected: 0,
    vulnerabilities_protected: 0,
    malware_blocked: 0,
    botnet_connections: 0,
    last_update: ""
  });
  const [ipsEnabled, setIpsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockSignatures: IPSSignature[] = [
      {
        id: "1",
        name: "SQL Injection Attack",
        description: "Detects SQL injection attempts in web traffic",
        severity: "critical",
        category: "Web Attack",
        action: "block",
        status: "enabled",
        last_updated: "2024-01-15 10:30:00",
        threat_type: "SQL Injection",
        cve_id: "CVE-2023-1234",
        affected_protocols: ["HTTP", "HTTPS"]
      },
      {
        id: "2",
        name: "Ransomware Activity",
        description: "Detects ransomware encryption activities",
        severity: "critical",
        category: "Malware",
        action: "block",
        status: "enabled",
        last_updated: "2024-01-15 10:30:00",
        threat_type: "Ransomware",
        affected_protocols: ["SMB", "HTTP", "FTP"]
      },
      {
        id: "3",
        name: "Botnet Communication",
        description: "Detects communication with known botnet C&C servers",
        severity: "high",
        category: "Botnet",
        action: "block",
        status: "enabled",
        last_updated: "2024-01-15 10:30:00",
        threat_type: "Botnet",
        affected_protocols: ["HTTP", "HTTPS", "DNS"]
      },
      {
        id: "4",
        name: "Buffer Overflow Attempt",
        description: "Detects buffer overflow exploitation attempts",
        severity: "high",
        category: "Exploit",
        action: "block",
        status: "enabled",
        last_updated: "2024-01-15 10:30:00",
        threat_type: "Buffer Overflow",
        cve_id: "CVE-2023-5678",
        affected_protocols: ["TCP", "UDP"]
      },
      {
        id: "5",
        name: "Phishing Website Access",
        description: "Blocks access to known phishing websites",
        severity: "medium",
        category: "Phishing",
        action: "block",
        status: "enabled",
        last_updated: "2024-01-15 10:30:00",
        threat_type: "Phishing",
        affected_protocols: ["HTTP", "HTTPS"]
      }
    ];

    const mockThreats: IPSThreat[] = [
      {
        id: "1",
        name: "SQL Injection Attempt",
        type: "exploit",
        severity: "critical",
        status: "blocked",
        source_ip: "192.168.1.100",
        destination_ip: "10.0.0.50",
        timestamp: "2024-01-15 10:30:00",
        description: "SQL injection attempt detected in web traffic",
        action_taken: "Blocked connection"
      },
      {
        id: "2",
        name: "Ransomware Activity",
        type: "malware",
        severity: "critical",
        status: "blocked",
        source_ip: "192.168.1.101",
        destination_ip: "10.0.0.51",
        timestamp: "2024-01-15 10:25:00",
        description: "Ransomware encryption activity detected",
        action_taken: "Blocked file access"
      },
      {
        id: "3",
        name: "Botnet Communication",
        type: "botnet",
        severity: "high",
        status: "blocked",
        source_ip: "192.168.1.102",
        destination_ip: "203.0.113.10",
        timestamp: "2024-01-15 10:20:00",
        description: "Communication with known botnet C&C server",
        action_taken: "Blocked connection"
      }
    ];

    setSignatures(mockSignatures);
    setThreats(mockThreats);
    setStats({
      total_signatures: mockSignatures.length,
      active_signatures: mockSignatures.filter(s => s.status === "enabled").length,
      threats_blocked: mockThreats.filter(t => t.status === "blocked").length,
      threats_detected: mockThreats.length,
      vulnerabilities_protected: 15,
      malware_blocked: 8,
      botnet_connections: 3,
      last_update: "2024-01-15 10:30:00"
    });
    setLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case "malware": return <Bug className="w-4 h-4" />;
      case "exploit": return <Bug className="w-4 h-4" />;
      case "botnet": return <Shield className="w-4 h-4" />;
      case "ddos": return <Zap className="w-4 h-4" />;
      case "phishing": return <Globe className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleUpdateSignatures = () => {
    // Mock signature update
    console.log("Updating signatures...");
  };

  const handleToggleIPS = () => {
    setIpsEnabled(!ipsEnabled);
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
          <h1 className="text-3xl font-bold text-gray-900">Intrusion Prevention System (IPS)</h1>
          <p className="text-gray-600 mt-1">Protect against threats, vulnerabilities, and attacks</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">IPS Engine</span>
            <Switch checked={ipsEnabled} onCheckedChange={handleToggleIPS} />
          </div>
          <Button variant="outline" size="sm" onClick={handleUpdateSignatures}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Signatures
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Signatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_signatures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldX className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.threats_blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vulnerabilities Protected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vulnerabilities_protected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Malware Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.malware_blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Threats */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Threats</CardTitle>
          <CardDescription>
            Latest threats detected and blocked by IPS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Threat</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((threat) => (
                  <tr key={threat.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{threat.name}</div>
                        <div className="text-sm text-gray-500">{threat.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getThreatTypeIcon(threat.type)}
                        <Badge variant="outline" className="capitalize">
                          {threat.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{threat.source_ip}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{threat.destination_ip}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={threat.status === "blocked" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {threat.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500">{threat.timestamp}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IPS Signatures */}
      <Card>
        <CardHeader>
          <CardTitle>IPS Signatures</CardTitle>
          <CardDescription>
            Manage IPS signatures and detection rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Signature</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signatures.map((signature) => (
                  <tr key={signature.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{signature.name}</div>
                        <div className="text-sm text-gray-500">{signature.description}</div>
                        {signature.cve_id && (
                          <div className="text-xs text-blue-600">{signature.cve_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {signature.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getSeverityColor(signature.severity)}>
                        {signature.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={signature.action === "block" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {signature.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {signature.status === "enabled" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge 
                          variant={signature.status === "enabled" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {signature.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500">{signature.last_updated}</div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Threat Prevention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure threat prevention policies and rules
            </p>
            <Button className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="w-5 h-5" />
              <span>Vulnerability Protection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage vulnerability scanning and protection
            </p>
            <Button className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>IPS Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View detailed IPS detection logs and alerts
            </p>
            <Button className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 