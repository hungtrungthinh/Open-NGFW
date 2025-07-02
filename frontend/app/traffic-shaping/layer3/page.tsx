"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Trash2 } from "lucide-react";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const mockL3Rules = [
  { id: "1", policy: "Deny", protocol: "Any", destination: "192.168.1.0/24", port: "Any", comment: "Block subnet" },
  { id: "2", policy: "Allow", protocol: "TCP", destination: "10.0.0.5", port: "443", comment: "Allow HTTPS" }
];

export default function TrafficShapingL3Page() {
  const [l3Rules, setL3Rules] = useState<Layer3Rule[]>(mockL3Rules);
  const [isL3DialogOpen, setIsL3DialogOpen] = useState(false);
  const [editL3Rule, setEditL3Rule] = useState<Layer3Rule | null>(null);
  const [l3Form, setL3Form] = useState({ policy: "Allow", protocol: "Any", destination: "", port: "", comment: "" });

  const handleAddL3 = () => {
    setEditL3Rule(null);
    setL3Form({ policy: "Allow", protocol: "Any", destination: "", port: "", comment: "" });
    setIsL3DialogOpen(true);
  };
  const handleEditL3 = (rule: Layer3Rule) => {
    setEditL3Rule(rule);
    setL3Form(rule);
    setIsL3DialogOpen(true);
  };
  const handleDeleteL3 = (id: string) => {
    setL3Rules(l3Rules.filter(r => r.id !== id));
  };
  const handleSaveL3 = () => {
    if (!l3Form.destination || !l3Form.port) return;
    if (editL3Rule) {
      setL3Rules(l3Rules.map(r => r.id === editL3Rule.id ? { ...editL3Rule, ...l3Form } : r));
    } else {
      setL3Rules([...l3Rules, { ...l3Form, id: (Math.random() * 100000).toFixed(0) }]);
    }
    setIsL3DialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <Link href="/" className="hover:underline text-gray-700">Home</Link>
        <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
        <Link href="/traffic-shaping" className="hover:underline text-gray-700">Traffic Shaping</Link>
        <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-900">Layer 3 Rules</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Traffic Shaping - Layer 3 Rules</h1>
      <Card>
        <CardHeader>
          <CardTitle>Layer 3 Firewall Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddL3}>
              <Plus className="w-4 h-4 mr-2" />
              Add L3 Rule
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Policy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Protocol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Port</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Comment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {l3Rules.map(rule => (
                  <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{rule.policy}</td>
                    <td className="py-3 px-4">{rule.protocol}</td>
                    <td className="py-3 px-4">{rule.destination}</td>
                    <td className="py-3 px-4">{rule.port}</td>
                    <td className="py-3 px-4">{rule.comment}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditL3(rule)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteL3(rule.id)}>
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
      <Dialog open={isL3DialogOpen} onOpenChange={setIsL3DialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editL3Rule ? "Edit L3 Rule" : "Add L3 Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy">Policy</Label>
              <Select value={l3Form.policy} onValueChange={v => setL3Form({ ...l3Form, policy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allow">Allow</SelectItem>
                  <SelectItem value="Deny">Deny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={l3Form.protocol} onValueChange={v => setL3Form({ ...l3Form, protocol: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="TCP">TCP</SelectItem>
                  <SelectItem value="UDP">UDP</SelectItem>
                  <SelectItem value="ICMP">ICMP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" value={l3Form.destination} onChange={e => setL3Form({ ...l3Form, destination: e.target.value })} placeholder="e.g. 192.168.1.0/24" />
            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input id="port" value={l3Form.port} onChange={e => setL3Form({ ...l3Form, port: e.target.value })} placeholder="e.g. 80, 443" />
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Input id="comment" value={l3Form.comment} onChange={e => setL3Form({ ...l3Form, comment: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveL3}>{editL3Rule ? "Save Changes" : "Add L3 Rule"}</Button>
            <Button variant="outline" onClick={() => setIsL3DialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 