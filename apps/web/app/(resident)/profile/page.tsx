import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "@/components/forms/profile-form";
import { AppShell } from "@/components/layout/app-shell-server";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell title="Profile" role="resident">
      <ProfileForm
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
        role={session.user.role}
        apiToken={session.apiToken}
      />
    </AppShell>
  );
}
