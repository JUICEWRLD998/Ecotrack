import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, Clock, CheckCircle, Calendar as CalendarIcon, ArrowRight, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell-server";
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
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Simplified: Fetch requests with basic error handling
  let requests = [];
  
  try {
    requests = await getMyRequests(session.apiToken);
  } catch (err) {
    console.error("Dashboard error:", err);
    // Return empty array, let UI handle empty state
    requests = [];
  }

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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {session.user.name?.split(" ")[0] || "User"}!
          </h2>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your waste collection</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-border shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-3xl font-bold text-foreground">{requests.length}</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    All time
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20">
                  <Package className="h-7 w-7 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
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
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">Being processed</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 dark:bg-purple-500/20">
                  <CalendarIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
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
                  <p className="text-3xl font-bold text-foreground">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Successfully done</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20">
                  <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Card */}
        <Card className="border-none bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 shadow-xl dark:from-emerald-700 dark:via-emerald-700 dark:to-emerald-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white sm:text-2xl">Need waste collection?</h3>
                <p className="text-sm text-emerald-50 sm:text-base">
                  Submit a new request and we&apos;ll schedule your pickup within 24 hours
                </p>
                {nextCollection && (
                  <div className="flex items-center gap-2 text-sm text-emerald-100">
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
        <Card className="border-border shadow-lg">
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
                    className="group flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
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
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(getRequestCollectionDate(request))}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No requests yet</h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Start by submitting your first waste collection request. We&apos;ll take care of the rest!
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
