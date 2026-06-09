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
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Account Details</CardTitle>
        <CardDescription>Manage your profile information and account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-base font-semibold">Full Name</Label>
            <Input 
              id="profile-name" 
              type="text" 
              autoComplete="name" 
              className="h-11 border-2" 
              placeholder="Enter your full name"
              {...form.register("name")} 
            />
            {form.formState.errors.name && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-semibold">Email Address</Label>
            <Input 
              type="email" 
              value={email} 
              disabled 
              className="h-11 border-2 bg-muted cursor-not-allowed" 
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-semibold">Account Role</Label>
            <Input 
              type="text" 
              value={role} 
              disabled 
              className="h-11 border-2 bg-muted cursor-not-allowed" 
            />
            <p className="text-xs text-muted-foreground">Role is assigned by administrators</p>
          </div>
          
          {message && (
            <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 p-4">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}
          
          <Button type="submit" className="h-11 px-8 font-semibold shadow-md" disabled={isPending} size="lg">
            {isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
