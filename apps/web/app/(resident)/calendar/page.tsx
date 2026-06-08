import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function ResidentCalendarPage() {
  return (
    <AppShell title="Collection Calendar" role="resident">
      <EmptyState
        title="Collection calendar"
        description="Scheduled collection dates will appear here."
      />
    </AppShell>
  );
}
