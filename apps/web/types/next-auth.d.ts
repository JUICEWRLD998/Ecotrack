import type { UserRole } from "@/lib/schemas";
import type { DefaultSession } from "next-auth";

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
