"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { Zap } from "lucide-react"; // Import icons

const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export function HeroSection() {
  return (
    <div className="relative min-h-[calc(60vh)] flex items-center justify-center text-center py-12 px-4">
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <Image
            src="/bg.png"
            alt="REI9: Street Alpha. Solana Domination."
            width={1000}
            height={400}
            className="mx-auto w-full max-w-4xl h-auto object-contain"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {/* TRADE Button - Brighter green with stronger glow and lightning icon */}
          <Button className="bg-green-400 border-2 hover:bg-green-500 text-black font-bold px-8 py-5 text-lg shadow-[0_0_30px_rgba(34,197,94,0.6)] cursor-pointer flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Trade
          </Button>

          {/* X FOLLOW Button - Dark background with green border and white text */}
          <Button
            variant="outline"
            className="bg-gray-900 border-2 border-green-500 text-white hover:bg-gray-800 font-bold px-8 py-5 text-lg cursor-pointer flex items-center gap-2"
          >
            <XLogo className="w-5 h-5" /> Follow
          </Button>

          {/* TELEGRAM Button - Optional third button */}
          <Button className="bg-blue-500 border-2 hover:bg-blue-600 text-white font-bold px-8 py-5 text-lg cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <TelegramLogo className="w-5 h-5" />
            Telegram
          </Button>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src="/bg-outline.png"
          alt="Background Outline"
          layout="fill"
          objectFit="cover"
          className="pointer-events-none"
        />
      </div>
    </div>
  );
}
