import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import Providers from "@/components/providers";
import Script from "next/script";
import LayoutContent from "@/components/layout-content";

export const metadata: Metadata = {
  title: "Nuova interfaccia",
  description: "Nuova interfaccia",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full overflow-hidden`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )}
      </head>
      <body className="h-full overflow-hidden">
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
