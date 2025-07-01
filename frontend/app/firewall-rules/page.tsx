import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

const mockRules = [
  {
    id: 1,
    source: '192.168.1.0/24',
    destination: '10.0.0.0/8',
    service: 'HTTP, HTTPS',
    action: 'Allow',
    schedule: 'Always',
    status: true,
    description: 'Allow web access',
  },
  {
    id: 2,
    source: '0.0.0.0/0',
    destination: '192.168.1.100',
    service: 'SSH',
    action: 'Deny',
    schedule: 'Work hours',
    status: false,
    description: 'Block SSH from internet',
  },
];

export default function FirewallRulesPage() {
  const [showForm, setShowForm] = useState(false);
  const [rules, setRules] = useState(mockRules);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-8 pt-8 w-full">
      <Card className="border border-gray-200 rounded-md bg-white mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Firewall Rules</CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded px-2 py-1 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="border rounded px-2 py-1 text-xs">
              <option>All Actions</option>
              <option>Allow</option>
              <option>Deny</option>
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
                  <th className="py-1 px-2 text-left font-semibold">Source</th>
                  <th className="py-1 px-2 text-left font-semibold">Destination</th>
                  <th className="py-1 px-2 text-left font-semibold">Service/Port</th>
                  <th className="py-1 px-2 text-left font-semibold">Action</th>
                  <th className="py-1 px-2 text-left font-semibold">Schedule</th>
                  <th className="py-1 px-2 text-left font-semibold">Status</th>
                  <th className="py-1 px-2 text-left font-semibold">Description</th>
                  <th className="py-1 px-2 text-center font-semibold">Edit</th>
                  <th className="py-1 px-2 text-center font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {rules.filter(r => r.source.includes(search) || r.destination.includes(search) || r.description.includes(search)).map(rule => (
                  <tr key={rule.id} className="border-b last:border-0">
                    <td className="py-1 px-2 font-mono">{rule.source}</td>
                    <td className="py-1 px-2 font-mono">{rule.destination}</td>
                    <td className="py-1 px-2">{rule.service}</td>
                    <td className="py-1 px-2">
                      <Badge variant={rule.action === 'Allow' ? 'default' : 'destructive'}>{rule.action}</Badge>
                    </td>
                    <td className="py-1 px-2">{rule.schedule}</td>
                    <td className="py-1 px-2">
                      <Badge variant={rule.status ? 'default' : 'secondary'}>{rule.status ? 'Enabled' : 'Disabled'}</Badge>
                    </td>
                    <td className="py-1 px-2">{rule.description}</td>
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
      {/* Add/Edit Rule Modal (placeholder, not functional) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add/Edit Rule</h2>
            <form className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Source</label>
                <input type="text" className="border rounded px-2 py-1 w-full text-xs" placeholder="e.g. 192.168.1.0/24" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Destination</label>
                <input type="text" className="border rounded px-2 py-1 w-full text-xs" placeholder="e.g. 10.0.0.0/8" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Service/Port</label>
                <select multiple className="border rounded px-2 py-1 w-full text-xs">
                  <option>HTTP</option>
                  <option>HTTPS</option>
                  <option>SSH</option>
                  <option>Custom...</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Action</label>
                <select className="border rounded px-2 py-1 w-full text-xs">
                  <option>Allow</option>
                  <option>Deny</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Schedule</label>
                <select className="border rounded px-2 py-1 w-full text-xs">
                  <option>Always</option>
                  <option>Work hours</option>
                  <option>Custom...</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-semibold">Status</label>
                <input type="checkbox" className="accent-green-600" />
                <span className="text-xs">Enabled</span>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <input type="text" className="border rounded px-2 py-1 w-full text-xs" />
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