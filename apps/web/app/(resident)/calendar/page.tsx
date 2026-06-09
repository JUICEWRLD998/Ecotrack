import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ScheduleCalendar } from "@/components/calendar/schedule-calendar";
import { AppShell } from "@/components/layout/app-shell-server";
import { EmptyState } from "@/components/layout/empty-state";
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
      {schedules.length > 0 ? (
        <>
          <ScheduleCalendar title="Scheduled Collections" events={events} month={month} basePath="/calendar" />

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-md border">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{formatWasteType(schedule.request.wasteType)}</p>
                        <Badge variant="secondary">{formatRequestStatus(schedule.request.status)}</Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{schedule.request.address}</p>
                      {schedule.notes ? (
                        <p className="text-sm text-muted-foreground">Notes: {schedule.notes}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(schedule.collectionDate)}</p>
                    <Button asChild variant="outline">
                      <Link href={`/requests/${schedule.request.id}`}>View Request</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState title="No scheduled collections" description="Scheduled collection dates will appear here." />
      )}
    </AppShell>
  );
}
