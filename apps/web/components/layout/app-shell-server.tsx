// Server component - no "use client" directive
import { AppShellClient } from "./app-shell";
import { getSession } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";

type AppShellProps = {
  title: string;
  role: "resident" | "admin";
  children: React.ReactNode;
};

export async function AppShell({ title, role, children }: AppShellProps) {
  const session = await getSession();
  const unreadCount = session?.apiToken
    ? await getUnreadNotificationCount(session.apiToken).catch(() => 0)
    : 0;

  return (
    <AppShellClient
      title={title}
      role={role}
      unreadCount={unreadCount}
      userName={session?.user?.name}
    >
      {children}
    </AppShellClient>
  );
}
