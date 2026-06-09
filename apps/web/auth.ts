import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema, type UserRole } from "@/lib/schemas";

type ApiAuthResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  token: string;
};

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }
  
  if (process.env.NEXTAUTH_URL) {
    return `${process.env.NEXTAUTH_URL}/api/backend`;
  }
  
  return "http://localhost:3000/api/backend";
}

function isUserRole(role: unknown): role is UserRole {
  return role === "RESIDENT" || role === "ADMIN";
}

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt" as const
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        try {
          const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedCredentials.data)
          });

          if (!response.ok) {
            return null;
          }

          const payload = (await response.json()) as ApiAuthResponse;
          return {
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
            role: payload.user.role,
            apiToken: payload.token
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.apiToken = user.apiToken;
      }
      return token;
    },
    session({ session, token }: any) {
      session.user.id = typeof token.id === "string" ? token.id : "";
      session.user.role = isUserRole(token.role) ? token.role : "RESIDENT";
      session.apiToken = typeof token.apiToken === "string" ? token.apiToken : "";
      if (token.name) {
        session.user.name = token.name;
      }
      return session;
    }
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

