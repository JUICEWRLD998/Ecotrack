import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api-client";
import {
  formatDate,
  formatDateTime,
  formatRequestStatus,
  formatWasteType,
  getMyRequest,
  getRequestCollectionDate
} from "@/lib/requests";

type RequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const request = await getMyRequest(session.apiToken, id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  });

  return (
    <AppShell title="Request Details" role="resident">
      <div>
        <Button asChild variant="ghost" className="gap-2 px-0">
          <Link href="/requests">
            <ArrowLeft className="h-4 w-4" />
            Back to requests
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{formatWasteType(request.wasteType)}</CardTitle>
                <Badge variant="secondary">{formatRequestStatus(request.status)}</Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{request.address}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium">Submitted</dt>
                  <dd className="text-sm text-muted-foreground">{formatDate(request.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">Preferred</dt>
                  <dd className="text-sm text-muted-foreground">{formatDate(request.preferredDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">Collection</dt>
                  <dd className="text-sm text-muted-foreground">{formatDate(getRequestCollectionDate(request))}</dd>
                </div>
              </dl>

              {request.description ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Description</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{request.description}</p>
                </div>
              ) : null}

              {request.imageUrl ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Uploaded Image</h2>
                  <img
                    src={request.imageUrl}
                    alt="Submitted waste collection request"
                    className="aspect-video w-full rounded-md border object-cover"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {request.statusHistory.length > 0 ? (
              <ol className="space-y-4">
                {request.statusHistory.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-primary/30 pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{formatRequestStatus(entry.status)}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                    </div>
                    {entry.note ? <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p> : null}
                    {entry.changedBy ? (
                      <p className="mt-1 text-xs text-muted-foreground">Updated by {entry.changedBy.name}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No status updates have been recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
