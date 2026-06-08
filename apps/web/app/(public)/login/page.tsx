import { AuthShell } from "@/components/layout/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in"
      description="Access your EcoTrack workspace."
      footerHref="/register"
      footerLabel="Create an account"
    />
  );
}
