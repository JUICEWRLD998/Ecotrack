import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function AdminRequestDetailsPage() {
  return (
    <AppShell title="Admin Request Details" role="admin">
      <EmptyState
        title="Request details"
        description="Assignment, scheduling, and workflow controls will appear here."
      />
    </AppShell>
  );
}
