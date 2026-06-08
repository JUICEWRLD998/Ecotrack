import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function AdminRequestsPage() {
  return (
    <AppShell title="Request Management" role="admin">
      <EmptyState
        title="Request management"
        description="Collection requests, filters, assignments, and status controls will appear here."
      />
    </AppShell>
  );
}
