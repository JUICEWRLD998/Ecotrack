import { AdminRegisterForm } from "@/components/forms/admin-register-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function AdminRegisterPage() {
  return (
    <AuthShell
      title="Create Admin Account"
      description="Set up a new administrator account. An invite code is required."
      footerHref="/login?callbackUrl=/admin"
      footerLabel="Already have an account? Sign in"
      role="admin"
    >
      <AdminRegisterForm />
    </AuthShell>
  );
}
