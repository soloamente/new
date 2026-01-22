"use client";

import * as React from "react";

import LoginForm from "@components/login-form";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";

// Array delle immagini disponibili per lo sfondo
const BACKGROUND_IMAGES = [
  "/images/image.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
  "/images/image4.jpg",
] as const;

// Storage key per mantenere l'indice dell'immagine tra i refresh
const STORAGE_KEY = "loginBgIndex";

/**
 * Hook personalizzato per gestire l'immagine di sfondo del login
 * Gestisce il ciclo tra le immagini disponibili usando sessionStorage
 * Include error handling per casi edge (private browsing, storage disabilitato)
 */
function useBackgroundImage(): string {
  const [backgroundImage, setBackgroundImage] = React.useState<string>(
    BACKGROUND_IMAGES[0]
  );
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Marca il componente come montato per evitare hydration mismatch
    setIsMounted(true);

    try {
      // Leggi l'indice corrente da sessionStorage
      const currentIndexStr = sessionStorage.getItem(STORAGE_KEY);
      let currentIndex = currentIndexStr
        ? Number.parseInt(currentIndexStr, 10)
        : 0;

      // Valida l'indice per evitare valori non validi
      if (
        Number.isNaN(currentIndex) ||
        currentIndex < 0 ||
        currentIndex >= BACKGROUND_IMAGES.length
      ) {
        currentIndex = 0;
      }

      // Incrementa l'indice e cicla se necessario
      currentIndex = (currentIndex + 1) % BACKGROUND_IMAGES.length;

      // Salva il nuovo indice in sessionStorage
      sessionStorage.setItem(STORAGE_KEY, currentIndex.toString());

      // Aggiorna lo stato con la nuova immagine
      // currentIndex è garantito essere valido dopo l'operazione modulo
      setBackgroundImage(BACKGROUND_IMAGES[currentIndex] ?? BACKGROUND_IMAGES[0]);
    } catch (error) {
      // Gestisci errori di sessionStorage (es. private browsing, quota exceeded)
      // Fallback alla prima immagine in caso di errore
      console.warn("Failed to access sessionStorage:", error);
      setBackgroundImage(BACKGROUND_IMAGES[0]);
    }
  }, []);

  // Ritorna l'immagine di default durante SSR e prima del mount
  // per evitare hydration mismatch
  return isMounted ? backgroundImage : BACKGROUND_IMAGES[0];
}

export default function LoginPage() {
  const router = useRouter();
  const backgroundImage = useBackgroundImage();

  // Memoizza la callback per evitare re-render inutili
  const handleSwitchToSignUp = React.useCallback(() => {
    router.push("/register");
  }, [router]);

  return (
    <main
      className="flex items-center justify-center md:justify-end gap-2 w-full bg-cover bg-center relative transition-all duration-500"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
      role="main"
      aria-label="Login page"
    >
      {/* Logo positioned at top left */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute top-6 left-6 z-10"
      >
        <Image
          src="/images/logo_positivo.png"
          alt="DataWeb Group - The Document Company"
          width={200}
          height={80}
          className="h-20 w-auto"
          priority
        />
      </motion.div>

      {/* Right panel with login form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card h-[calc(100%-1.25rem)] flex w-full md:w-1/2 flex-col items-center justify-center overflow-hidden rounded-3xl font-medium m-2.5"
      >
        <div className="flex w-full max-w-md flex-col space-y-8 p-8">
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-2 text-center"
          >
            <h1 className="text-4xl font-semibold leading-none">
              Benvenuto
            </h1>
            <p className="text-sm text-muted-foreground font-normal">
              Inserisci le tue credenziali per accedere al tuo account
            </p>
          </motion.header>

          <LoginForm onSwitchToSignUp={handleSwitchToSignUp} />
        </div>
      </motion.div>
    </main>
  );
}
