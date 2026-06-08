import Link from "next/link";
import { Leaf, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  { href: "/profile", label: "Profile" }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/schedules", label: "Schedules" },
  { href: "/admin/analytics", label: "Analytics" }
];

export function AppShell({ title, role, children }: AppShellProps) {
  const links = role === "admin" ? adminLinks : residentLinks;

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
          <Badge variant="secondary">{role === "admin" ? "Admin" : "Resident"}</Badge>
        </div>
      </header>

      <div className="container grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg border bg-background p-2">
          <nav className="grid gap-1">
            {links.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="justify-start">
                <Link href={link.href}>{link.label}</Link>
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
