"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShieldCheck, 
  Edit, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  FileText,
  Bug,
  Shield,
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
  signature_pattern: string;
  vendor: string;
  version: string;
  false_positive_rate: number;
  detection_count: number;
}

export default function IPSSignaturesPage() {
  const [signatures, setSignatures] = useState<IPSSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

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
        affected_protocols: ["HTTP", "HTTPS"],
        signature_pattern: "SELECT.*FROM.*WHERE.*OR.*1=1",
        vendor: "Fortinet",
        version: "7.4.0",
        false_positive_rate: 0.1,
        detection_count: 45
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
        affected_protocols: ["SMB", "HTTP", "FTP"],
        signature_pattern: "encrypt.*file.*extension",
        vendor: "Fortinet",
        version: "7.4.0",
        false_positive_rate: 0.05,
        detection_count: 12
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
        affected_protocols: ["HTTP", "HTTPS", "DNS"],
        signature_pattern: "botnet.*command.*control",
        vendor: "Fortinet",
        version: "7.4.0",
        false_positive_rate: 0.2,
        detection_count: 8
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
        affected_protocols: ["TCP", "UDP"],
        signature_pattern: "overflow.*buffer.*exploit",
        vendor: "Fortinet",
        version: "7.4.0",
        false_positive_rate: 0.15,
        detection_count: 23
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
        affected_protocols: ["HTTP", "HTTPS"],
        signature_pattern: "phishing.*website.*domain",
        vendor: "Fortinet",
        version: "7.4.0",
        false_positive_rate: 0.3,
        detection_count: 67
      },
      {
        id: "6",
        name: "DDoS Attack Detection",
        description: "Detects distributed denial of service attacks",
        severity: "high",
        category: "DDoS",
        action: "block",
        status: "enabled",
        last_updated: "2024-01-15 10:30:00",
        threat_type: "DDoS",
        affected_protocols: ["TCP", "UDP", "ICMP"],
        signature_pattern: "flood.*attack.*packets",
        vendor: "Fortinet",
        version: "7.4.0",
        false_positive_rate: 0.1,
        detection_count: 34
      }
    ];

    setSignatures(mockSignatures);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Web Attack": return <Globe className="w-4 h-4" />;
      case "Malware": return <Bug className="w-4 h-4" />;
      case "Botnet": return <Shield className="w-4 h-4" />;
      case "Exploit": return <Bug className="w-4 h-4" />;
      case "Phishing": return <Globe className="w-4 h-4" />;
      case "DDoS": return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredSignatures = signatures.filter(signature => {
    const matchesSearch = signature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || signature.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" || signature.severity === selectedSeverity;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleToggleSignature = (id: string) => {
    setSignatures(signatures.map(sig => 
      sig.id === id 
        ? { ...sig, status: sig.status === "enabled" ? "disabled" : "enabled" }
        : sig
    ));
  };

  const handleUpdateSignatures = () => {
    console.log("Updating signatures...");
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
          <h1 className="text-3xl font-bold text-gray-900">IPS Signatures</h1>
          <p className="text-gray-600 mt-1">Manage IPS signatures and detection rules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleUpdateSignatures}>
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
                <p className="text-sm font-medium text-gray-600">Total Signatures</p>
                <p className="text-2xl font-bold text-gray-900">{signatures.length}</p>
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
                  {signatures.filter(s => s.status === "enabled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {signatures.filter(s => s.severity === "critical").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Detections</p>
                <p className="text-2xl font-bold text-gray-900">
                  {signatures.reduce((sum, s) => sum + s.detection_count, 0)}
                </p>
              </div>
            </div>
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
                  placeholder="Search signatures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Web Attack">Web Attack</SelectItem>
                <SelectItem value="Malware">Malware</SelectItem>
                <SelectItem value="Botnet">Botnet</SelectItem>
                <SelectItem value="Exploit">Exploit</SelectItem>
                <SelectItem value="Phishing">Phishing</SelectItem>
                <SelectItem value="DDoS">DDoS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Table */}
      <Card>
        <CardHeader>
          <CardTitle>IPS Signatures</CardTitle>
          <CardDescription>
            Manage and configure IPS detection signatures
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Detections</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignatures.map((signature) => (
                  <tr key={signature.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{signature.name}</div>
                        <div className="text-sm text-gray-500">{signature.description}</div>
                        {signature.cve_id && (
                          <div className="text-xs text-blue-600">{signature.cve_id}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Pattern: {signature.signature_pattern.substring(0, 30)}...
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(signature.category)}
                        <Badge variant="outline" className="capitalize">
                          {signature.category}
                        </Badge>
                      </div>
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
                        <Switch
                          checked={signature.status === "enabled"}
                          onCheckedChange={() => handleToggleSignature(signature.id)}
                        />
                        <Badge 
                          variant={signature.status === "enabled" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {signature.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{signature.detection_count}</div>
                        <div className="text-xs text-gray-500">
                          FP: {(signature.false_positive_rate * 100).toFixed(1)}%
                        </div>
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
    </div>
  );
} 