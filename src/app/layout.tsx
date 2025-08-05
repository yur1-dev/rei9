import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import "./globals.css"; // Corrected import path
import { WalletProvider } from "@/components/wallet-provider";

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
  title: "rei9.trade - AI-Powered Alpha for Elite Meme Traders",
  description:
    "Underground Solana trading platform. Raw alpha from the streets. No suits, no BS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} dark`}>
      <body className={inter.className}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
