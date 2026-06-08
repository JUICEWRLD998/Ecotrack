import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function MyRequestsPage() {
  return (
    <AppShell title="My Requests" role="resident">
      <EmptyState
        title="No requests yet"
        description="Submitted collection requests will appear here."
      />
    </AppShell>
  );
}
