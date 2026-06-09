import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RequestForm } from "@/components/forms/request-form";
import { AppShell } from "@/components/layout/app-shell-server";

export default async function NewRequestPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell title="Submit Request" role="resident">
      <RequestForm apiToken={session.apiToken} />
    </AppShell>
  );
}
