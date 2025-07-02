"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, Save, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function IPSSettingsPage() {
  const [ipsEnabled, setIpsEnabled] = useState(true);
  const [signatureAutoUpdate, setSignatureAutoUpdate] = useState(true);
  const [deepInspection, setDeepInspection] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [actionMode, setActionMode] = useState("block");
  const [scanMode, setScanMode] = useState("real-time");
  const [maxSessions, setMaxSessions] = useState("10000");
  const [updateInterval, setUpdateInterval] = useState("24");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IPS Settings</h1>
          <p className="text-gray-600 mt-1">Configure IPS engine settings and behavior</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>Basic IPS configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ips-enabled">Enable IPS Engine</Label>
                <p className="text-sm text-gray-500">Enable or disable the IPS engine</p>
              </div>
              <Switch
                id="ips-enabled"
                checked={ipsEnabled}
                onCheckedChange={setIpsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="signature-update">Auto Update Signatures</Label>
                <p className="text-sm text-gray-500">Automatically update signature database</p>
              </div>
              <Switch
                id="signature-update"
                checked={signatureAutoUpdate}
                onCheckedChange={setSignatureAutoUpdate}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="deep-inspection">Deep Packet Inspection</Label>
                <p className="text-sm text-gray-500">Enable deep packet inspection</p>
              </div>
              <Switch
                id="deep-inspection"
                checked={deepInspection}
                onCheckedChange={setDeepInspection}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anomaly-detection">Anomaly Detection</Label>
                <p className="text-sm text-gray-500">Enable behavioral anomaly detection</p>
              </div>
              <Switch
                id="anomaly-detection"
                checked={anomalyDetection}
                onCheckedChange={setAnomalyDetection}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Action Settings</span>
            </CardTitle>
            <CardDescription>Configure IPS response actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="action-mode">Default Action Mode</Label>
              <Select value={actionMode} onValueChange={setActionMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="alert">Alert Only</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                  <SelectItem value="log">Log Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">Default action for detected threats</p>
            </div>

            <div>
              <Label htmlFor="scan-mode">Scan Mode</Label>
              <Select value={scanMode} onValueChange={setScanMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-time">Real-time</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="on-demand">On-demand</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">How IPS scans traffic</p>
            </div>

            <div>
              <Label htmlFor="max-sessions">Max Concurrent Sessions</Label>
              <Input
                id="max-sessions"
                type="number"
                value={maxSessions}
                onChange={(e) => setMaxSessions(e.target.value)}
                placeholder="10000"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum concurrent IPS sessions</p>
            </div>

            <div>
              <Label htmlFor="update-interval">Signature Update Interval (hours)</Label>
              <Input
                id="update-interval"
                type="number"
                value={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.value)}
                placeholder="24"
              />
              <p className="text-sm text-gray-500 mt-1">How often to check for signature updates</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Settings</CardTitle>
            <CardDescription>Configure IPS performance parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">CPU Usage</p>
                  <p className="text-sm text-gray-500">Current: 15%</p>
                </div>
              </div>
              <Badge variant="default">Optimal</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Memory Usage</p>
                  <p className="text-sm text-gray-500">Current: 256MB</p>
                </div>
              </div>
              <Badge variant="default">Normal</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Throughput</p>
                  <p className="text-sm text-gray-500">Current: 1.2 Gbps</p>
                </div>
              </div>
              <Badge variant="default">Good</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
            <CardDescription>Current IPS system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">IPS Engine</p>
                  <p className="text-sm text-gray-500">Running</p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Signature Database</p>
                  <p className="text-sm text-gray-500">Updated 2 hours ago</p>
                </div>
              </div>
              <Badge variant="default">Current</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">License Status</p>
                  <p className="text-sm text-gray-500">Valid until 2024-12-31</p>
                </div>
              </div>
              <Badge variant="default">Valid</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Last Threat</p>
                  <p className="text-sm text-gray-500">SQL Injection - 10 minutes ago</p>
                </div>
              </div>
              <Badge variant="secondary">Blocked</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 