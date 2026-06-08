import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema, type UserRole } from "@ecotrack/shared";

type ApiAuthResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  token: string;
};

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000/api";

function isUserRole(role: unknown): role is UserRole {
  return role === "RESIDENT" || role === "ADMIN";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
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
      }
    })
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.apiToken = user.apiToken;
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = typeof token.id === "string" ? token.id : "";
      session.user.role = isUserRole(token.role) ? token.role : "RESIDENT";
      session.apiToken = typeof token.apiToken === "string" ? token.apiToken : "";

      if (token.name) {
        session.user.name = token.name;
      }

      return session;
    }
  }
});
