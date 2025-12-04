"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import IconCircleXmarkFilled from "@/components/icons/x-icon";
import { Avatar, AvatarFallback } from "./avatar";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { logout, type User, type UserRole } from "@/app/actions/auth-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

// Helper function to get role name from role_id
function getRoleName(roleId: number): UserRole {
  switch (roleId) {
    case 1:
      return "DATAWEB";
    case 2:
      return "AMMINISTRATORE_STUDIO";
    case 3:
      return "OPERATORE";
    default:
      return "OPERATORE";
  }
}

// Helper function to get role display name
function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "DATAWEB":
      return "Super Admin";
    case "AMMINISTRATORE_STUDIO":
      return "Amministratore";
    case "OPERATORE":
      return "Operatore";
    default:
      return "Operatore";
  }
}

export function SettingsDialog({
  open,
  onOpenChange,
  user,
}: SettingsDialogProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Close dialog on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // logout() already redirects, but we ensure the dialog closes
      onOpenChange(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const userRole = user ? getRoleName(user.role_id) : null;
  const roleDisplayName = userRole ? getRoleDisplayName(userRole) : "Utente";

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.2,
              }}
              className="bg-background relative w-full max-w-md rounded-2xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-dialog-title"
            >
              {/* Header */}
              <div className="border-border flex items-center justify-between border-b px-6 py-4">
                <h2
                  id="settings-dialog-title"
                  className="text-lg font-semibold"
                >
                  Impostazioni
                </h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-full p-1 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  aria-label="Chiudi impostazioni"
                >
                  <IconCircleXmarkFilled size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {user ? (
                  <div className="space-y-6">
                    {/* User Info Section */}
                    <div className="flex items-center gap-4">
                      <Avatar className="size-16">
                        <AvatarFallback placeholderSeed={user.name} />
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-medium">{user.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {roleDisplayName}
                        </span>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Email
                        </label>
                        <p className="text-sm">{user.email}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Ruolo
                        </label>
                        <p className="text-sm">{roleDisplayName}</p>
                      </div>

                      {user.studio_id && (
                        <div className="space-y-1">
                          <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Studio ID
                          </label>
                          <p className="text-sm">{user.studio_id}</p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Stato
                        </label>
                        <p className="text-sm capitalize">{user.status}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-border border-t px-6 py-4">
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="destructive"
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                      {isLoggingOut ? (
                        <motion.div
                          key="spinner"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Spinner size="sm" className="text-white" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          Esci
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
