import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description: string;
  footerHref: string;
  footerLabel: string;
};

export function AuthShell({ title, description, footerHref, footerLabel }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/35 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="mb-3 flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            EcoTrack
          </Link>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href={footerHref}>{footerLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
