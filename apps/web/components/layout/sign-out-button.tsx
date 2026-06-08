"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  );
}
