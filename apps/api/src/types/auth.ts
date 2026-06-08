import type { UserRole } from "@ecotrack/shared";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
