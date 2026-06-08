import Link from "next/link";
import { ArrowRight, CalendarDays, Recycle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const featureCards = [
  {
    title: "Resident Requests",
    description: "Submit full-bin reports with waste type, preferred date, address, and image evidence.",
    icon: Recycle
  },
  {
    title: "Collection Scheduling",
    description: "Coordinate upcoming pickups with calendar-backed scheduled collection dates.",
    icon: CalendarDays
  },
  {
    title: "Admin Control",
    description: "Assign, schedule, and track requests through the complete collection workflow.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--accent)),hsl(var(--background))_42%)]">
      <section className="container flex min-h-[68vh] flex-col justify-center gap-10 py-16">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Waste Management Platform</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            EcoTrack
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            A production-ready foundation for residents to request waste collection and for administrators to coordinate assignments, schedules, and request status updates.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">
                Resident Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 pb-16 md:grid-cols-3">
        {featureCards.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-5 w-5 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
