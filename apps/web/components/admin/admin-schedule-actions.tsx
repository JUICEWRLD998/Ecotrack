"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError, apiClient } from "@/lib/api-client";
import type { AdminCollectionSchedule } from "@/lib/schedules";
import { dateInputToIso, toDateInputValue } from "@/lib/schedules";
import type { AdminWasteRequest } from "@/lib/admin";
import { formatAdminWasteType } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type AdminScheduleCreateFormProps = {
  apiToken: string;
  requests: AdminWasteRequest[];
};

type AdminScheduleActionsProps = {
  apiToken: string;
  schedule: AdminCollectionSchedule;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function AdminScheduleCreateForm({ apiToken, requests }: AdminScheduleCreateFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function createSchedule(formData: FormData) {
    const requestId = String(formData.get("requestId") ?? "");
    const collectionDate = String(formData.get("collectionDate") ?? "");
    const notes = String(formData.get("notes") ?? "").trim();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await apiClient("/admin/schedules", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            requestId,
            collectionDate: dateInputToIso(collectionDate),
            notes: notes || undefined
          })
        });

        setMessage("Schedule created");
        router.refresh();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "Schedule creation failed"));
      }
    });
  }

  return (
    <form action={createSchedule} className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_180px]">
      <div className="space-y-2">
        <Label htmlFor="requestId">Request</Label>
        <select
          id="requestId"
          name="requestId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="" disabled>
            Select a request
          </option>
          {requests.map((request) => (
            <option key={request.id} value={request.id}>
              {formatAdminWasteType(request.wasteType)} - {request.user.name} - {request.address}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="collectionDate">Collection date</Label>
        <input
          id="collectionDate"
          name="collectionDate"
          type="date"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Button type="submit" className="gap-2" disabled={isPending || requests.length === 0}>
          <CalendarPlus className="h-4 w-4" />
          {isPending ? "Scheduling..." : "Create schedule"}
        </Button>
        {message ? <p className="text-sm text-primary">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function AdminScheduleActions({ apiToken, schedule }: AdminScheduleActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  function updateSchedule(formData: FormData) {
    const collectionDate = String(formData.get("collectionDate") ?? "");
    const notes = String(formData.get("notes") ?? "").trim();
    setMessage(null);
    setError(null);

    startUpdateTransition(async () => {
      try {
        await apiClient(`/admin/schedules/${schedule.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            collectionDate: dateInputToIso(collectionDate),
            notes: notes || null
          })
        });

        setMessage("Schedule updated");
        router.refresh();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "Schedule update failed"));
      }
    });
  }

  function deleteSchedule() {
    if (!window.confirm("Delete this collection schedule?")) {
      return;
    }

    setMessage(null);
    setError(null);

    startDeleteTransition(async () => {
      try {
        await apiClient(`/admin/schedules/${schedule.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        });

        router.refresh();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "Schedule deletion failed"));
      }
    });
  }

  return (
    <form action={updateSchedule} className="grid gap-3 md:grid-cols-[180px_minmax(180px,1fr)_auto_auto] md:items-end">
      <div className="space-y-2">
        <Label htmlFor={`collectionDate-${schedule.id}`}>Collection date</Label>
        <input
          id={`collectionDate-${schedule.id}`}
          name="collectionDate"
          type="date"
          defaultValue={toDateInputValue(schedule.collectionDate)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`notes-${schedule.id}`}>Notes</Label>
        <input
          id={`notes-${schedule.id}`}
          name="notes"
          type="text"
          defaultValue={schedule.notes ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit" variant="secondary" className="gap-2" disabled={isUpdatePending}>
        <Save className="h-4 w-4" />
        {isUpdatePending ? "Saving..." : "Save"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        className="gap-2"
        disabled={isDeletePending}
        onClick={deleteSchedule}
      >
        <Trash2 className="h-4 w-4" />
        {isDeletePending ? "Deleting..." : "Delete"}
      </Button>

      {message ? <p className="text-sm text-primary md:col-span-4">{message}</p> : null}
      {error ? <p className="text-sm text-destructive md:col-span-4">{error}</p> : null}
    </form>
  );
}
