import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";

const metrics = [
  { label: "Total Requests", value: "0" },
  { label: "Pending", value: "0" },
  { label: "Completed", value: "0" },
  { label: "Upcoming Collection", value: "None" }
];

export default function ResidentDashboardPage() {
  return (
    <AppShell title="Resident Dashboard" role="resident">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </AppShell>
  );
}
