import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/requests";

export type ScheduleCalendarEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
};

type ScheduleCalendarProps = {
  title: string;
  events: ScheduleCalendarEvent[];
  month?: string;
  basePath: string;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthStart(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [yearText, monthText] = month.split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText);

    if (Number.isInteger(year) && Number.isInteger(monthIndex) && monthIndex >= 1 && monthIndex <= 12) {
      return new Date(Date.UTC(year, monthIndex - 1, 1, 12));
    }
  }

  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12));
}

function addMonths(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function eventDateKey(value: string) {
  return value.slice(0, 10);
}

function buildCalendarDays(monthStart: Date) {
  const firstGridDate = new Date(monthStart);
  firstGridDate.setUTCDate(firstGridDate.getUTCDate() - firstGridDate.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setUTCDate(firstGridDate.getUTCDate() + index);
    return date;
  });
}

export function ScheduleCalendar({ title, events, month, basePath }: ScheduleCalendarProps) {
  const monthStart = getMonthStart(month);
  const previousMonth = monthKey(addMonths(monthStart, -1));
  const nextMonth = monthKey(addMonths(monthStart, 1));
  const days = buildCalendarDays(monthStart);
  const currentMonth = monthStart.getUTCMonth();
  const eventsByDate = events.reduce<Record<string, ScheduleCalendarEvent[]>>((accumulator, event) => {
    const key = eventDateKey(event.date);
    accumulator[key] = [...(accumulator[key] ?? []), event];
    return accumulator;
  }, {});

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" aria-label="Previous month">
            <Link href={`${basePath}?month=${previousMonth}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <p className="min-w-36 text-center text-sm font-medium">
            {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(monthStart)}
          </p>
          <Button asChild variant="outline" size="icon" aria-label="Next month">
            <Link href={`${basePath}?month=${nextMonth}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 rounded-t-md border border-b-0 bg-muted/60 text-xs font-medium text-muted-foreground">
          {weekdays.map((weekday) => (
            <div key={weekday} className="p-2 text-center">
              {weekday}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 rounded-b-md border">
          {days.map((day) => {
            const key = dateKey(day);
            const dayEvents = eventsByDate[key] ?? [];
            const isCurrentMonth = day.getUTCMonth() === currentMonth;

            return (
              <div
                key={key}
                className="min-h-28 border-b border-r p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={isCurrentMonth ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
                    {day.getUTCDate()}
                  </span>
                  {dayEvents.length > 0 ? <Badge variant="secondary">{dayEvents.length}</Badge> : null}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      href={event.href}
                      className="block rounded-md bg-primary/10 px-2 py-1 text-xs leading-5 text-primary transition-colors hover:bg-primary/15"
                      title={`${event.title} - ${event.subtitle} - ${formatDate(event.date)}`}
                    >
                      <span className="block truncate font-medium">{event.title}</span>
                      <span className="block truncate text-primary/80">{event.subtitle}</span>
                    </Link>
                  ))}
                  {dayEvents.length > 2 ? (
                    <p className="px-2 text-xs text-muted-foreground">+{dayEvents.length - 2} more</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
