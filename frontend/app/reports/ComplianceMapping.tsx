import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const complianceTypes = ["PCI-DSS", "HIPAA", "GDPR", "SOX", "NIST"];
const mappingFields = [
  { compliance: "User ID", system: "user", note: "Maps to system user field" },
  { compliance: "Event Time", system: "time", note: "Maps to event timestamp" },
  { compliance: "Source IP", system: "source_ip", note: "Maps to source IP address" },
];

type MappingField = { compliance: string; system: string; note: string };

export default function ComplianceMapping() {
  const [type, setType] = useState(complianceTypes[0]);
  const [mapping, setMapping] = useState<MappingField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/compliance?type=${type}`)
      .then(res => res.json())
      .then(setMapping)
      .catch((err) => setError("Failed to load mapping: " + err.message))
      .finally(() => setLoading(false));
  }, [type]);
  return (
    <Card>
      <CardHeader><CardTitle>Compliance Report Mapping</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block font-medium mb-1">Compliance Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1">
            {complianceTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Field Mapping</label>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Compliance Field</th>
                <th className="px-2 py-1 text-left">System Field</th>
                <th className="px-2 py-1 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {mappingFields.map((f, i) => (
                <tr key={i}>
                  <td className="px-2 py-1">{f.compliance}</td>
                  <td className="px-2 py-1">{f.system}</td>
                  <td className="px-2 py-1">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-4 text-sm text-gray-600">Hướng dẫn: Đảm bảo các trường hệ thống đã được mapping đúng với yêu cầu của chuẩn compliance.</div>
        <div className="mb-4">
          <Button className="mr-2">Export PDF</Button>
          <Button className="mr-2">Export CSV</Button>
          <Button>Export XLSX</Button>
        </div>
      </CardContent>
    </Card>
  );
} 