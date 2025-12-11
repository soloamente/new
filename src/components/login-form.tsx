"use client";

import * as React from "react";

import { login } from "@/app/actions/auth-actions";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { Spinner } from "./ui/spinner";
import { useState } from "react";

export default function LoginForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const formData = new FormData();
      formData.append("username", value.username);
      formData.append("password", value.password);

      // Get redirect param if exists
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect");
      if (redirectTo) {
        formData.append("redirectTo", redirectTo);
      }

      const result = await login(formData);

      if (result?.error) {
        setServerError(result.error);
      }
      // If success, the action will redirect
    },
    validators: {
      onSubmit: z.object({
        username: z.string().min(1, "Username è obbligatorio"),
        password: z.string().min(1, "La password è obbligatoria"),
      }),
    },
  });

  return (
    <motion.div
      key="login-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full max-w-sm"
    >
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
            name="username"
            validators={{
              onChange: z.string().min(1, "Username è obbligatorio"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Username"
                  className="bg-background placeholder:text-muted-foreground w-full rounded-2xl px-3.75 py-3.25 leading-none transition-colors focus:outline-none"
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
              onChange: z.string().min(1, "La password è obbligatoria"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Password"
                  className="bg-background placeholder:text-muted-foreground w-full rounded-2xl px-3.75 py-3.25 leading-none transition-colors focus:outline-none"
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

        <AnimatePresence mode="wait">
          {serverError && (
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
                className="text-center text-sm text-red-500"
              >
                {serverError}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <form.Subscribe>
          {(state) => {
            const isUsernameEmpty =
              !state.values.username || state.values.username.trim() === "";
            const isPasswordEmpty =
              !state.values.password || state.values.password.trim() === "";
            const isDisabled =
              state.isSubmitting || isUsernameEmpty || isPasswordEmpty;

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
                        Accedi
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          }}
        </form.Subscribe>
      </form>

      {/* <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Non hai un account? </span>
        <button
          onClick={onSwitchToSignUp}
          className="text-primary h-auto cursor-pointer p-0 underline-offset-2 hover:underline"
        >
          Registrati
        </button>
      </div> */}
    </motion.div>
  );
}
