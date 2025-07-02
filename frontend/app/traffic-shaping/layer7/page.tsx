"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Gauge, Edit, Plus, Trash2 } from "lucide-react";
import ReactSelect, { MultiValue } from 'react-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  category: string;
}
interface UserGroup {
  id: string;
  name: string;
}
interface L7Policy {
  id: string;
  name: string;
  applications: string[];
  userGroups: string[];
  protocol: string;
  bandwidth_limit: number;
  guaranteed_bandwidth: number;
  max_bandwidth: number;
  priority: "high" | "medium" | "low";
  schedule: string;
  enabled: boolean;
}

const mockUserGroups: UserGroup[] = [
  { id: "1", name: "Staff" },
  { id: "2", name: "Guest" },
  { id: "3", name: "IT" }
];
const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "FTP", "SMTP"];
const priorities = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];
const schedules = ["Always", "Work Hours", "Night", "Weekend"];

const groupedApplications = [
  {
    label: 'Advertising',
    options: [
      { value: 'Advertising.com', label: 'Advertising.com' },
      { value: 'AppNexus', label: 'AppNexus' },
      { value: 'Brightroll', label: 'Brightroll' },
      { value: 'Google advertising', label: 'Google advertising' },
      { value: 'LKQD', label: 'LKQD' },
      { value: 'OpenX', label: 'OpenX' },
      { value: 'Adcash', label: 'Adcash' },
      { value: 'Backpage.com', label: 'Backpage.com' },
      { value: 'DoubleVerify', label: 'DoubleVerify' },
      { value: 'Integral Ad Science', label: 'Integral Ad Science' },
      { value: 'moatads', label: 'moatads' },
      { value: 'mopub', label: 'mopub' },
      { value: 'Outbrain', label: 'Outbrain' },
      { value: 'Pubmatic', label: 'Pubmatic' },
      { value: 'SpringServe', label: 'SpringServe' }
    ]
  },
  {
    label: 'Blogging',
    options: [
      { value: 'Blogger', label: 'Blogger' },
      { value: 'WordPress', label: 'WordPress' },
      { value: 'Ameba', label: 'Ameba' },
      { value: 'Destructoid', label: 'Destructoid' },
      { value: 'FC2', label: 'FC2' },
      { value: 'Jimdo', label: 'Jimdo' },
      { value: 'Sina Weibo', label: 'Sina Weibo' },
      { value: 'Tianya', label: 'Tianya' },
      { value: 'TypePad', label: 'TypePad' }
    ]
  },
  {
    label: 'Business Management',
    options: [
      { value: 'Deltek Axium', label: 'Deltek Axium' },
      { value: 'IFS', label: 'IFS' },
      { value: 'Microsoft Dynamics 365', label: 'Microsoft Dynamics 365' },
      { value: 'NetSuite', label: 'NetSuite' },
      { value: 'Priority ERP', label: 'Priority ERP' },
      { value: 'salesforce.com', label: 'salesforce.com' },
      { value: 'SugarCRM', label: 'SugarCRM' },
      { value: 'Workday', label: 'Workday' },
      { value: 'Concur', label: 'Concur' },
      { value: 'Intacct', label: 'Intacct' },
      { value: 'IQMS', label: 'IQMS' },
      { value: 'SICOM Restaurant Management', label: 'SICOM Restaurant Management' }
    ]
  },
  // ... (repeat for all other categories from the markdown file)
];

export default function TrafficShapingL7Page() {
  const [policies, setPolicies] = useState<L7Policy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<L7Policy | null>(null);
  const [formData, setFormData] = useState<Partial<L7Policy>>({});

  useEffect(() => {
    setPolicies([
      {
        id: "1",
        name: "Limit YouTube for Guests",
        applications: ["1"],
        userGroups: ["2"],
        protocol: "HTTP",
        bandwidth_limit: 500,
        guaranteed_bandwidth: 100,
        max_bandwidth: 600,
        priority: "low",
        schedule: "Always",
        enabled: true
      },
      {
        id: "2",
        name: "Guarantee Zoom for Staff",
        applications: ["2"],
        userGroups: ["1"],
        protocol: "UDP",
        bandwidth_limit: 2000,
        guaranteed_bandwidth: 1500,
        max_bandwidth: 2500,
        priority: "high",
        schedule: "Work Hours",
        enabled: true
      }
    ]);
  }, []);

  const handleAdd = () => {
    setEditPolicy(null);
    setFormData({
      name: "",
      applications: [],
      userGroups: [],
      protocol: "TCP",
      bandwidth_limit: 1000,
      guaranteed_bandwidth: 500,
      max_bandwidth: 1200,
      priority: "medium",
      schedule: "Always",
      enabled: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (policy: L7Policy) => {
    setEditPolicy(policy);
    setFormData({ ...policy });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.applications?.length || !formData.userGroups?.length || !formData.protocol || !formData.bandwidth_limit || !formData.priority) return;
    if (editPolicy) {
      setPolicies(policies.map(p => p.id === editPolicy.id ? { ...editPolicy, ...formData, applications: formData.applications!, userGroups: formData.userGroups! } as L7Policy : p));
    } else {
      setPolicies([
        ...policies,
        {
          id: (Math.random() * 100000).toFixed(0),
          name: formData.name!,
          applications: formData.applications!,
          userGroups: formData.userGroups!,
          protocol: formData.protocol!,
          bandwidth_limit: Number(formData.bandwidth_limit),
          guaranteed_bandwidth: Number(formData.guaranteed_bandwidth),
          max_bandwidth: Number(formData.max_bandwidth),
          priority: formData.priority as "high" | "medium" | "low",
          schedule: formData.schedule!,
          enabled: formData.enabled ?? true
        }
      ]);
    }
    setIsDialogOpen(false);
  };

  const handleToggle = (id: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  // Multi-select helpers
  const handleMultiSelect = (field: "applications" | "userGroups", value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field]?.includes(value)
        ? formData[field]!.filter((v: string) => v !== value)
        : [...(formData[field] || []), value]
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <Link href="/" className="hover:underline text-gray-700">Home</Link>
        <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
        <Link href="/traffic-shaping" className="hover:underline text-gray-700">Traffic Shaping</Link>
        <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-900">Layer 7 Rules</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="w-7 h-7 text-blue-600" />
            Traffic Shaping (Layer 7)
          </h1>
          <p className="text-gray-600 mt-1">QoS by Application, User, Protocol, and more</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add L7 Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Layer 7 Traffic Shaping Policies</CardTitle>
          <CardDescription>Configure bandwidth, priority, and shaping for applications, users, and protocols.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Policy Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Application</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User/Group</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Protocol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Bandwidth Limit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Guaranteed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Max</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(policy => (
                  <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{policy.name}</td>
                    <td className="py-3 px-4">
                      {policy.applications.map(id => {
                        const app = groupedApplications.find(g => g.options.some(o => o.value === id));
                        return app ? <Badge key={id} className="mr-1" variant="outline">{app.label}</Badge> : null;
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {policy.userGroups.map(id => {
                        const group = mockUserGroups.find(g => g.id === id);
                        return group ? <Badge key={id} className="mr-1" variant="outline">{group.name}</Badge> : null;
                      })}
                    </td>
                    <td className="py-3 px-4">{policy.protocol}</td>
                    <td className="py-3 px-4">{policy.bandwidth_limit} Mbps</td>
                    <td className="py-3 px-4">{policy.guaranteed_bandwidth} Mbps</td>
                    <td className="py-3 px-4">{policy.max_bandwidth} Mbps</td>
                    <td className="py-3 px-4 capitalize">
                      <Badge variant="outline">{policy.priority}</Badge>
                    </td>
                    <td className="py-3 px-4">{policy.schedule}</td>
                    <td className="py-3 px-4">
                      <Switch checked={policy.enabled} onCheckedChange={() => handleToggle(policy.id)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(policy)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(policy.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editPolicy ? "Edit L7 Policy" : "Add L7 Policy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy-name">Policy Name</Label>
              <Input
                id="policy-name"
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter policy name"
              />
            </div>
            <div>
              <Label>Application</Label>
              <ReactSelect
                isMulti
                options={groupedApplications}
                value={groupedApplications.flatMap(g => g.options).filter(opt => formData.applications?.includes(opt.value))}
                onChange={(selected: MultiValue<{ value: string; label: string }>) => setFormData({
                  ...formData,
                  applications: selected ? selected.map((s) => s.value) : []
                })}
                placeholder="Select applications..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <Label>User/Group</Label>
              <div className="flex flex-wrap gap-2">
                {mockUserGroups.map(group => (
                  <Button
                    key={group.id}
                    type="button"
                    variant={formData.userGroups?.includes(group.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMultiSelect("userGroups", group.id)}
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={formData.protocol || "TCP"} onValueChange={v => setFormData({ ...formData, protocol: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bandwidth-limit">Bandwidth Limit (Mbps)</Label>
                <Input
                  id="bandwidth-limit"
                  type="number"
                  value={formData.bandwidth_limit || ""}
                  onChange={e => setFormData({ ...formData, bandwidth_limit: Number(e.target.value) })}
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <Label htmlFor="guaranteed-bandwidth">Guaranteed (Mbps)</Label>
                <Input
                  id="guaranteed-bandwidth"
                  type="number"
                  value={formData.guaranteed_bandwidth || ""}
                  onChange={e => setFormData({ ...formData, guaranteed_bandwidth: Number(e.target.value) })}
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <Label htmlFor="max-bandwidth">Max (Mbps)</Label>
                <Input
                  id="max-bandwidth"
                  type="number"
                  value={formData.max_bandwidth || ""}
                  onChange={e => setFormData({ ...formData, max_bandwidth: Number(e.target.value) })}
                  placeholder="e.g. 1200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority || "medium"} onValueChange={v => setFormData({ ...formData, priority: v as "high" | "medium" | "low" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Select value={formData.schedule || "Always"} onValueChange={v => setFormData({ ...formData, schedule: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={formData.enabled ?? true} onCheckedChange={v => setFormData({ ...formData, enabled: v })} />
              <Label>Status</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{editPolicy ? "Save Changes" : "Add L7 Policy"}</Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 