"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => logoutAction()}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
