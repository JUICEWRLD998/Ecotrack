import type { UserRole } from "@ecotrack/shared";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
