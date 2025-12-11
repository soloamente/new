"use client";

import * as React from "react";

import LoginForm from "@components/login-form";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

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
