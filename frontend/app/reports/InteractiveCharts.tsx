import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useState, useEffect } from "react";

const trafficData = [
  { time: "14:25", incoming: 1200, outgoing: 800, connections: 45 },
  { time: "14:26", incoming: 1800, outgoing: 1200, connections: 52 },
  { time: "14:27", incoming: 2400, outgoing: 1600, connections: 48 },
  { time: "14:28", incoming: 3000, outgoing: 2000, connections: 61 },
  { time: "14:29", incoming: 2800, outgoing: 1800, connections: 58 },
  { time: "14:30", incoming: 2200, outgoing: 1400, connections: 55 },
  { time: "14:31", incoming: 2600, outgoing: 1600, connections: 62 },
  { time: "14:32", incoming: 3200, outgoing: 2200, connections: 67 },
];
const protocolData = [
  { protocol: "HTTPS", connections: 25, bytes: 15420 },
  { protocol: "HTTP", connections: 15, bytes: 8900 },
  { protocol: "DNS", connections: 12, bytes: 5600 },
  { protocol: "SSH", connections: 8, bytes: 3200 },
  { protocol: "FTP", connections: 5, bytes: 1800 },
];
const securityData = [
  { name: "IPS", value: 12 },
  { name: "Antivirus", value: 8 },
  { name: "Web Filter", value: 5 },
  { name: "DoS", value: 2 },
];
const userData = [
  { user: "admin", bandwidth: 12000 },
  { user: "user1", bandwidth: 8000 },
  { user: "user2", bandwidth: 6000 },
  { user: "user3", bandwidth: 4000 },
];
const anomalyData = [
  { time: "14:25", value: 10 },
  { time: "14:26", value: 12 },
  { time: "14:27", value: 9 },
  { time: "14:28", value: 30 }, // anomaly
  { time: "14:29", value: 11 },
  { time: "14:30", value: 10 },
];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

type TrafficStat = { time: string; incoming: number; outgoing: number; connections: number };
type ProtocolStat = { protocol: string; connections: number; bytes: number };
type SecurityStat = { name: string; value: number };
type UserStat = { user: string; bandwidth: number };
type AnomalyStat = { time: string; value: number };

export default function InteractiveCharts() {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Traffic Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trafficData} onClick={e => setSelected(e && e.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incoming" stroke="#8884d8" name="Incoming" />
              <Line type="monotone" dataKey="outgoing" stroke="#82ca9d" name="Outgoing" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Top Applications</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={protocolData} onClick={e => setSelected(e && e.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="protocol" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="connections" fill="#8884d8" name="Connections" />
              <Bar dataKey="bytes" fill="#82ca9d" name="Bytes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Security Events</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={securityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {securityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>User Bandwidth</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userData} onClick={e => setSelected(e && e.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bandwidth" fill="#8884d8" name="Bandwidth" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Anomaly/Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={anomalyData} onClick={e => setSelected(e && e.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#ff8042" name="Events" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Drill-down modal (mock) */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
            <div className="font-bold mb-2">Drill-down: {selected}</div>
            <div>[Chi tiết dữ liệu tại thời điểm hoặc đối tượng này]</div>
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSelected(undefined)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
} 