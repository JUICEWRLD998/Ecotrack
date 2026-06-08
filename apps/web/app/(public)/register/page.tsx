import { RegisterForm } from "@/components/forms/register-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create account"
      description="Create your resident account."
      footerHref="/login"
      footerLabel="Already have an account?"
    >
      <RegisterForm />
    </AuthShell>
  );
}
