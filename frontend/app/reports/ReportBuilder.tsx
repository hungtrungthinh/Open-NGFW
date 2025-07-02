import { useState, useEffect } from "react";
import Select from "react-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fieldOptions = [
  { value: "source_ip", label: "Source IP", group: "Network" },
  { value: "destination_ip", label: "Destination IP", group: "Network" },
  { value: "user", label: "User", group: "User" },
  { value: "application", label: "Application", group: "Application" },
  { value: "bytes", label: "Bytes", group: "Traffic" },
  { value: "time", label: "Time", group: "Time" },
];
const filterOptions = [
  { value: "protocol", label: "Protocol" },
  { value: "status", label: "Status" },
  { value: "action", label: "Action" },
];
const templateOptions = [
  { value: "traffic", label: "Traffic Template" },
  { value: "security", label: "Security Template" },
];

type OptionType = { value: string; label: string; group?: string };
type FilterOption = { value: string; label: string };
type TemplateOption = { value: string; label: string };
type PreviewRow = Record<string, string | number | undefined>;

export default function ReportBuilder() {
  const [fields, setFields] = useState<OptionType[]>([]);
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [template, setTemplate] = useState<TemplateOption | null>(null);
  const [exportFormat, setExportFormat] = useState("PDF");
  const [apiEndpoint] = useState("/api/reports/custom");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // fetch template nếu cần
  }, []);

  const handlePreview = () => {
    setLoading(true);
    fetch("/api/reports/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields, filters }),
    })
      .then(res => res.json())
      .then(setPreview)
      .catch((err) => setError("Failed to preview report: " + err.message))
      .finally(() => setLoading(false));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Custom Report Builder</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block font-medium mb-1">Fields</label>
          <Select
            isMulti
            options={fieldOptions}
            onChange={v => setFields(v as OptionType[])}
            className="mb-2"
            placeholder="Select fields..."
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Filters</label>
          <Select
            isMulti
            options={filterOptions}
            onChange={v => setFilters(v as FilterOption[])}
            className="mb-2"
            placeholder="Add filters..."
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Template</label>
          <Select
            options={templateOptions}
            onChange={v => setTemplate(v as TemplateOption)}
            className="mb-2"
            placeholder="Select template..."
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Export Format</label>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className="border rounded px-2 py-1">
            <option value="PDF">PDF</option>
            <option value="CSV">CSV</option>
            <option value="XLSX">XLSX</option>
            <option value="JSON">JSON</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">API Endpoint</label>
          <div className="bg-gray-100 rounded px-2 py-1 text-sm">{apiEndpoint}</div>
        </div>
        <div className="mb-4">
          <Button className="mr-2" onClick={handlePreview}>Preview</Button>
          <Button variant="outline">Export</Button>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Preview Data</label>
          <div className="overflow-x-auto">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : preview.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {fields.length > 0 ? fields.map(f => <th key={f.value} className="px-2 py-1 text-left">{f.label}</th>) : <th className="px-2 py-1 text-left">No fields selected</th>}
                  </tr>
                </thead>
                <tbody>
                  {fields.length > 0 && preview.map((row, i) => (
                    <tr key={i}>
                      {fields.map(f => <td key={f.value} className="px-2 py-1">{row[f.value] !== undefined ? row[f.value] : ""}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No data found</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 