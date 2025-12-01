"use client";

import { authClient } from "@lib/auth-client";

import { useForm } from "@tanstack/react-form";

import z from "zod";

import { motion, AnimatePresence } from "motion/react";

import { Button } from "./ui/button";

import { Spinner } from "./ui/spinner";

import { useRouter } from "next/navigation";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      username: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          username: value.username,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (error) => {
            // Error handling can be added here if needed
            console.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
        email: z.string().email("Indirizzo email non valido"),
        password: z
          .string()
          .min(8, "La password deve essere di almeno 8 caratteri"),
        username: z
          .string()
          .min(3, "Lo username deve essere di almeno 3 caratteri")
          .max(30, "Lo username deve essere al massimo di 30 caratteri")
          .regex(
            /^[a-zA-Z0-9_.]+$/,
            "Lo username può contenere solo lettere, numeri, underscore e punti",
          ),
      }),
    },
  });

  return (
    <motion.div
      key="register-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full max-w-sm"
    >
      {/* <div className="mb-10 flex flex-col items-center justify-center">
        <h1 className="text-center text-3xl font-bold">Create Account</h1>
        <h2 className="text-center text-sm text-muted-foreground">
          Create your account to get started
        </h2> 
      </div> */}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-3"
      >
        <div>
          <form.Field
            name="name"
            validators={{
              onChange: z
                .string()
                .min(1, "Il nome è obbligatorio")
                .min(2, "Il nome deve essere di almeno 2 caratteri"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground w-full rounded-2xl px-3.75 py-3.25 leading-none font-medium transition-colors focus:outline-none"
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Nome"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: "transform" }}
                />
                <AnimatePresence mode="wait">
                  {field.state.meta.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm text-red-500"
                      >
                        {field.state.meta.errors[0]?.message}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="username"
            validators={{
              onChange: z
                .string()
                .min(1, "Lo username è obbligatorio")
                .min(3, "Lo username deve essere di almeno 3 caratteri")
                .max(30, "Lo username deve essere al massimo di 30 caratteri")
                .regex(
                  /^[a-zA-Z0-9_.]+$/,
                  "Lo username può contenere solo lettere, numeri, underscore e punti",
                ),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground w-full rounded-2xl px-3.75 py-3.25 leading-none font-medium transition-colors focus:outline-none"
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: "transform" }}
                />
                <AnimatePresence mode="wait">
                  {field.state.meta.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm text-red-500"
                      >
                        {field.state.meta.errors[0]?.message}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="email"
            validators={{
              onChange: z
                .string()
                .min(1, "L'email è obbligatoria")
                .email("Indirizzo email non valido"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground w-full rounded-2xl px-3.75 py-3.25 leading-none font-medium transition-colors focus:outline-none"
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: "transform" }}
                />
                <AnimatePresence mode="wait">
                  {field.state.meta.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm text-red-500"
                      >
                        {field.state.meta.errors[0]?.message}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="password"
            validators={{
              onChange: z
                .string()
                .min(1, "La password è obbligatoria")
                .min(8, "La password deve essere di almeno 8 caratteri"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground w-full rounded-2xl px-3.75 py-3.25 leading-none font-medium transition-colors focus:outline-none"
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="Password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: "transform" }}
                />
                <AnimatePresence mode="wait">
                  {field.state.meta.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm text-red-500"
                      >
                        {field.state.meta.errors[0]?.message}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => {
            const isNameEmpty =
              !state.values.name || state.values.name.trim() === "";
            const isUsernameEmpty =
              !state.values.username || state.values.username.trim() === "";
            const isEmailEmpty =
              !state.values.email || state.values.email.trim() === "";
            const isPasswordEmpty =
              !state.values.password || state.values.password.trim() === "";
            const isDisabled =
              state.isSubmitting ||
              isNameEmpty ||
              isUsernameEmpty ||
              isEmailEmpty ||
              isPasswordEmpty;

            return (
              <motion.button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center rounded-2xl px-4 py-2.75 font-medium transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.01 } : undefined}
                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.2 }}
                style={{ willChange: "transform" }}
              >
                <div className="flex h-5 items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {state.isSubmitting ? (
                      <motion.div
                        key="spinner"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                      >
                        <Spinner
                          size="sm"
                          className="text-primary-foreground"
                        />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="leading-none"
                      >
                        Registrati
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          }}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Hai già un account? </span>
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-primary h-auto cursor-pointer p-0 underline-offset-4 hover:underline"
        >
          Accedi
        </Button>
      </div>
    </motion.div>
  );
}
