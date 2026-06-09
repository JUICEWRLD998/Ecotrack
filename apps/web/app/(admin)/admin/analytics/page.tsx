import Link from "next/link";
import { redirect } from "next/navigation";
import { Filter } from "lucide-react";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES, WASTE_TYPE_LABELS, WASTE_TYPES } from "@/lib/schemas";
import { auth } from "@/auth";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminCompletionRate,
  getAdminMonthlyTrends,
  getAdminOverview,
  getAdminWasteTypeAnalytics,
  type AnalyticsFilters
} from "@/lib/admin";

type AdminAnalyticsPageProps = {
  searchParams: Promise<AnalyticsFilters>;
};

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const filters = await searchParams;
  const [overview, wasteTypes, monthlyTrends, completionRate] = await Promise.all([
    getAdminOverview(session.apiToken, filters),
    getAdminWasteTypeAnalytics(session.apiToken, filters),
    getAdminMonthlyTrends(session.apiToken, filters),
    getAdminCompletionRate(session.apiToken, filters)
  ]);
  const metrics = [
    { label: "Total Requests", value: String(overview.totalRequests) },
    { label: "Completed", value: String(completionRate.completedRequests) },
    { label: "Completion Rate", value: `${completionRate.completionRate}%` },
    { label: "Outstanding", value: String(completionRate.outstandingRequests) },
    { label: "Pending", value: String(overview.pendingRequests) },
    { label: "In Progress", value: String(completionRate.inProgressRequests) },
    { label: "Scheduled", value: String(overview.scheduledRequests) },
    { label: "Active Users", value: String(overview.activeUsers) }
  ];

  return (
    <AppShell title="Analytics Dashboard" role="admin">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[170px_170px_150px_150px_auto_auto] xl:items-end">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={filters.status ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All statuses</option>
                {REQUEST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {REQUEST_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wasteType">Waste type</Label>
              <select
                id="wasteType"
                name="wasteType"
                defaultValue={filters.wasteType ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All types</option>
                {WASTE_TYPES.map((wasteType) => (
                  <option key={wasteType} value={wasteType}>
                    {WASTE_TYPE_LABELS[wasteType]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" name="from" type="date" defaultValue={filters.from ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" name="to" type="date" defaultValue={filters.to ?? ""} />
            </div>

            <Button type="submit" className="gap-2">
              <Filter className="h-4 w-4" />
              Apply
            </Button>

            <Button asChild type="button" variant="outline">
              <Link href="/admin/analytics">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <AnalyticsCharts
        statusDistribution={overview.statusDistribution}
        wasteTypes={wasteTypes}
        monthlyTrends={monthlyTrends}
        completionRate={completionRate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Waste Type Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {wasteTypes.map((entry) => (
              <div key={entry.wasteType} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_120px_120px]">
                <p className="font-medium">{WASTE_TYPE_LABELS[entry.wasteType]}</p>
                <p className="text-sm text-muted-foreground">{entry.count} requests</p>
                <p className="text-sm text-muted-foreground">{entry.percentage}% of total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
