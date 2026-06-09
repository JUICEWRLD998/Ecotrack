"use client";

import { useActionState } from "react";
import { registerAdminAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";

export function AdminRegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAdminAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inviteCode" className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" />
          Admin Invite Code
        </Label>
        <Input
          id="inviteCode"
          name="inviteCode"
          type="password"
          placeholder="Enter the admin invite code"
          required
        />
        <p className="text-xs text-muted-foreground">
          Contact your system administrator for the invite code.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
        {isPending ? "Creating admin account..." : "Create Admin Account"}
      </Button>
    </form>
  );
}
