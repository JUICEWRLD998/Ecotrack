import type { UserRole } from "@/lib/schemas";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
