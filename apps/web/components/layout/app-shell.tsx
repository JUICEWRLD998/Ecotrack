"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  Leaf, 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  User, 
  Menu, 
  X,
  Plus,
  Users,
  BarChart3,
  ClipboardList,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

export type AppShellClientProps = {
  title: string;
  role: "resident" | "admin";
  children: React.ReactNode;
  unreadCount?: number;
  userName?: string;
};

const residentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests/new", label: "Submit Request", icon: Plus, highlight: true },
  { href: "/requests", label: "My Requests", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/schedules", label: "Schedules", icon: Calendar },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell }
];

export function AppShellClient({ title, role, children, unreadCount = 0, userName }: AppShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const links = role === "admin" ? adminLinks : residentLinks;

  const handleSignOut = async () => {
    await logoutAction();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <Link href="/" className="flex items-center gap-3 font-bold text-foreground transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">EcoTrack</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role badge */}
        <div className="shrink-0 border-b border-border px-6 py-4">
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className={cn(
              "w-full justify-center py-2 text-xs font-semibold",
              role === "admin" 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700" 
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
            )}
          >
            {role === "admin" ? "Admin Portal" : "Resident Portal"}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            const Icon = link.icon;
            const showBadge = link.href === "/notifications" && unreadCount > 0;
            const isHighlight = 'highlight' in link && link.highlight;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive && isHighlight
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{link.label}</span>
                {showBadge && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs font-bold shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section - User & Sign Out */}
        <div className="shrink-0 border-t border-border p-4 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-md">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{userName || "User"}</p>
              <p className="text-xs text-muted-foreground">{role === "admin" ? "Administrator" : "Resident"}</p>
            </div>
          </div>
          
          {/* Sign out button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-12 w-12"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-7 w-7" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-11 w-11"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6" />
              )}
            </Button>
            
            {/* Mobile notifications */}
            <Link href="/notifications" className="lg:hidden">
              <Button variant="ghost" size="icon" className="relative rounded-full h-11 w-11">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-md">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
