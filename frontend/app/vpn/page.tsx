"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash2, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const mockVPNs = [
  { id: "1", name: "SiteA", type: "IPSec", remote: "203.0.113.1", status: true, psk: "" },
  { id: "2", name: "RemoteWorker", type: "SSL", remote: "vpn.example.com", status: false, psk: "" }
];

export default function VPNPage() {
  const [vpns, setVPNs] = useState<VPN[]>(mockVPNs);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editVPN, setEditVPN] = useState<VPN | null>(null);
  const [vpnForm, setVPNForm] = useState({ name: "", type: "IPSec", remote: "", psk: "", status: true });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState("");

  const handleAdd = () => {
    setEditVPN(null);
    setVPNForm({ name: "", type: "IPSec", remote: "", psk: "", status: true });
    setIsDialogOpen(true);
  };
  const handleEdit = (vpn: VPN) => {
    setEditVPN(vpn);
    setVPNForm({ name: vpn.name, type: vpn.type, remote: vpn.remote, psk: vpn.psk, status: vpn.status });
    setIsDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setLoading(true);
    setTimeout(() => {
      setVPNs(vpns.filter(v => v.id !== id));
      setLoading(false);
      setDeleteId(null);
      setShowToast("Deleted successfully");
      setTimeout(() => setShowToast(""), 2000);
    }, 800);
  };
  const handleSave = () => {
    if (!vpnForm.name || !vpnForm.remote || !vpnForm.psk) return;
    setLoading(true);
    setTimeout(() => {
      if (editVPN) {
        setVPNs(vpns.map(v => v.id === editVPN.id ? { ...editVPN, ...vpnForm } : v));
      } else {
        setVPNs([...vpns, { ...vpnForm, id: (Math.random() * 100000).toFixed(0) }]);
      }
      setIsDialogOpen(false);
      setLoading(false);
      setShowToast(editVPN ? "Updated successfully" : "Added successfully");
      setTimeout(() => setShowToast(""), 2000);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <Link href="/" className="hover:underline text-gray-700">Home</Link>
        <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-900">VPN</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">VPN Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>VPN Tunnels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add VPN
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tunnel Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Remote Gateway</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vpns.map(vpn => (
                  <tr key={vpn.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{vpn.name}</td>
                    <td className="py-3 px-4">{vpn.type}</td>
                    <td className="py-3 px-4">{vpn.remote}</td>
                    <td className="py-3 px-4">
                      {vpn.status ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                          <ShieldCheck className="w-4 h-4 mr-1" /> Up
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                          <ShieldX className="w-4 h-4 mr-1" /> Down
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(vpn)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(vpn.id)} disabled={loading && deleteId === vpn.id}>
                          {loading && deleteId === vpn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
            <DialogTitle>{editVPN ? "Edit VPN" : "Add VPN"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vpn-name">Tunnel Name</Label>
              <Input id="vpn-name" value={vpnForm.name} onChange={e => setVPNForm({ ...vpnForm, name: e.target.value })} placeholder="Enter tunnel name" />
            </div>
            <div>
              <Label htmlFor="vpn-type">Type</Label>
              <Select value={vpnForm.type} onValueChange={v => setVPNForm({ ...vpnForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IPSec">IPSec</SelectItem>
                  <SelectItem value="SSL">SSL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vpn-remote">Remote Gateway</Label>
              <Input id="vpn-remote" value={vpnForm.remote} onChange={e => setVPNForm({ ...vpnForm, remote: e.target.value })} placeholder="e.g. 203.0.113.1 or vpn.example.com" />
            </div>
            <div>
              <Label htmlFor="vpn-psk">Pre-shared Key</Label>
              <Input id="vpn-psk" type="password" value={vpnForm.psk} onChange={e => setVPNForm({ ...vpnForm, psk: e.target.value })} placeholder="Enter pre-shared key" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={vpnForm.status} onCheckedChange={v => setVPNForm({ ...vpnForm, status: v })} />
              <Label>Status</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editVPN ? "Save Changes" : "Add VPN")}</Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {showToast}
        </div>
      )}
    </div>
  );
} 