import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/admin";
import {
  formatDate,
  formatRequestStatus,
  formatWasteType,
  getRequestCollectionDate
} from "@/lib/requests";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const overview = await getAdminOverview(session.apiToken);
  const metrics = [
    { label: "Total Requests", value: String(overview.totalRequests) },
    { label: "Pending", value: String(overview.pendingRequests) },
    { label: "Assigned", value: String(overview.assignedRequests) },
    { label: "Completed", value: String(overview.completedRequests) },
    { label: "Completion Rate", value: `${overview.completionRate}%` },
    { label: "Active Users", value: String(overview.activeUsers) },
    { label: "Total Users", value: String(overview.totalUsers) },
    { label: "Scheduled", value: String(overview.scheduledRequests) }
  ];

  return (
    <AppShell title="Admin Dashboard" role="admin">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Requests</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/requests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overview.recentRequests.length > 0 ? (
              <div className="divide-y rounded-md border">
                {overview.recentRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/admin/requests/${request.id}`}
                    className="grid gap-3 p-4 transition-colors hover:bg-muted/60 md:grid-cols-[minmax(0,1fr)_auto_auto]"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{formatWasteType(request.wasteType)}</p>
                        <Badge variant="secondary">{formatRequestStatus(request.status)}</Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{request.address}</p>
                      <p className="text-xs text-muted-foreground">Resident: {request.user.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.assignedTo ? request.assignedTo.name : "Unassigned"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(getRequestCollectionDate(request))}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No collection requests have been submitted yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">By status</h2>
              {overview.statusDistribution.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{formatRequestStatus(entry.status)}</span>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-5">
              <h2 className="text-sm font-medium">By waste type</h2>
              {overview.wasteTypeDistribution.map((entry) => (
                <div key={entry.wasteType} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{formatWasteType(entry.wasteType)}</span>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
