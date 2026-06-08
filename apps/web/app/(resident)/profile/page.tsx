import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/forms/profile-form";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
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
