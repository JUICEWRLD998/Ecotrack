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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          {/* Recent Requests - Takes 2 columns */}
          <Card className="border-border shadow-lg lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Recent Requests</CardTitle>
                  <CardDescription className="mt-1">
                    Latest waste collection submissions
                  </CardDescription>
                </div>
                <Button asChild variant="outline" className="gap-2 shadow-sm">
                  <Link href="/admin/requests">
                    View All
                    <ArrowRight className="h-4 w-4" />
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
                      className="group flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{formatWasteType(request.wasteType)}</p>
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
                          <p className="truncate text-sm text-muted-foreground">{request.address}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <UserCircle className="h-3 w-3" />
                              {request.user.name}
                            </span>
                            {request.assignedTo && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                {request.assignedTo.name}
                              </span>
                            )}
                            <span>{formatDate(getRequestCollectionDate(request))}</span>
                          </div>
                        </div>
                        <ArrowRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No collection requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Sidebar */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Distribution</CardTitle>
              <CardDescription>Request breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* By Status */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">By Status</h3>
                <div className="space-y-2">
                  {overview.statusDistribution.map((entry) => (
                    <div
                      key={entry.status}
                      className="flex items-center justify-between rounded-lg bg-muted p-3"
                    >
                      <span className="text-sm text-foreground">{formatRequestStatus(entry.status)}</span>
                      <span className="font-semibold text-foreground">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Waste Type */}
              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground">By Waste Type</h3>
                <div className="space-y-2">
                  {overview.wasteTypeDistribution.map((entry) => (
                    <div
                      key={entry.wasteType}
                      className="flex items-center justify-between rounded-lg bg-muted p-3"
                    >
                      <span className="text-sm text-foreground">{formatWasteType(entry.wasteType)}</span>
                      <span className="font-semibold text-foreground">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
