import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth-actions";

/**
 * Home page - redirects users to appropriate destination
 * Operators (role_id === 3) → /mie-pratiche
 * Other authenticated users → dashboard
 * Unauthenticated users → login
 */
export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser();

  // Redirect authenticated users based on their role
  if (user) {
    if (user.role_id === 1) {
      redirect("/dashboard");
    }
    redirect("/pratiche");
  }

  // Redirect unauthenticated users to login
  redirect("/login");
}
