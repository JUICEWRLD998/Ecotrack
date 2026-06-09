import { RegisterForm } from "@/components/forms/register-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Your Account"
      description="Join EcoTrack as a resident and start managing your waste collection requests."
      footerHref="/login"
      footerLabel="Already have an account?"
      role="resident"
    >
      <RegisterForm />
    </AuthShell>
  );
}
