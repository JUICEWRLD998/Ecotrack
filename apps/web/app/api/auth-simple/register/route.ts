import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/auth-simple";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Call backend API
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3001"}/api/backend/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Registration failed" },
        { status: response.status }
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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
