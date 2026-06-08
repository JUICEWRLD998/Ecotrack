import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function NewRequestPage() {
  return (
    <AppShell title="Submit Request" role="resident">
      <EmptyState
        title="Submit a waste collection request"
        description="Request details and image upload will be available here."
      />
    </AppShell>
  );
}
