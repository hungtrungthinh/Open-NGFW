import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const anomalyData = [
  { time: "14:25", value: 10 },
  { time: "14:26", value: 12 },
  { time: "14:27", value: 9 },
  { time: "14:28", value: 30 }, // anomaly
  { time: "14:29", value: 11 },
  { time: "14:30", value: 10 },
];
const anomalyEvents = [
  { time: "14:28", type: "Spike", detail: "Traffic anomaly detected" },
];

type AnomalyEvent = { time: string; type: string; detail: string };

export default function AnomalyTrend() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Anomaly/Trend Chart</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={anomalyData}>
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
      <Card>
        <CardHeader><CardTitle>Anomaly Events</CardTitle></CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Time</th>
                <th className="px-2 py-1 text-left">Type</th>
                <th className="px-2 py-1 text-left">Detail</th>
              </tr>
            </thead>
            <tbody>
              {anomalyEvents.map((e, i) => (
                <tr key={i}>
                  <td className="px-2 py-1">{e.time}</td>
                  <td className="px-2 py-1">{e.type}</td>
                  <td className="px-2 py-1">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
} 