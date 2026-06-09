"use client";

import Link from "next/link";
import { Leaf, User, Shield, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/providers/theme-provider";

type AuthShellProps = {
  title: string;
  description: string;
  footerHref: string;
  footerLabel: string;
  children: React.ReactNode;
  role?: "resident" | "admin";
};

export function AuthShell({
  title,
  description,
  footerHref,
  footerLabel,
  children,
  role
}: AuthShellProps) {
  const isAdmin = role === "admin";
  const iconBgColor = isAdmin ? "bg-blue-600" : "bg-green-600";
  const RoleIcon = isAdmin ? Shield : User;
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      {/* Theme toggle — top right corner */}
      <div className="fixed right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor} text-white transition-transform hover:scale-105`}
              >
                <Leaf className="h-6 w-6" />
              </span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EcoTrack
              </span>
            </Link>
          </div>

          {role && (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                isAdmin
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              <RoleIcon className="h-4 w-4" />
              <span>{isAdmin ? "Admin Portal" : "Resident Portal"}</span>
            </div>
          )}

          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {children}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground dark:bg-card">Or</span>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={footerHref}>{footerLabel}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full" size="sm">
            <Link href="/">← Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
