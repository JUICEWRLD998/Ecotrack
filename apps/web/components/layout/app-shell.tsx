import Link from "next/link";
import { Bell, Leaf, LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { getUnreadNotificationCount } from "@/lib/notifications";

type AppShellProps = {
  title: string;
  role: "resident" | "admin";
  children: React.ReactNode;
};

const residentLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/requests/new", label: "Submit Request" },
  { href: "/requests", label: "My Requests" },
  { href: "/calendar", label: "Calendar" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/schedules", label: "Schedules" },
  { href: "/notifications", label: "Notifications" },
  { href: "/admin/analytics", label: "Analytics" }
];

export async function AppShell({ title, role, children }: AppShellProps) {
  const links = role === "admin" ? adminLinks : residentLinks;
  const session = await auth();
  const unreadCount = session?.apiToken
    ? await getUnreadNotificationCount(session.apiToken).catch(() => 0)
    : 0;

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            EcoTrack
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="icon" aria-label="Notifications" className="relative">
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Badge variant="secondary">{role === "admin" ? "Admin" : "Resident"}</Badge>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg border bg-background p-2">
          <nav className="grid gap-1">
            {links.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="justify-start">
                <Link href={link.href} className="gap-2">
                  <span>{link.label}</span>
                  {link.href === "/notifications" && unreadCount > 0 ? (
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  ) : null}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
