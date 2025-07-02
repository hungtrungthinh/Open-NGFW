import { useState, useEffect } from "react";
import Select from "react-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const userOptions = [
  { value: "admin", label: "Admin" },
  { value: "secops", label: "SecOps" },
  { value: "user1", label: "User 1" },
];
const groupOptions = [
  { value: "admins", label: "Admins" },
  { value: "users", label: "Users" },
];
const tenantOptions = [
  { value: "hq", label: "Headquarters" },
  { value: "branch1", label: "Branch 1" },
  { value: "branch2", label: "Branch 2" },
];

type OptionType = { value: string; label: string };
type AccessRow = { user: string; group: string; tenant: string };

export default function AccessControl() {
  const [tenant, setTenant] = useState<OptionType>(tenantOptions[0]);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/reports/access")
      .then(res => res.json())
      .then(setAccess)
      .catch((err) => setError("Failed to load access list: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle>Report Access Control</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tenant/Site/Branch</label>
          <select value={tenant.value} onChange={e => setTenant(tenantOptions.find(t => t.value === e.target.value)!)} className="border rounded px-2 py-1">
            {tenantOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <Button className="mb-4">Assign Access</Button>
        <div className="mb-4">
          <label className="block font-medium mb-1">Current Access List</label>
          {loading ? (
            <p>Loading access list...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1 text-left">Group</th>
                  <th className="px-2 py-1 text-left">Tenant</th>
                </tr>
              </thead>
              <tbody>
                {access.map((a, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">{a.user}</td>
                    <td className="px-2 py-1">{a.group}</td>
                    <td className="px-2 py-1">{a.tenant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 