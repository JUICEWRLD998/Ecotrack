import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" role="resident">
      <EmptyState title="Profile" description="Account details and preferences will appear here." />
    </AppShell>
  );
}
