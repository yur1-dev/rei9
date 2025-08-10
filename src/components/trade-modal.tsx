"use client";
import { useState } from "react";
import type React from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap } from "lucide-react";

// Company Logo Components using PNG images
const AxiomLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/axiom-logo.png"
    alt="Axiom"
    width={16}
    height={16}
    className={className}
  />
);

const BullXLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/bullx-logo.png"
    alt="BullX"
    width={16}
    height={16}
    className={className}
  />
);

const PumpFunLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/pumpfun-logo.png"
    alt="Pump.fun"
    width={16}
    height={16}
    className={className}
  />
);

const SSELogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/sse-logo.png"
    alt="SSE"
    width={16}
    height={16}
    className={className}
  />
);

const PhotonLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/photon-logo.png"
    alt="Photon"
    width={16}
    height={16}
    className={className}
  />
);

const DexScreenerLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/dexscreener-logo.png"
    alt="DexScreener"
    width={16}
    height={16}
    className={className}
  />
);

const NovaLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/nova-logo.png"
    alt="Nova"
    width={16}
    height={16}
    className={className}
  />
);

const GMGNLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/gmgn-logo.png"
    alt="GMGN"
    width={16}
    height={16}
    className={className}
  />
);

interface TradingPlatform {
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  color: string;
  url: (mint: string) => string;
}

const TRADING_PLATFORMS: TradingPlatform[] = [
  {
    name: "DexScreener",
    logo: DexScreenerLogo,
    color: "bg-gray-600 hover:bg-gray-700",
    url: (mint) => `https://dexscreener.com/solana/${mint}`,
  },
  {
    name: "GMGN",
    logo: GMGNLogo,
    color: "bg-lime-600 hover:bg-lime-700",
    url: (mint) => `https://gmgn.ai/sol/token/${mint}`,
  },
  {
    name: "Pump.fun",
    logo: PumpFunLogo,
    color: "bg-blue-600 hover:bg-blue-700",
    url: (mint) => `https://pump.fun/coin/${mint}`,
  },
  {
    name: "Photon",
    logo: PhotonLogo,
    color: "bg-indigo-600 hover:bg-indigo-700",
    url: (mint) => `https://photon-sol.tinyastro.io/en/lp/${mint}`,
  },
  {
    name: "BullX",
    logo: BullXLogo,
    color: "bg-green-600 hover:bg-green-700",
    url: (mint) => `https://bullx.io/terminal?address=${mint}`,
  },
  {
    name: "Axiom",
    logo: AxiomLogo,
    color: "bg-purple-600 hover:bg-purple-700",
    url: (mint) => `https://axiom.trade/${mint}`,
  },
  {
    name: "Nova",
    logo: NovaLogo,
    color: "bg-purple-600 hover:bg-purple-700",
    url: (mint) => `https://nova.trade/token/${mint}`,
  },
  {
    name: "SSE",
    logo: SSELogo,
    color: "bg-teal-600 hover:bg-teal-700",
    url: (mint) => `https://solscan.io/token/${mint}`,
  },
];

interface TradeButtonWithModalProps {
  mint: string;
  symbol: string;
  className?: string;
}

export function TradeButtonWithModal({
  mint,
  symbol,
  className,
}: TradeButtonWithModalProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Trade button clicked for:", symbol, mint);
    setShowModal(true);
  };

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShowModal(false);
  };

  return (
    <>
      <button onClick={handleClick} className={className} type="button">
        <Zap className="w-4 h-4 mr-1" />
        Trade
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="bg-zinc-950 border-gray-700 text-white max-w-lg"
          style={{
            animation: "none",
            transform: "none",
            transition: "none",
            animationDuration: "0s",
            transitionDuration: "0s",
          }}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                Trade Options
              </DialogTitle>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl"
                type="button"
              >
                ×
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Choose your preferred platform to trade ${symbol}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              AVAILABLE PLATFORMS
            </h3>

            {/* Warning */}
            <div className="bg-yellow-900/30 border border-yellow-600/50 p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-sm">💡</span>
                <p className="text-yellow-400 text-sm">
                  You can avoid this popup by setting your preferred trading
                  platform in the config
                </p>
              </div>
            </div>

            {/* Platform Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {TRADING_PLATFORMS.map((platform) => {
                const LogoComponent = platform.logo;
                return (
                  <button
                    key={platform.name}
                    onClick={() => handleLinkClick(platform.url(mint))}
                    className={`${platform.color} text-white font-semibold py-3 px-4 text-center transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg`}
                    type="button"
                  >
                    <LogoComponent className="w-4 h-4" />
                    {platform.name}
                  </button>
                );
              })}
            </div>

            {/* Info Footer */}
            <div className="bg-blue-900/30 border border-blue-600/50 p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 text-sm">💡</span>
                <p className="text-blue-400 text-sm">
                  Links will open in a new tab. Always verify the token address
                  before trading.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
