import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@db/index"; // your drizzle instance
import { username } from "better-auth/plugins";
import {
  user,
  account,
  session,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
} from "@db/auth-schema";

/**
 * Get the base URL for Better Auth
 * This ensures proper redirect handling with Next.js proxy
 */
function getBaseUrl() {
  // Check for explicit environment variable first
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  // Fallback to NEXT_PUBLIC_URL or default
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  // Default to localhost for development
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;
}

export const auth = betterAuth({
  // Base URL for Better Auth - helps with redirects and proxy handling
  baseURL: getBaseUrl(),

  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
      userRelations: userRelations,
      sessionRelations: sessionRelations,
      accountRelations: accountRelations,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [username()],
});
