import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { AuthProvider } from "@/context/auth-context";
import { AuthGuard } from "@/components/auth-guard";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Load Bebas Neue from Google Fonts
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

export const metadata: Metadata = {
  title:
    "rei9.trade - AI-Powered Alpha for Elite Meme Traders - Private Access",
  description:
    "Underground Solana trading platform. Raw alpha from the streets. No suits, no BS. Private members only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} dark`}>
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <WalletProvider>{children}</WalletProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
