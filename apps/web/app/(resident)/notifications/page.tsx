import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  MarkAllNotificationsButton,
  NotificationReadButton
} from "@/components/notifications/notification-actions";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/requests";
import { getNotifications } from "@/lib/notifications";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { notifications, unreadCount } = await getNotifications(session.apiToken);
  const shellRole = session.user.role === "ADMIN" ? "admin" : "resident";

  return (
    <AppShell title="Notifications" role={shellRole}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Inbox</CardTitle>
          <MarkAllNotificationsButton apiToken={session.apiToken} disabled={unreadCount === 0} />
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="divide-y rounded-md border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{notification.title}</h2>
                      <Badge variant={notification.read ? "muted" : "secondary"}>
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
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
            <EmptyState title="No notifications" description="Request updates and scheduling alerts will appear here." />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
