"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Leaf, Moon, Recycle, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/providers/theme-provider";

const featureCards = [
  {
    title: "Quick Reporting",
    description: "Submit collection requests with photos, locations, and preferred pickup dates in seconds.",
    icon: Recycle
  },
  {
    title: "Smart Scheduling",
    description: "View upcoming collections on an interactive calendar and get notified of schedule changes.",
    icon: CalendarDays
  },
  {
    title: "Admin Control",
    description: "Manage requests, assign teams, track progress, and monitor analytics from one dashboard.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        
        <div className="container relative">
          {/* Header */}
          <header className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                <Leaf className="h-6 w-6" />
              </span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                EcoTrack
              </span>
            </Link>
            
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </header>

          {/* Hero Content */}
          <section className="flex min-h-[600px] flex-col justify-center py-20">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Smarter Waste
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Collection Management
                </span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Connect residents with waste collection teams. Submit requests, track pickups, 
                and manage schedules all in one beautiful platform.
              </p>
              
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                  <Link href="/register">
                    Start as Resident
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login?callbackUrl=/admin">Admin Access</Link>
                </Button>
              </div>

              <div className="pt-8 text-sm text-muted-foreground">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-green-600 hover:underline">
                    Sign in →
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features for residents and administrators
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title} className="border-2 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container py-20 text-center text-white">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-green-50">
            Join residents and administrators using EcoTrack to manage waste collection efficiently.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
              <Link href="/register">Create Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-green-600">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 EcoTrack. Built for efficient waste management.</p>
          <Link href="/" className="hover:text-foreground">
            Documentation
          </Link>
        </div>
      </footer>
    </main>
  );
}
