import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const tokenKey = "asset_repo_token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(tokenKey)?.value;
  const { pathname, search } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/assets");

  if (token && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (!token && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    const nextPath = `${pathname}${search}`;
    loginUrl.pathname = "/auth/login";
    loginUrl.search = `?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*", "/projects/:path*", "/assets/:path*"],
};
