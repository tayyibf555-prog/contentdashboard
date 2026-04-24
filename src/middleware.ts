import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight auth gate. We used to hit Supabase Auth on every page nav
 * (supabase.auth.getUser()) — that's a ~200ms round-trip to the Supabase
 * Auth server, which added real latency to every sidebar click.
 *
 * Switched to a cookie-presence check: the Supabase SSR cookies (names
 * start with `sb-`) are set when the user logs in and cleared when they
 * log out. For an internal dashboard this is enough — server components
 * still hit supabase via the server client for data access, which
 * independently validates auth for every DB query.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No-op for login and API routes — they don't need a gate here
  if (pathname.startsWith("/login") || pathname.startsWith("/api/")) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Any cookie named `sb-...auth-token` → user is logged in
  const hasAuthCookie = request.cookies.getAll().some((c) => /^sb-.*-auth-token/.test(c.name));

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/).*)"],
};
