"use client";

import { useState, useTransition } from "react";
import { Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications";
import { Button } from "@/components/ui/button";

type NotificationReadButtonProps = {
  apiToken: string;
  notificationId: string;
  read: boolean;
};

type MarkAllNotificationsButtonProps = {
  apiToken: string;
  disabled: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function NotificationReadButton({ apiToken, notificationId, read }: NotificationReadButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markRead() {
    setError(null);

    startTransition(async () => {
      try {
        await markNotificationRead(apiToken, notificationId);

        router.refresh();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "Could not update notification"));
      }
    });
  }

  if (read) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" className="gap-2" disabled={isPending} onClick={markRead}>
        <Check className="h-4 w-4" />
        {isPending ? "Saving..." : "Mark read"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function MarkAllNotificationsButton({ apiToken, disabled }: MarkAllNotificationsButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markAllRead() {
    setError(null);

    startTransition(async () => {
      try {
        await markAllNotificationsRead(apiToken);

        router.refresh();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "Could not update notifications"));
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="gap-2" disabled={disabled || isPending} onClick={markAllRead}>
        <CheckCheck className="h-4 w-4" />
        {isPending ? "Saving..." : "Mark all read"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
