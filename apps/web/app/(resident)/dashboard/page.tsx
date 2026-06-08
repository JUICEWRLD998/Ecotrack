import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  formatDate,
  formatRequestStatus,
  formatWasteType,
  getNextCollectionDate,
  getRequestCollectionDate,
  getMyRequests
} from "@/lib/requests";

export default async function ResidentDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const requests = await getMyRequests(session.apiToken);
  const recentRequests = requests.slice(0, 5);
  const metrics = [
    { label: "Total Requests", value: String(requests.length) },
    { label: "Pending", value: String(requests.filter((request) => request.status === "PENDING").length) },
    { label: "Completed", value: String(requests.filter((request) => request.status === "COLLECTED").length) },
    { label: "Upcoming Collection", value: formatDate(getNextCollectionDate(requests)) }
  ];

  return (
    <AppShell title="Resident Dashboard" role="resident">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Requests</CardTitle>
          <Button asChild size="sm">
            <Link href="/requests/new">Submit Request</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="divide-y rounded-md border">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="grid gap-3 p-4 transition-colors hover:bg-muted/60 md:grid-cols-[1fr_auto_auto]"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{formatWasteType(request.wasteType)}</p>
                    <p className="truncate text-sm text-muted-foreground">{request.address}</p>
                  </div>
                  <Badge variant="secondary" className="h-fit w-fit">
                    {formatRequestStatus(request.status)}
                  </Badge>
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
    </AppShell>
  );
}
