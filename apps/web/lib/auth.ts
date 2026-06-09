import { cookies } from "next/headers";
import { type UserRole } from "@/lib/schemas";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Session = {
  user: SessionUser;
  apiToken: string;
};

const SESSION_COOKIE = "ecotrack_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get(SESSION_COOKIE);

  if (!sessionData?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionData.value) as Session;
  } catch {
    return null;
  }
}

export async function createSession(session: Session) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/"
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
