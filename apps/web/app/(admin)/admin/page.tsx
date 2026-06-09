import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/admin";
import {
  formatDate,
  formatRequestStatus,
  formatWasteType,
  getRequestCollectionDate
} from "@/lib/requests";
import {
  ClipboardList,
  Clock,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  UserCircle,
  CalendarCheck,
  ArrowRight,
  Package
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getAdminOverview(session.apiToken);

  return (
    <AppShell title="Admin Dashboard" role="admin">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Overview
          </h2>
          <p className="text-muted-foreground">Monitor and manage waste collection operations</p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-border shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-3xl font-bold text-foreground">{overview.totalRequests}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20">
                  <ClipboardList className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-foreground">{overview.pendingRequests}</p>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 dark:bg-yellow-500/20">
                  <Clock className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                  <p className="text-3xl font-bold text-foreground">{overview.assignedRequests}</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 dark:bg-purple-500/20">
                  <UserCheck className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-foreground">{overview.completedRequests}</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {overview.completionRate}% rate
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-border shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20">
                  <CalendarCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overview.scheduledRequests}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overview.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 dark:bg-teal-500/20">
                  <UserCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overview.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
                  <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overview.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Requests - Takes 2 columns on desktop */}
          <Card className="border-border shadow-lg lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Requests</CardTitle>
                  <CardDescription className="mt-1">
                    Latest waste collection submissions
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 shadow-sm">
                  <Link href="/admin/requests">
                    View All
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {overview.recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {overview.recentRequests.map((request) => (
                    <Link
                      key={request.id}
                      href={`/admin/requests/${request.id}`}
                      className="group flex items-start gap-3 rounded-xl border-2 border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md sm:gap-4 sm:p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
                        <Package className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground sm:text-base">
                            {formatWasteType(request.wasteType)}
                          </p>
                          <Badge
                            variant={
                              request.status === "COLLECTED"
                                ? "default"
                                : request.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {formatRequestStatus(request.status)}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">
                          {request.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{request.user.name}</span>
                          </span>
                          {request.assignedTo && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[120px]">{request.assignedTo.name}</span>
                            </span>
                          )}
                          <span className="shrink-0">{formatDate(getRequestCollectionDate(request))}</span>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <ClipboardList className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No collection requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribution — side by side on mobile, stacked on desktop sidebar */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-6">
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">By Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overview.statusDistribution.map((entry) => (
                  <div
                    key={entry.status}
                    className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                  >
                    <span className="text-xs font-medium text-foreground sm:text-sm">
                      {formatRequestStatus(entry.status)}
                    </span>
                    <span className="text-sm font-bold text-foreground">{entry.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">By Waste Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overview.wasteTypeDistribution.map((entry) => (
                  <div
                    key={entry.wasteType}
                    className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                  >
                    <span className="text-xs font-medium text-foreground sm:text-sm">
                      {formatWasteType(entry.wasteType)}
                    </span>
                    <span className="text-sm font-bold text-foreground">{entry.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
