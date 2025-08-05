"use client";

import { Button } from "@/components/ui/button";
import { Zap, Send } from "lucide-react"; // Changed FileText to Send
import { motion } from "framer-motion";
import Image from "next/image"; // Import Next.js Image component

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
            src="/bg.png" // Updated src attribute
            alt="REI9: Street Alpha. Solana Domination."
            width={1000}
            height={400}
            className="mx-auto w-full max-w-4xl h-auto object-contain"
            priority // Load this image with high priority as it's above the fold
          />
        </motion.div>
        {/* <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
        >
          Uncover hidden alpha, track elite movements, and dominate the memecoin
          market with AI-powered precision. This is where the real gains are
          made.
        </motion.p> */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {/* TRADE Button - Brighter green with stronger glow */}
          <Button className="bg-green-400 hover:bg-green-500 text-black font-bold px-8 py-3 rounded-sm text-lg shadow-[0_0_30px_rgba(34,197,94,0.6)] cursor-pointer">
            <Zap className="w-5 h-5 mr-2" />
            TRADE
          </Button>
          {/* TELEGRAM Button - Dark background with green border and white text */}
          <Button
            variant="outline"
            className="bg-gray-900 border-2 border-green-500 text-white hover:bg-gray-800 font-bold px-8 py-3 rounded-sm text-lg cursor-pointer"
          >
            <Send className="w-5 h-5 mr-2" />
            TELEGRAM
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
