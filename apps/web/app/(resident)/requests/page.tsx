import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell-server";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  formatRequestStatus,
  formatWasteType,
  getMyRequests,
  getRequestCollectionDate
} from "@/lib/requests";

export default async function MyRequestsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const requests = await getMyRequests(session.apiToken);

  return (
    <AppShell title="My Requests" role="resident">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Requests</h2>
            <p className="text-muted-foreground">View and manage all your waste collection requests</p>
          </div>
          <Button asChild className="gap-2 shadow-md">
            <Link href="/requests/new">
              <Plus className="h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>

        {requests.length > 0 ? (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_auto]">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{formatWasteType(request.wasteType)}</h3>
                      <Badge
                        variant={
                          request.status === "COLLECTED"
                            ? "default"
                            : request.status === "PENDING"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {formatRequestStatus(request.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.address}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Submitted:</span> {formatDate(request.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Preferred:</span> {formatDate(request.preferredDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Collection:</span> {formatDate(getRequestCollectionDate(request))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center lg:justify-end">
                    <Button asChild variant="outline" className="shadow-sm">
                      <Link href={`/requests/${request.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No requests yet"
            description="Submitted collection requests will appear here. Start by creating your first request."
          />
        )}
      </div>
    </AppShell>
  );
}
