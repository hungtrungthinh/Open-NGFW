import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

const mockSessions = [
  { id: 1, source: '192.168.1.10', destination: '8.8.8.8', protocol: 'TCP', port: 443, state: 'ESTABLISHED', bytes: 123456, duration: '00:05:12' },
  { id: 2, source: '192.168.1.11', destination: '1.1.1.1', protocol: 'UDP', port: 53, state: 'NEW', bytes: 2345, duration: '00:00:10' },
];

export default function TrafficMonitorPage() {
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(null as null | typeof mockSessions[0]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-8 pt-8 w-full">
      <Card className="border border-gray-200 rounded-md bg-white mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Traffic Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <input type="text" placeholder="Search..." className="border rounded px-2 py-1 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="border rounded px-2 py-1 text-xs">
              <option>All Protocols</option>
              <option>TCP</option>
              <option>UDP</option>
            </select>
            <select className="border rounded px-2 py-1 text-xs">
              <option>All States</option>
              <option>NEW</option>
              <option>ESTABLISHED</option>
            </select>
            <Button size="sm" variant="outline">Search</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-1 px-2 text-left font-semibold">Source IP</th>
                  <th className="py-1 px-2 text-left font-semibold">Destination IP</th>
                  <th className="py-1 px-2 text-left font-semibold">Protocol</th>
                  <th className="py-1 px-2 text-left font-semibold">Port</th>
                  <th className="py-1 px-2 text-left font-semibold">State</th>
                  <th className="py-1 px-2 text-right font-semibold">Bytes</th>
                  <th className="py-1 px-2 text-right font-semibold">Duration</th>
                  <th className="py-1 px-2 text-center font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {mockSessions.filter(s => s.source.includes(search) || s.destination.includes(search)).map(session => (
                  <tr key={session.id} className="border-b last:border-0">
                    <td className="py-1 px-2 font-mono">{session.source}</td>
                    <td className="py-1 px-2 font-mono">{session.destination}</td>
                    <td className="py-1 px-2">{session.protocol}</td>
                    <td className="py-1 px-2">{session.port}</td>
                    <td className="py-1 px-2"><Badge variant={session.state === 'ESTABLISHED' ? 'default' : 'secondary'}>{session.state}</Badge></td>
                    <td className="py-1 px-2 text-right font-mono">{session.bytes.toLocaleString()}</td>
                    <td className="py-1 px-2 text-right">{session.duration}</td>
                    <td className="py-1 px-2 text-center">
                      <Button size="icon" variant="ghost" onClick={() => setShowDetail(session)}><Eye className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Session Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Session Detail</h2>
            <div className="space-y-2 text-xs">
              <div><b>Source:</b> {showDetail.source}</div>
              <div><b>Destination:</b> {showDetail.destination}</div>
              <div><b>Protocol:</b> {showDetail.protocol}</div>
              <div><b>Port:</b> {showDetail.port}</div>
              <div><b>State:</b> {showDetail.state}</div>
              <div><b>Bytes:</b> {showDetail.bytes.toLocaleString()}</div>
              <div><b>Duration:</b> {showDetail.duration}</div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setShowDetail(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 