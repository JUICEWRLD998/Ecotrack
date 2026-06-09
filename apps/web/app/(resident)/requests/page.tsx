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
      <div className="flex justify-end">
        <Button asChild className="gap-2">
          <Link href="/requests/new">
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {requests.length > 0 ? (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-normal">{formatWasteType(request.wasteType)}</h2>
                    <Badge variant="secondary">{formatRequestStatus(request.status)}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{request.address}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>Submitted: {formatDate(request.createdAt)}</span>
                    <span>Preferred: {formatDate(request.preferredDate)}</span>
                    <span>Collection: {formatDate(getRequestCollectionDate(request))}</span>
                  </div>
                </div>
                <div className="flex items-center lg:justify-end">
                  <Button asChild variant="outline">
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
          description="Submitted collection requests will appear here."
        />
      )}
    </AppShell>
  );
}
