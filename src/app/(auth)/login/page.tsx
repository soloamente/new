"use client";

import * as React from "react";

import { authClient } from "@lib/auth-client";
import LoginForm from "@components/login-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@components/loader";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      // Check for redirect parameter from proxy
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") ?? "/dashboard";
      router.push(redirectTo);
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      <div className="flex w-full max-w-md flex-col space-y-6 p-5">
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-4xl leading-none font-semibold">Accedi</h1>
        </header>

        <LoginForm onSwitchToSignUp={() => router.push("/register")} />
      </div>
    </main>
  );
}
