import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getSession } from "@/lib/auth";
import { ScheduleCalendar } from "@/components/calendar/schedule-calendar";
import { AppShell } from "@/components/layout/app-shell-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatRequestStatus, formatWasteType } from "@/lib/requests";
import { getMySchedules } from "@/lib/schedules";

type ResidentCalendarPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function ResidentCalendarPage({ searchParams }: ResidentCalendarPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { month } = await searchParams;
  const schedules = await getMySchedules(session.apiToken);
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    date: schedule.collectionDate,
    title: formatWasteType(schedule.request.wasteType),
    subtitle: schedule.request.address,
    href: `/requests/${schedule.request.id}`,
    badge: formatRequestStatus(schedule.request.status)
  }));

  return (
    <AppShell title="Collection Calendar" role="resident">
      <div className="space-y-6">
        {schedules.length > 0 ? (
          <>
            <ScheduleCalendar title="Scheduled Collections" events={events} month={month} basePath="/calendar" />

            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Upcoming Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold text-foreground">{formatWasteType(schedule.request.wasteType)}</p>
                          <Badge
                            variant={
                              schedule.request.status === "COLLECTED"
                                ? "default"
                                : schedule.request.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                            className="shadow-sm"
                          >
                            {formatRequestStatus(schedule.request.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{schedule.request.address}</p>
                        {schedule.notes ? (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Notes:</span> {schedule.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">{formatDate(schedule.collectionDate)}</p>
                        <Button asChild variant="outline" className="shadow-sm">
                          <Link href={`/requests/${schedule.request.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border shadow-md">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <CalendarDays className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">No scheduled collections</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Scheduled collection dates will appear here once your requests are approved and scheduled.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
