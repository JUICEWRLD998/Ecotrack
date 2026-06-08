"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, RefreshCw, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES, type RequestStatus } from "@ecotrack/shared";
import { ApiError, apiClient } from "@/lib/api-client";
import type { AdminUser } from "@/lib/admin";
import { dateInputToIso } from "@/lib/schedules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type AdminRequestActionsProps = {
  apiToken: string;
  requestId: string;
  currentStatus: RequestStatus;
  assignedToId: string | null;
  admins: AdminUser[];
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function AdminRequestActions({
  apiToken,
  requestId,
  currentStatus,
  assignedToId,
  admins
}: AdminRequestActionsProps) {
  const router = useRouter();
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAssignPending, startAssignTransition] = useTransition();
  const [isSchedulePending, startScheduleTransition] = useTransition();
  const [isStatusPending, startStatusTransition] = useTransition();

  function assignRequest(formData: FormData) {
    const nextAssigneeId = String(formData.get("assignedToId") ?? "");
    setMessage(null);
    setAssignmentError(null);

    startAssignTransition(async () => {
      try {
        await apiClient(`/admin/requests/${requestId}/assign`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            assignedToId: nextAssigneeId
          })
        });

        setMessage("Assignment saved");
        router.refresh();
      } catch (error) {
        setAssignmentError(getErrorMessage(error, "Assignment failed"));
      }
    });
  }

  function createSchedule(formData: FormData) {
    const collectionDate = String(formData.get("collectionDate") ?? "");
    const notes = String(formData.get("notes") ?? "").trim();
    setMessage(null);
    setScheduleError(null);

    startScheduleTransition(async () => {
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

        setMessage("Collection scheduled");
        router.refresh();
      } catch (error) {
        setScheduleError(getErrorMessage(error, "Scheduling failed"));
      }
    });
  }

  function updateStatus(formData: FormData) {
    const status = String(formData.get("status") ?? "");
    const note = String(formData.get("note") ?? "").trim();
    setMessage(null);
    setStatusError(null);

    startStatusTransition(async () => {
      try {
        await apiClient(`/admin/requests/${requestId}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            status,
            note: note || undefined
          })
        });

        setMessage("Status updated");
        router.refresh();
      } catch (error) {
        setStatusError(getErrorMessage(error, "Status update failed"));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={assignRequest} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="assignedToId">Assigned admin</Label>
            <select
              id="assignedToId"
              name="assignedToId"
              defaultValue={assignedToId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="" disabled>
                Select an admin
              </option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
          {assignmentError ? <p className="text-sm text-destructive">{assignmentError}</p> : null}
          <Button type="submit" className="gap-2" disabled={isAssignPending || admins.length === 0}>
            <UserCheck className="h-4 w-4" />
            {isAssignPending ? "Assigning..." : "Save assignment"}
          </Button>
        </form>

        <form action={createSchedule} className="space-y-3 border-t pt-5">
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
          <div className="space-y-2">
            <Label htmlFor="scheduleNotes">Schedule notes</Label>
            <textarea
              id="scheduleNotes"
              name="notes"
              rows={3}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {scheduleError ? <p className="text-sm text-destructive">{scheduleError}</p> : null}
          <Button type="submit" variant="secondary" className="gap-2" disabled={isSchedulePending}>
            <CalendarPlus className="h-4 w-4" />
            {isSchedulePending ? "Scheduling..." : "Schedule collection"}
          </Button>
        </form>

        <form action={updateStatus} className="space-y-3 border-t pt-5">
          <div className="space-y-2">
            <Label htmlFor="status">Request status</Label>
            <select
              id="status"
              name="status"
              defaultValue={currentStatus}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {REQUEST_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Status note</Label>
            <textarea
              id="note"
              name="note"
              rows={4}
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {statusError ? <p className="text-sm text-destructive">{statusError}</p> : null}
          <Button type="submit" variant="secondary" className="gap-2" disabled={isStatusPending}>
            <RefreshCw className="h-4 w-4" />
            {isStatusPending ? "Updating..." : "Update status"}
          </Button>
        </form>

        {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
