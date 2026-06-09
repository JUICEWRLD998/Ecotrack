"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

type ProfileFormProps = {
  name: string;
  email: string;
  role: string;
  apiToken: string;
};

type ProfileResponse = {
  user: { id: string; name: string; email: string; role: string };
};

export function ProfileForm({ name, email, role, apiToken }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name }
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await apiClient<ProfileResponse>("/users/me", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${apiToken}` },
          body: JSON.stringify(values)
        });
        setMessage("Profile updated successfully!");
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Profile update failed");
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>Your profile information for request tracking and notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" type="text" autoComplete="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Input type="text" value={role} disabled />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
