import type { DefaultSession } from "next-auth";
import type { UserRole } from "@ecotrack/shared";

declare module "next-auth" {
  interface Session {
    apiToken: string;
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    apiToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    apiToken: string;
  }
}
