import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth-actions";

/**
 * Home page - redirects users to appropriate destination
 * Authenticated users → dashboard
 * Unauthenticated users → login
 */
export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Redirect unauthenticated users to login
  redirect("/login");
}
