import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function RequestDetailsPage() {
  return (
    <AppShell title="Request Details" role="resident">
      <EmptyState
        title="Request details"
        description="Status history and scheduled collection details will appear here."
      />
    </AppShell>
  );
}
