"use client";

import * as React from "react";

import { login } from "@/app/actions/auth-actions";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import z from "zod";
import { Spinner } from "./spinner";

// Colori della piattaforma (vedi globals.css: --background light, --grad-header, accento sidebar)
const CREAM = "#f7f4ee";

const inputClassName =
  "w-full rounded-2xl border border-white/15 bg-white/[0.08] py-3.5 pl-12 pr-4 text-base short:py-2.5 text-white placeholder:text-white/45 transition-colors duration-200 hover:border-white/25 focus:border-white/50 focus:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f4ee]/40";

const emailSchema = z
  .string()
  .min(1, "L'email è obbligatoria")
  .email("Inserisci un indirizzo email valido");
const passwordSchema = z.string().min(1, "La password è obbligatoria");

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden pt-2 text-left text-sm font-medium text-[#ffb3bb]"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const SignIn1 = () => {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const formData = new FormData();
      // La server action legge il campo "username" e lo invia come email all'API
      formData.append("username", value.email.trim());
      formData.append("password", value.password);

      // Mantiene l'eventuale redirect richiesto dal middleware
      const redirectTo = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      if (redirectTo) {
        formData.append("redirectTo", redirectTo);
      }

      const result = await login(formData);
      if (result?.error) {
        setServerError(result.error);
      }
      // In caso di successo la server action esegue il redirect
    },
    validators: {
      onSubmit: z.object({ email: emailSchema, password: passwordSchema }),
    },
  });

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  });

  return (
    // reducedMotion="user": con prefers-reduced-motion vengono disattivate le traslazioni
    <MotionConfig reducedMotion="user">
      {/* shrink-0 + min-h-full: il contenitore cresce oltre il viewport invece di tagliare
          card e pulsante sopra/sotto (justify-center su altezza fissa li rendeva irraggiungibili) */}
      <div
        className="short:py-6 relative flex min-h-full w-full shrink-0 flex-col items-center justify-center overflow-hidden px-4 py-12"
        style={{ backgroundColor: CREAM }}
      >
        {/* Sfondo panna con aloni navy/blu e un tocco di rosso sfocati dietro la card */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 size-[560px] -translate-x-[70%] -translate-y-[65%] rounded-full bg-[#1f4ea0]/25 blur-[110px]" />
          <div className="absolute top-1/2 left-1/2 size-[480px] -translate-x-[15%] -translate-y-[25%] rounded-full bg-[#0e2a5e]/20 blur-[110px]" />
          <div className="absolute top-1/2 left-1/2 size-[260px] translate-x-[45%] translate-y-[40%] rounded-full bg-[#d33144]/15 blur-[90px]" />
          <div className="absolute inset-0 [background-image:linear-gradient(#0e2a5e_1px,transparent_1px),linear-gradient(90deg,#0e2a5e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,#000_15%,transparent_70%)] [background-size:56px_56px] opacity-[0.05]" />
        </div>

        {/* Card glass navy centrata */}
        <motion.div
          {...enter(0)}
          className="short:rounded-3xl short:py-6 sm:short:py-7 relative z-10 flex w-full max-w-[460px] flex-col items-center overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(145deg,rgba(14,42,94,0.94)_0%,rgba(31,78,160,0.88)_100%)] px-5 py-10 shadow-[0_30px_80px_-20px_rgba(14,42,94,0.55)] backdrop-blur-xl sm:px-11 sm:py-12"
        >
          {/* Filo rosso in alto, richiamo all'accento della sidebar */}
          <span
            aria-hidden
            className="absolute inset-x-12 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#d33144] to-transparent"
          />

          {/* Logo */}
          <div
            className="short:mb-3 short:size-16 short:ring-4 tiny:hidden mb-6 flex size-28 shrink-0 items-center justify-center rounded-full shadow-xl ring-[6px] ring-white/15"
            style={{ backgroundColor: CREAM }}
          >
            <Image
              src="/images/logo-marina.png"
              alt="Marina Militare"
              width={250}
              height={320}
              className="short:h-11 h-20 w-auto object-contain"
              priority
            />
          </div>

          {/* Titolo */}
          <div className="short:mb-5 short:gap-1 tiny:mb-3 mb-9 flex flex-col items-center gap-2 text-center">
            <h1 className="short:text-2xl sm:short:text-[1.75rem] text-2xl leading-tight font-bold text-white sm:text-[2.1rem]">
              Plancia Pratiche
            </h1>
            <p className="tiny:hidden text-base text-white/70">
              Accedi con le tue credenziali
            </p>
          </div>

          {/* Form */}
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="short:gap-3 flex w-full flex-col gap-5"
          >
            <form.Field name="email" validators={{ onChange: emailSchema }}>
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="mb-2 text-left text-sm font-medium text-white/85"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/55"
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="nome@esempio.it"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                      className={inputClassName}
                    />
                  </div>
                  <FieldError message={field.state.meta.errors[0]?.message} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{ onChange: passwordSchema }}
            >
              {(field) => (
                <div className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="mb-2 text-left text-sm font-medium text-white/85"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/55"
                    />
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Inserisci la password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                      className={`${inputClassName} pr-14`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Nascondi password" : "Mostra password"
                      }
                      aria-pressed={showPassword}
                      className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f7f4ee]/40 focus-visible:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                  <FieldError message={field.state.meta.errors[0]?.message} />
                </div>
              )}
            </form.Field>

            <AnimatePresence initial={false}>
              {serverError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="rounded-2xl border border-[#d33144]/50 bg-[#d33144]/20 px-4 py-3 text-center text-sm font-medium text-[#ffd0d5]">
                    {serverError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <form.Subscribe
              selector={(state) => ({
                isSubmitting: state.isSubmitting,
                isEmpty:
                  !state.values.email.trim() || !state.values.password.trim(),
              })}
            >
              {({ isSubmitting, isEmpty }) => (
                <button
                  type="submit"
                  disabled={isSubmitting || isEmpty}
                  aria-busy={isSubmitting}
                  className="short:mt-1 short:h-11 mt-2 flex h-[52px] w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f7f4ee] text-base font-semibold text-[#0e2a5e] shadow-lg transition-all duration-200 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#f7f4ee] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e2a5e] focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="text-[#0e2a5e]" />
                      <span className="sr-only">Accesso in corso</span>
                    </>
                  ) : (
                    "Accedi"
                  )}
                </button>
              )}
            </form.Subscribe>
          </form>
        </motion.div>

        {/* Nota di accesso riservato */}
        <motion.p
          {...enter(0.15)}
          className="short:mt-4 relative z-10 mt-8 flex items-center gap-2 text-center text-sm font-medium text-[#3d5382]"
        >
          <ShieldCheck aria-hidden className="size-4 text-[#d33144]" />
          Accesso riservato al personale autorizzato
        </motion.p>
      </div>
    </MotionConfig>
  );
};

export { SignIn1 };

export default SignIn1;
