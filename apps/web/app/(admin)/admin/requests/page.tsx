import Link from "next/link";
import { redirect } from "next/navigation";
import { Filter } from "lucide-react";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES, WASTE_TYPE_LABELS, WASTE_TYPES } from "@/lib/schemas";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminRequests, getAdminUsers, getAdminUsersByRole } from "@/lib/admin";
import {
  formatDate,
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
  const session = await auth();

  if (!session?.user) {
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
      <Card>
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
              />
            </div>

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
              <Label htmlFor="assignedToId">Assignment</Label>
              <select
                id="assignedToId"
                name="assignedToId"
                defaultValue={filters.assignedToId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

            <Button type="submit" className="gap-2">
              <Filter className="h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {requests.length > 0 ? (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-normal">{formatWasteType(request.wasteType)}</h2>
                    <Badge variant="secondary">{formatRequestStatus(request.status)}</Badge>
                    {!request.assignedTo ? <Badge variant="outline">Unassigned</Badge> : null}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{request.address}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    <span>Resident: {request.user.name}</span>
                    <span>Submitted: {formatDate(request.createdAt)}</span>
                    <span>Collection: {formatDate(getRequestCollectionDate(request))}</span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">Assigned admin</p>
                  <p className="text-muted-foreground">{request.assignedTo?.name ?? "None"}</p>
                </div>

                <div className="flex items-center xl:justify-end">
                  <Button asChild variant="outline">
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
    </AppShell>
  );
}
