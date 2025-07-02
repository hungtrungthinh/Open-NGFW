import { useEffect, useState } from "react";

type ScheduledReport = { id: string; name: string; type: string; schedule: string; recipients: string; nextRun: string; status: boolean };

export default function ScheduleManager() {
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/reports/schedules")
      .then(res => res.json())
      .then(setScheduled)
      .catch((err) => setError("Failed to load schedules: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  // ... render loading/error/empty state cho bảng và modal ...

  // ... existing code ...
} 