import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function AdminSchedulesPage() {
  return (
    <AppShell title="Schedule Management" role="admin">
      <EmptyState
        title="Schedule management"
        description="Collection schedules and calendar controls will appear here."
      />
    </AppShell>
  );
}
