import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";

const metrics = [
  { label: "Total Requests", value: "0" },
  { label: "Assigned", value: "0" },
  { label: "Scheduled", value: "0" },
  { label: "Completed", value: "0" }
];

export default function AdminDashboardPage() {
  return (
    <AppShell title="Admin Dashboard" role="admin">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </AppShell>
  );
}
