import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, Clock, CheckCircle, Calendar as CalendarIcon, ArrowRight, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate,
  formatRequestStatus,
  formatWasteType,
  getNextCollectionDate,
  getRequestCollectionDate,
  getMyRequests
} from "@/lib/requests";

export default async function ResidentDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const requests = await getMyRequests(session.apiToken);
  const recentRequests = requests.slice(0, 5);
  const pendingCount = requests.filter((request) => request.status === "PENDING").length;
  const inProgressCount = requests.filter((request) => 
    request.status === "ASSIGNED" || request.status === "SCHEDULED" || request.status === "IN_PROGRESS"
  ).length;
  const completedCount = requests.filter((request) => request.status === "COLLECTED").length;
  const nextCollection = getNextCollectionDate(requests);

  return (
    <AppShell title="Dashboard" role="resident">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {session.user.name?.split(" ")[0] || "User"}!
          </h2>
          <p className="text-gray-600">Here's what's happening with your waste collection</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-none shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    All time
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Package className="h-7 w-7 text-blue-600" />
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
                  <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                  <p className="text-xs text-gray-500">Awaiting review</p>
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
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{inProgressCount}</p>
                  <p className="text-xs text-gray-500">Being processed</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
                  <CalendarIcon className="h-7 w-7 text-purple-600" />
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
                  <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
                  <p className="text-xs text-gray-500">Successfully done</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Card */}
        <Card className="border-none bg-gradient-to-br from-green-600 via-green-600 to-green-700 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white sm:text-2xl">Need waste collection?</h3>
                <p className="text-sm text-green-50 sm:text-base">
                  Submit a new request and we'll schedule your pickup within 24 hours
                </p>
                {nextCollection && (
                  <div className="flex items-center gap-2 text-sm text-green-100">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Next scheduled: {formatDate(nextCollection)}</span>
                  </div>
                )}
              </div>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full gap-2 font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:w-auto"
              >
                <Link href="/requests/new">
                  <Plus className="h-5 w-5" />
                  Submit Request
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Recent Requests</CardTitle>
                <CardDescription className="mt-1">
                  Track your latest waste collection requests
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="gap-2 shadow-sm">
                <Link href="/requests">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRequests.length > 0 ? (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="group flex flex-col gap-4 rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4 transition-all hover:border-green-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200">
                        <Package className="h-6 w-6 text-green-700" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
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
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(getRequestCollectionDate(request))}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600 sm:block" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No requests yet</h3>
                <p className="mb-6 max-w-sm text-sm text-gray-600">
                  Start by submitting your first waste collection request. We'll take care of the rest!
                </p>
                <Button asChild size="lg" className="gap-2 shadow-md">
                  <Link href="/requests/new">
                    <Plus className="h-5 w-5" />
                    Submit Your First Request
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
