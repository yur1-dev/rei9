"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, X } from "lucide-react";

// Company Logo Components
const AxiomLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
    <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
  </svg>
);

const BullXLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const PumpFunLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SSELogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z" />
  </svg>
);

const PhotonLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24m-2.83 2.83L3.5 20.5m17-17l-4.24 4.24m-2.83 2.83L3.5 3.5" />
  </svg>
);

const DexScreenerLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-8-2h2v-2h-2v2zm0-4h2V7h-2v6z" />
    <path d="M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm8-8h2v2h-2z" />
  </svg>
);

const NovaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2l2.09 6.26L20 10l-5.91 4.74L16.18 22 12 18.27 7.82 22l2.09-7.26L4 10l5.91-1.74L12 2z" />
  </svg>
);

const GMGNLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
);

interface TradingPlatform {
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  color: string;
  url: (mint: string) => string;
}

const TRADING_PLATFORMS: TradingPlatform[] = [
  {
    name: "Axiom",
    logo: AxiomLogo,
    color: "bg-purple-600 hover:bg-purple-700",
    url: (mint) => `https://axiom.trade/token/${mint}`,
  },
  {
    name: "BullX",
    logo: BullXLogo,
    color: "bg-green-600 hover:bg-green-700",
    url: (mint) =>
      `https://bullx.io/terminal?chainId=1399811149&address=${mint}`,
  },
  {
    name: "Pump.fun",
    logo: PumpFunLogo,
    color: "bg-blue-600 hover:bg-blue-700",
    url: (mint) => `https://pump.fun/${mint}`,
  },
  {
    name: "SSE",
    logo: SSELogo,
    color: "bg-teal-600 hover:bg-teal-700",
    url: (mint) => `https://sse.trade/token/${mint}`,
  },
  {
    name: "Photon",
    logo: PhotonLogo,
    color: "bg-indigo-600 hover:bg-indigo-700",
    url: (mint) => `https://photon-sol.tinyastro.io/en/lp/${mint}`,
  },
  {
    name: "DexScreener",
    logo: DexScreenerLogo,
    color: "bg-gray-600 hover:bg-gray-700",
    url: (mint) => `https://dexscreener.com/solana/${mint}`,
  },
  {
    name: "Nova",
    logo: NovaLogo,
    color: "bg-purple-600 hover:bg-purple-700",
    url: (mint) => `https://nova.trade/token/${mint}`,
  },
  {
    name: "GMGN",
    logo: GMGNLogo,
    color: "bg-lime-600 hover:bg-lime-700",
    url: (mint) => `https://gmgn.ai/sol/token/${mint}`,
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
                className="text-gray-400 hover:text-white transition-colors"
              ></button>
            </div>
            <p className="text-gray-400 text-sm">
              Choose your preferred platform to trade ${symbol}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              AVAILABLE PLATFORMS
            </h3>

            {/* Warning - NO ROUNDED CORNERS */}
            <div className="bg-yellow-900/30 border border-yellow-600/50 p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-sm">💡</span>
                <p className="text-yellow-400 text-sm">
                  You can avoid this popup by setting your preferred trading
                  platform in the config
                </p>
              </div>
            </div>

            {/* Platform Buttons - NO ROUNDED CORNERS */}
            <div className="grid grid-cols-2 gap-3">
              {TRADING_PLATFORMS.map((platform) => {
                const LogoComponent = platform.logo;
                return (
                  <a
                    key={platform.name}
                    href={platform.url(mint)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${platform.color} text-white font-semibold py-3 px-4 text-center transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg`}
                    onClick={() => setShowModal(false)}
                  >
                    <LogoComponent className="w-4 h-4" />
                    {platform.name}
                  </a>
                );
              })}
            </div>

            {/* Warning Footer - NO ROUNDED CORNERS */}
            <div className="bg-green-900/30 border border-blue-600/50 p-3">
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
