"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash2, FileText, Download, ChevronRight, Filter, Eye, Loader2, Mail, Users, Globe, Share2, Key, Server, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import InteractiveCharts from "./InteractiveCharts";
import ReportBuilder from "./ReportBuilder";
import ComplianceMapping from "./ComplianceMapping";
import ScheduleManager from "./ScheduleManager";
import AccessControl from "./AccessControl";
import AnomalyTrend from "./AnomalyTrend";

const mockReports = [
  { id: "1", name: "Weekly Traffic", type: "Traffic", time: "2024-07-01 08:00", status: "Ready" },
  { id: "2", name: "Critical Alerts", type: "Alert", time: "2024-07-01 07:00", status: "Ready" },
  { id: "3", name: "User Bandwidth", type: "User", time: "2024-06-30 23:59", status: "Ready" },
];
const mockScheduled = [
  { id: "1", name: "PCI-DSS Compliance", type: "Compliance", schedule: "Monthly", recipients: "admin@corp.com", nextRun: "2024-08-01", status: true },
];
const mockAudit = [
  { id: "1", user: "admin", action: "Exported", time: "2024-07-01 08:01", report: "Weekly Traffic" },
  { id: "2", user: "secops", action: "Viewed", time: "2024-07-01 07:05", report: "Critical Alerts" },
];
const reportTypes = ["Traffic", "Security", "User", "Application", "VPN", "Alert", "System", "Compliance", "Custom"];

export default function ReportsPage() {
  const [filterType, setFilterType] = useState(reportTypes[0]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtered reports
  const filteredReports = mockReports.filter(r =>
    (!filterType || r.type === filterType) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <Link href="/" className="hover:underline text-gray-700">Home</Link>
        <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-900">Reports</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Reports & Alerts</h1>
      {/* Filter controls */}
      <div className="flex flex-wrap gap-4 items-end mb-2">
        <div>
          <Label>Date from</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <Label>Date to</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <Label>Type</Label>
          <UISelect value={filterType} onValueChange={setFilterType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {reportTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </UISelect>
        </div>
        <div>
          <Label>Search</Label>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Report name..." />
        </div>
        <Button variant="outline" className="ml-auto" onClick={() => setShowBuilder(true)}><Plus className="w-4 h-4 mr-1" />Custom Report</Button>
        <Button variant="outline" onClick={() => setShowSchedule(true)}><FileText className="w-4 h-4 mr-1" />Scheduled</Button>
        <Button variant="outline" onClick={() => setShowCompliance(true)}><UIBadge className="w-4 h-4 mr-1" />Compliance</Button>
      </div>
      {/* Reports Table */}
      <Card>
        <CardHeader><CardTitle>Reports & Alerts</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900 cursor-pointer" onClick={() => setShowDetail(r)}>{r.name}</td>
                    <td className="py-3 px-4">{r.type}</td>
                    <td className="py-3 px-4">{r.time}</td>
                    <td className="py-3 px-4">
                      <UIBadge variant={r.status === "Ready" ? "default" : "outline"}>{r.status}</UIBadge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowDetail(r)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => setLoading(true)} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Scheduled Reports Table */}
      <Card>
        <CardHeader><CardTitle>Scheduled Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Report Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Recipients</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Next Run</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockScheduled.map(s => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 px-4">{s.type}</td>
                    <td className="py-3 px-4">{s.schedule}</td>
                    <td className="py-3 px-4">{s.recipients}</td>
                    <td className="py-3 px-4">{s.nextRun}</td>
                    <td className="py-3 px-4">
                      <Switch checked={s.status} onCheckedChange={() => {}} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm"><Trash2 className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Audit Log Table */}
      <Card>
        <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Report</th>
                </tr>
              </thead>
              <tbody>
                {mockAudit.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{a.user}</td>
                    <td className="py-3 px-4">{a.action}</td>
                    <td className="py-3 px-4">{a.time}</td>
                    <td className="py-3 px-4">{a.report}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Custom Report Builder Modal */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Custom Report Builder</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Name</Label>
              <Input placeholder="Enter report name" />
            </div>
            <div>
              <Label>Fields</Label>
              <Input placeholder="e.g. Source IP, Destination IP, Bytes, ..." />
            </div>
            <div>
              <Label>Filters</Label>
              <Input placeholder="e.g. Protocol = TCP, Status = Blocked, ..." />
            </div>
            <div>
              <Label>Group By</Label>
              <Input placeholder="e.g. User, Application, ..." />
            </div>
            <div>
              <Label>Sort</Label>
              <Input placeholder="e.g. Bytes DESC" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch />
              <Label>Save as Template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button>Preview</Button>
            <Button>Export</Button>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Scheduled Report Modal (placeholder) */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Frequency</Label>
              <UISelect>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </UISelect>
            </div>
            <div>
              <Label>Recipients</Label>
              <Input placeholder="Enter email addresses, comma separated" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch />
              <Label>Enable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button>Save</Button>
            <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Compliance Report Modal (placeholder) */}
      <Dialog open={showCompliance} onOpenChange={setShowCompliance}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Compliance Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Compliance Type</Label>
              <UISelect>
                <SelectTrigger><SelectValue placeholder="Select compliance" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PCI-DSS">PCI-DSS</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="SOX">SOX</SelectItem>
                  <SelectItem value="NIST">NIST</SelectItem>
                </SelectContent>
              </UISelect>
            </div>
            <Button>View Mapping</Button>
            <Button>Export</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompliance(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Report Detail Modal (drill-down) */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Report Details</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {showDetail && (
              <>
                <div><b>Name:</b> {showDetail.name}</div>
                <div><b>Type:</b> {showDetail.type}</div>
                <div><b>Time:</b> {showDetail.time}</div>
                <div><b>Status:</b> {showDetail.status}</div>
                <div className="mt-2">[Report data preview here]</div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
          <TabsTrigger value="builder">Custom Builder</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly/Trend</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {/* ... giữ nguyên bảng Reports & Alerts ... */}
        </TabsContent>
        <TabsContent value="interactive">
          <InteractiveCharts />
        </TabsContent>
        <TabsContent value="builder">
          <ReportBuilder />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceMapping />
        </TabsContent>
        <TabsContent value="schedule">
          <ScheduleManager />
        </TabsContent>
        <TabsContent value="access">
          <AccessControl />
        </TabsContent>
        <TabsContent value="audit">
          {/* ... giữ nguyên bảng audit ... */}
        </TabsContent>
        <TabsContent value="anomaly">
          <AnomalyTrend />
        </TabsContent>
      </Tabs>
    </div>
  );
} 