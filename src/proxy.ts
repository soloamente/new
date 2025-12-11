import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api";

/**
 * Proxy function for Next.js 16
 * Handles session checks and redirects for protected routes
 *
 * Note: This is an optimistic redirect approach. Full auth checks
 * should still be performed in each page/route handler.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // Skip auth check for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Skip auth check for API routes (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip auth check for static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  try {
    // Check for access token in cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      // Preserve the original URL for redirect after login
      loginUrl.searchParams.set("redirect", pathname);

      if (process.env.NODE_ENV === "development") {
        console.log(`[Proxy] No token found, redirecting to: ${loginUrl.toString()}`);
      }

      return NextResponse.redirect(loginUrl);
    }

    // Validate token with external API
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // If token is invalid, redirect to login
    if (!response.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      if (process.env.NODE_ENV === "development") {
        console.log(`[Proxy] Token invalid, redirecting to: ${loginUrl.toString()}`);
      }

      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow the request to proceed
    if (process.env.NODE_ENV === "development") {
      console.log(`[Proxy] Path: ${pathname}, Session: valid`);
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error checking the session, redirect to login
    console.error("[Proxy] Auth check error:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
