import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

/**
 * Better Auth client configuration
 *
 * The baseURL is optional when using the same domain, but it's recommended
 * to set it explicitly for better compatibility with proxies and redirects.
 */
function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return (
    process.env.NEXT_PUBLIC_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`
  );
}

export const authClient = createAuthClient({
  /** The base URL of the server - uses proxy-aware detection */
  baseURL: getBaseUrl(),
  plugins: [usernameClient()],
});
