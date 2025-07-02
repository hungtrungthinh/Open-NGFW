"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Shield, AlertTriangle, CheckCircle, Activity, RefreshCw, Plus, Settings } from "lucide-react";

export default function BotnetProtectionPage() {
  const [botnetConnections, setBotnetConnections] = useState(8);
  const [botnetBlocked, setBotnetBlocked] = useState(8);
  const [protectionEnabled, setProtectionEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Botnet Protection</h1>
          <p className="text-gray-600 mt-1">Detect and block botnet communications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={protectionEnabled} onCheckedChange={setProtectionEnabled} />
          <span className="text-sm font-medium">Protection Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Botnet Connections</p>
                <p className="text-2xl font-bold text-gray-900">{botnetConnections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Connections Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{botnetBlocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Block Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((botnetBlocked / botnetConnections) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Botnet Protection Status</CardTitle>
          <CardDescription>Monitoring for botnet command & control communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">C&C Detection</p>
                  <p className="text-sm text-gray-500">Monitoring command & control servers</p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">DNS Monitoring</p>
                  <p className="text-sm text-gray-500">Blocking malicious DNS requests</p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 