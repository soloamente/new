import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";

export default function LoginPage() {
  return (
    <main
      /* LayoutContent wraps pages in a flex column (h-screen); flex-1 fills height. */
      className="relative flex min-h-0 w-full flex-1 overflow-y-auto"
      aria-label="Pagina di accesso"
    >
      <SignIn1 />
    </main>
  );
}
