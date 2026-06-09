import Link from "next/link";
import { redirect } from "next/navigation";
import { Filter } from "lucide-react";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES, WASTE_TYPE_LABELS, WASTE_TYPES } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { AdminScheduleActions, AdminScheduleCreateForm } from "@/components/admin/admin-schedule-actions";
import { ScheduleCalendar } from "@/components/calendar/schedule-calendar";
import { AppShell } from "@/components/layout/app-shell-server";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminRequests, getAdminUsers, getAdminUsersByRole } from "@/lib/admin";
import { formatDate, formatRequestStatus, formatWasteType } from "@/lib/requests";
import { getAdminSchedules } from "@/lib/schedules";

type AdminSchedulesPageProps = {
  searchParams: Promise<{
    month?: string;
    status?: string;
    wasteType?: string;
    assignedToId?: string;
    search?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function AdminSchedulesPage({ searchParams }: AdminSchedulesPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const filters = await searchParams;
  const [schedules, requests, users] = await Promise.all([
    getAdminSchedules(session.apiToken, filters),
    getAdminRequests(session.apiToken),
    getAdminUsers(session.apiToken, {
      role: "ADMIN",
      isActive: "true"
    })
  ]);
  const admins = getAdminUsersByRole(users, "ADMIN");
  const schedulableRequests = requests.filter((request) => request.status !== "COLLECTED");
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    date: schedule.collectionDate,
    title: formatWasteType(schedule.request.wasteType),
    subtitle: schedule.request.user.name,
    href: `/admin/requests/${schedule.request.id}`,
    badge: formatRequestStatus(schedule.request.status)
  }));

  return (
    <AppShell title="Schedule Management" role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Schedule Management</h2>
          <p className="text-muted-foreground">Create and manage collection schedules</p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle>Create Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminScheduleCreateForm apiToken={session.apiToken} requests={schedulableRequests} />
          </CardContent>
        </Card>

        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_160px_160px_200px_150px_150px_auto] xl:items-end">
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

              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input id="from" name="from" type="date" defaultValue={filters.from ?? ""} className="border-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" name="to" type="date" defaultValue={filters.to ?? ""} className="border-border" />
              </div>

              <Button type="submit" className="gap-2 shadow-md">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
            </form>
          </CardContent>
        </Card>

        {schedules.length > 0 ? (
          <>
            <ScheduleCalendar title="Admin Calendar" events={events} month={filters.month} basePath="/admin/schedules" />

            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle>Scheduled Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="space-y-5 p-6">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                {formatWasteType(schedule.request.wasteType)}
                              </h3>
                              <Badge
                                variant={
                                  schedule.request.status === "COLLECTED"
                                    ? "default"
                                    : schedule.request.status === "PENDING"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {formatRequestStatus(schedule.request.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{schedule.request.address}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-foreground">Resident:</span> {schedule.request.user.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-foreground">Assigned:</span> {schedule.request.assignedTo?.name ?? "None"}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-foreground">Collection:</span> {formatDate(schedule.collectionDate)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-foreground">Notes</p>
                            <p className="text-muted-foreground">{schedule.notes ?? "None"}</p>
                          </div>

                          <div className="flex items-center xl:justify-end">
                            <Button asChild variant="outline" className="shadow-sm">
                              <Link href={`/admin/requests/${schedule.request.id}`}>Open Request</Link>
                            </Button>
                          </div>
                        </div>

                        <AdminScheduleActions apiToken={session.apiToken} schedule={schedule} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <EmptyState title="No schedules found" description="Create a collection schedule or adjust the filters." />
        )}
      </div>
    </AppShell>
  );
}
