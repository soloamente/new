import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";

export default function LoginPage() {
  return (
    <main
      /* LayoutContent wraps pages in a flex column (h-screen); flex-1 fills height.
         Column direction so the child can grow past the viewport and this element scrolls. */
      className="relative flex min-h-0 w-full flex-1 flex-col overflow-y-auto"
      aria-label="Pagina di accesso"
    >
      <SignIn1 />
    </main>
  );
}
