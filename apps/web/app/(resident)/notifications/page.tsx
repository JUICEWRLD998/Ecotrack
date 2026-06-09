import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  MarkAllNotificationsButton,
  NotificationReadButton
} from "@/components/notifications/notification-actions";
import { AppShell } from "@/components/layout/app-shell-server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/requests";
import { getNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { notifications, unreadCount } = await getNotifications(session.apiToken);
  const shellRole = session.user.role === "ADMIN" ? "admin" : "resident";
  const readCount = notifications.length - unreadCount;

  return (
    <AppShell title="Notifications" role={shellRole}>
      <div className="space-y-6">
        <Card className="border-border shadow-md">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl">Notifications</CardTitle>
              <CardDescription className="mt-1.5">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </CardDescription>
            </div>
            <MarkAllNotificationsButton apiToken={session.apiToken} disabled={unreadCount === 0} />
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-xl border-2 border-border p-5 transition-all md:flex-row md:items-start md:justify-between",
                      !notification.read && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        <Badge variant={notification.read ? "secondary" : "default"} className="shadow-sm">
                          {notification.read ? "Read" : "Unread"}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{notification.message}</p>
                      <p className="text-xs font-medium text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                    </div>
                    <NotificationReadButton
                      apiToken={session.apiToken}
                      notificationId={notification.id}
                      read={notification.read}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No notifications</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Request updates and scheduling alerts will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
