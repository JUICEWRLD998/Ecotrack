import { NextResponse } from "next/server";
import { auth } from "./auth";

const residentRoutes = ["/dashboard", "/requests", "/profile", "/calendar"];
const authRoutes = ["/login", "/register"];

function isResidentRoute(pathname: string) {
  return residentRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isAuthenticated = Boolean(session?.user);
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedResidentRoute = isResidentRoute(pathname);

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = session?.user.role === "ADMIN" ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if ((isAdminRoute || isProtectedResidentRoute) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtectedResidentRoute && session?.user.role === "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
};
