import Link from "next/link";
import { redirect } from "next/navigation";
import { Filter } from "lucide-react";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES, WASTE_TYPE_LABELS, WASTE_TYPES } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell-server";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminRequests, getAdminUsers, getAdminUsersByRole } from "@/lib/admin";
import {
  formatDate,
  formatPaymentStatus,
  formatRequestStatus,
  formatWasteType,
  getRequestCollectionDate
} from "@/lib/requests";

type AdminRequestsPageProps = {
  searchParams: Promise<{
    status?: string;
    wasteType?: string;
    assignedToId?: string;
    search?: string;
  }>;
};

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const filters = await searchParams;
  const [requests, users] = await Promise.all([
    getAdminRequests(session.apiToken, filters),
    getAdminUsers(session.apiToken, {
      role: "ADMIN",
      isActive: "true"
    })
  ]);
  const admins = getAdminUsersByRole(users, "ADMIN");

  return (
    <AppShell title="Request Management" role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Request Management</h2>
          <p className="text-muted-foreground">View and manage all waste collection requests</p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_220px_auto] xl:items-end">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  name="search"
                  type="search"
                  placeholder="Address, resident, or email"
                  defaultValue={filters.search ?? ""}
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={filters.status ?? ""}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <Label htmlFor="assignedToId">Assignment</Label>
                <select
                  id="assignedToId"
                  name="assignedToId"
                  defaultValue={filters.assignedToId ?? ""}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All assignments</option>
                  <option value="unassigned">Unassigned</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="gap-2 shadow-md">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
            </form>
          </CardContent>
        </Card>

        {requests.length > 0 ? (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
                  <div className="min-w-0 space-y-3">
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
                      {!request.assignedTo && <Badge variant="outline">Unassigned</Badge>}
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
                    <p className="text-sm text-muted-foreground">{request.address}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Resident:</span> {request.user.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Submitted:</span> {formatDate(request.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">Collection:</span> {formatDate(getRequestCollectionDate(request))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">Assigned Admin</p>
                    <p className="text-muted-foreground">{request.assignedTo?.name ?? "None"}</p>
                  </div>

                  <div className="flex items-center xl:justify-end">
                    <Button asChild variant="outline" className="shadow-sm">
                      <Link href={`/admin/requests/${request.id}`}>Manage</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No matching requests" description="Try changing the filters or search term." />
        )}
      </div>
    </AppShell>
  );
}
