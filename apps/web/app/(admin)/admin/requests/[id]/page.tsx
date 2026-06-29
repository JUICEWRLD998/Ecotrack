import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminRequestActions } from "@/components/admin/admin-request-actions";
import { AppShell } from "@/components/layout/app-shell-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api-client";
import { getAdminRequest, getAdminUsers, getAdminUsersByRole } from "@/lib/admin";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatPaymentStatus,
  formatRequestStatus,
  formatWasteType,
  getRequestCollectionDate
} from "@/lib/requests";

type AdminRequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRequestDetailsPage({ params }: AdminRequestDetailsPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const [request, users] = await Promise.all([
    getAdminRequest(session.apiToken, id).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }

      throw error;
    }),
    getAdminUsers(session.apiToken, {
      role: "ADMIN",
      isActive: "true"
    })
  ]);
  const admins = getAdminUsersByRole(users, "ADMIN");

  return (
    <AppShell title="Admin Request Details" role="admin">
      <div>
        <Button asChild variant="ghost" className="gap-2 px-0">
          <Link href="/admin/requests">
            <ArrowLeft className="h-4 w-4" />
            Back to requests
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{formatWasteType(request.wasteType)}</CardTitle>
                <Badge variant="secondary">{formatRequestStatus(request.status)}</Badge>
                <Badge
                  variant={
                    request.paymentStatus === "VERIFIED"
                      ? "default"
                      : request.paymentStatus === "REJECTED"
                      ? "destructive"
                      : request.paymentStatus === "PENDING_VERIFICATION"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {formatPaymentStatus(request.paymentStatus)}
                </Badge>
                {!request.assignedTo ? <Badge variant="outline">Unassigned</Badge> : null}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{request.address}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <dt className="text-sm font-medium">Resident</dt>
                  <dd className="text-sm text-muted-foreground">{request.user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium">Assigned admin</dt>
                  <dd className="text-sm text-muted-foreground">{request.assignedTo?.name ?? "None"}</dd>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <h2 className="text-sm font-medium">Resident contact</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{request.user.email}</p>
                </div>
                <div className="rounded-md border p-4">
                  <h2 className="text-sm font-medium">Submitted</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{formatDateTime(request.createdAt)}</p>
                </div>
              </div>

              {request.description ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Description</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{request.description}</p>
                </div>
              ) : null}

              {request.imageUrl ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium">Uploaded Image</h2>
                  <div className="relative w-full max-w-md">
                    <Image
                      src={request.imageUrl}
                      alt="Submitted waste collection request"
                      width={600}
                      height={400}
                      sizes="(min-width: 1280px) 400px, (min-width: 768px) 600px, 100vw"
                      className="w-full rounded-lg border-2 border-border object-cover shadow-sm"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-4 rounded-md border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-medium">Payment</h2>
                  <Badge
                    variant={
                      request.paymentStatus === "VERIFIED"
                        ? "default"
                        : request.paymentStatus === "REJECTED"
                        ? "destructive"
                        : request.paymentStatus === "PENDING_VERIFICATION"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {formatPaymentStatus(request.paymentStatus)}
                  </Badge>
                </div>
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium">Amount</dt>
                    <dd className="text-sm text-muted-foreground">{formatCurrency(request.paymentAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Submitted</dt>
                    <dd className="text-sm text-muted-foreground">{formatDateTime(request.paymentSubmittedAt ?? request.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Verified</dt>
                    <dd className="text-sm text-muted-foreground">
                      {request.paymentVerifiedAt ? formatDateTime(request.paymentVerifiedAt) : "None"}
                    </dd>
                  </div>
                </dl>
                {request.paymentReceiptUrl ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Payment Receipt</h3>
                    <div className="relative w-full max-w-md">
                      <Image
                        src={request.paymentReceiptUrl}
                        alt="Payment receipt"
                        width={600}
                        height={400}
                        sizes="(min-width: 1280px) 400px, (min-width: 768px) 600px, 100vw"
                        className="w-full rounded-lg border-2 border-border object-cover shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment receipt has been uploaded.</p>
                )}
                {request.paymentRejectionReason ? (
                  <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {request.paymentRejectionReason}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

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

        <AdminRequestActions
          apiToken={session.apiToken}
          requestId={request.id}
          currentStatus={request.status}
          paymentStatus={request.paymentStatus}
          hasPaymentReceipt={Boolean(request.paymentReceiptUrl)}
          assignedToId={request.assignedToId}
          admins={admins}
        />
      </div>
    </AppShell>
  );
}
