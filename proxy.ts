import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      // Preserve the original URL for redirect after login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated (optimistically), allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // If there's an error checking the session, redirect to login
    console.error("Proxy auth check error:", error);
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

