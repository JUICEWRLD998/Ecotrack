import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
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
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const overview = await getAdminOverview(session.apiToken);

  return (
    <AppShell title="Admin Dashboard" role="admin">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Overview
          </h2>
          <p className="text-gray-600">Monitor and manage waste collection operations</p>
        </div>

        {/* Primary Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-none shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.totalRequests}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                  <ClipboardList className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.pendingRequests}</p>
                  <p className="text-xs text-gray-500">Needs attention</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10">
                  <Clock className="h-7 w-7 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Assigned</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.assignedRequests}</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
                  <UserCheck className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-green-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{overview.completedRequests}</p>
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {overview.completionRate}% rate
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <CalendarCheck className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overview.scheduledRequests}</p>
                  <p className="text-sm text-gray-600">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overview.totalUsers}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
                  <UserCircle className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overview.activeUsers}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overview.completionRate}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Requests - Takes 2 columns */}
          <Card className="border-none shadow-lg lg:col-span-2">
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
                      className="group flex flex-col gap-4 rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4 transition-all hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                          <Package className="h-6 w-6 text-blue-700" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">{formatWasteType(request.wasteType)}</p>
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
                          <p className="truncate text-sm text-gray-600">{request.address}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
                        <ArrowRight className="hidden h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 sm:block" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">No collection requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Sidebar */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Distribution</CardTitle>
              <CardDescription>Request breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* By Status */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">By Status</h3>
                <div className="space-y-2">
                  {overview.statusDistribution.map((entry) => (
                    <div
                      key={entry.status}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <span className="text-sm text-gray-700">{formatRequestStatus(entry.status)}</span>
                      <span className="font-semibold text-gray-900">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Waste Type */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-900">By Waste Type</h3>
                <div className="space-y-2">
                  {overview.wasteTypeDistribution.map((entry) => (
                    <div
                      key={entry.wasteType}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <span className="text-sm text-gray-700">{formatWasteType(entry.wasteType)}</span>
                      <span className="font-semibold text-gray-900">{entry.count}</span>
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
