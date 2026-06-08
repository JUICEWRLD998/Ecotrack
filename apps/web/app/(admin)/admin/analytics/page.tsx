import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/layout/empty-state";

export default function AdminAnalyticsPage() {
  return (
    <AppShell title="Analytics Dashboard" role="admin">
      <EmptyState
        title="Analytics"
        description="Request, user, and collection performance metrics will appear here."
      />
    </AppShell>
  );
}
