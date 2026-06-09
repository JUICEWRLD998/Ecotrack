import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/auth-simple";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Call backend API
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3001"}/api/backend/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = await response.json();

    // Set session cookie
    await setSession({
      user: data.user,
      apiToken: data.token
    });

    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
