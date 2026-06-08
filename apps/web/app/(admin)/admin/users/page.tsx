import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function AdminUsersPage() {
  return (
    <AppShell title="User Management" role="admin">
      <EmptyState title="User management" description="Resident and administrator accounts will appear here." />
    </AppShell>
  );
}
