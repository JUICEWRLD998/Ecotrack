import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RequestForm } from "@/components/forms/request-form";
import { AppShell } from "@/components/layout/app-shell";

export default async function NewRequestPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell title="Submit Request" role="resident">
      <RequestForm apiToken={session.apiToken} />
    </AppShell>
  );
}
