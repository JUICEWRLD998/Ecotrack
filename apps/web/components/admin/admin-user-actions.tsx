"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/lib/schemas";
import { ApiError, apiClient } from "@/lib/api-client";
import type { AdminUser } from "@/lib/admin";
import { formatRole } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminUserActionsProps = {
  apiToken: string;
  user: AdminUser;
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return "User update failed";
}

export function AdminUserActions({ apiToken, user }: AdminUserActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateUser(formData: FormData) {
    setMessage(null);
    setError(null);

    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "");
    const isActive = String(formData.get("isActive") ?? "") === "true";

    startTransition(async () => {
      try {
        await apiClient(`/admin/users/${user.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            name,
            role,
            isActive
          })
        });

        setMessage("Saved");
        router.refresh();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
      }
    });
  }

  return (
    <form action={updateUser} className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_150px_140px_auto] md:items-end">
      <div className="space-y-2">
        <Label htmlFor={`name-${user.id}`}>Name</Label>
        <Input id={`name-${user.id}`} name="name" defaultValue={user.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`role-${user.id}`}>Role</Label>
        <select
          id={`role-${user.id}`}
          name="role"
          defaultValue={user.role}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {formatRole(role)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`isActive-${user.id}`}>Status</Label>
        <select
          id={`isActive-${user.id}`}
          name="isActive"
          defaultValue={String(user.isActive)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <Button type="submit" className="gap-2" disabled={isPending}>
        <Save className="h-4 w-4" />
        {isPending ? "Saving..." : "Save"}
      </Button>

      {message ? <p className="text-sm text-primary md:col-span-4">{message}</p> : null}
      {error ? <p className="text-sm text-destructive md:col-span-4">{error}</p> : null}
    </form>
  );
}
