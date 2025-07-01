import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

const mockNAT = [
  { id: 1, original: '192.168.1.10:80', translated: '203.0.113.10:8080', type: 'SNAT', status: true },
  { id: 2, original: '10.0.0.5:22', translated: '198.51.100.5:2222', type: 'DNAT', status: false },
];

export default function NATPage() {
  const [showForm, setShowForm] = useState(false);
  const [natRules, setNatRules] = useState(mockNAT);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-8 pt-8 w-full">
      <Card className="border border-gray-200 rounded-md bg-white mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">NAT Rules</CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add NAT Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <input type="text" placeholder="Search..." className="border rounded px-2 py-1 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="border rounded px-2 py-1 text-xs">
              <option>All Types</option>
              <option>SNAT</option>
              <option>DNAT</option>
              <option>PAT</option>
            </select>
            <select className="border rounded px-2 py-1 text-xs">
              <option>All Status</option>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-1 px-2 text-left font-semibold">Original IP/Port</th>
                  <th className="py-1 px-2 text-left font-semibold">Translated IP/Port</th>
                  <th className="py-1 px-2 text-left font-semibold">Type</th>
                  <th className="py-1 px-2 text-left font-semibold">Status</th>
                  <th className="py-1 px-2 text-center font-semibold">Edit</th>
                  <th className="py-1 px-2 text-center font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {natRules.filter(r => r.original.includes(search) || r.translated.includes(search)).map(rule => (
                  <tr key={rule.id} className="border-b last:border-0">
                    <td className="py-1 px-2 font-mono">{rule.original}</td>
                    <td className="py-1 px-2 font-mono">{rule.translated}</td>
                    <td className="py-1 px-2">{rule.type}</td>
                    <td className="py-1 px-2">
                      <Badge variant={rule.status ? 'default' : 'secondary'}>{rule.status ? 'Enabled' : 'Disabled'}</Badge>
                    </td>
                    <td className="py-1 px-2 text-center">
                      <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                    </td>
                    <td className="py-1 px-2 text-center">
                      <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Add/Edit NAT Rule Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add/Edit NAT Rule</h2>
            <form className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Original IP/Port</label>
                <input type="text" className="border rounded px-2 py-1 w-full text-xs" placeholder="e.g. 192.168.1.10:80" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Translated IP/Port</label>
                <input type="text" className="border rounded px-2 py-1 w-full text-xs" placeholder="e.g. 203.0.113.10:8080" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Type</label>
                <select className="border rounded px-2 py-1 w-full text-xs">
                  <option>SNAT</option>
                  <option>DNAT</option>
                  <option>PAT</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-semibold">Status</label>
                <input type="checkbox" className="accent-green-600" />
                <span className="text-xs">Enabled</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 