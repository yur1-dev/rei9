"use client";

import { useMemo, useState, useEffect } from "react";
import { useRealtimeTokens } from "@/app/hooks/use-realtime-tokens";
import {
  TokenProgressionSystem,
  TrackedToken,
} from "@/lib/token-progression-system";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Zap,
  Dice6,
  Wifi,
  WifiOff,
  Crown,
  Rocket,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  X,
  Globe,
  Star,
  Users,
  Copy,
  CheckCircle,
} from "lucide-react";

interface TradingPlatform {
  name: string;
  icon: string;
  color: string;
  url: (mint: string) => string;
}

const TRADING_PLATFORMS: TradingPlatform[] = [
  {
    name: "Axiom",
    icon: "▲",
    color: "bg-purple-600 hover:bg-purple-700",
    url: (mint) => `https://axiom.trade/token/${mint}`,
  },
  {
    name: "BullX",
    icon: "🐂",
    color: "bg-green-600 hover:bg-green-700",
    url: (mint) =>
      `https://bullx.io/terminal?chainId=1399811149&address=${mint}`,
  },
  {
    name: "SSE",
    icon: "⚡",
    color: "bg-teal-600 hover:bg-teal-700",
    url: (mint) => `https://sse.trade/token/${mint}`,
  },
  {
    name: "Photon",
    icon: "◉",
    color: "bg-blue-600 hover:bg-blue-700",
    url: (mint) => `https://photon-sol.tinyastro.io/en/lp/${mint}`,
  },
  {
    name: "DexScreener",
    icon: "📊",
    color: "bg-gray-600 hover:bg-gray-700",
    url: (mint) => `https://dexscreener.com/solana/${mint}`,
  },
  {
    name: "Nova",
    icon: "⭐",
    color: "bg-purple-600 hover:bg-purple-700",
    url: (mint) => `https://nova.trade/token/${mint}`,
  },
  {
    name: "GMGN",
    icon: "🎯",
    color: "bg-lime-600 hover:bg-lime-700",
    url: (mint) => `https://gmgn.ai/sol/token/${mint}`,
  },
];

// Token Image Component with proper error handling
const TokenImage = ({
  token,
  className = "w-16 h-16",
}: {
  token: TrackedToken;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!token.image_uri || imageError) {
    return (
      <div
        className={`${className} rounded-xl overflow-hidden bg-gray-800/50 flex items-center justify-center text-gray-300 text-sm font-bold border border-gray-600/30`}
      >
        {token.symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-xl overflow-hidden bg-gray-800/50 border border-gray-600/30 relative`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={token.image_uri || "/placeholder.svg"}
        alt={token.name}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? "none" : "block" }}
      />
    </div>
  );
};

export function ProgressiveAlphaCalls() {
  const { tokens, isConnected, connectionStatus, lastUpdate, dataSource } =
    useRealtimeTokens();
  const [progressionState, setProgressionState] = useState(() =>
    TokenProgressionSystem.loadProgressionState()
  );
  const [selectedToken, setSelectedToken] = useState<TrackedToken | null>(null);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Token rotation indices
  const [tokenIndices, setTokenIndices] = useState({
    gambleBox: 0,
    fastestRunner: 0,
    highestGainer: 0,
  });

  // Update progression when new tokens arrive
  useEffect(() => {
    if (tokens.length > 0) {
      try {
        const newState = TokenProgressionSystem.processTokenProgression(tokens);
        setProgressionState(newState);
      } catch (error) {
        console.error("Error processing token progression:", error);
      }
    }
  }, [tokens]);

  // Auto-rotate tokens every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenIndices((prev) => ({
        gambleBox:
          progressionState.gambleBox.length > 1
            ? (prev.gambleBox + 1) % progressionState.gambleBox.length
            : 0,
        fastestRunner:
          progressionState.fastestRunner.length > 1
            ? (prev.fastestRunner + 1) % progressionState.fastestRunner.length
            : 0,
        highestGainer:
          progressionState.highestGainer.length > 1
            ? (prev.highestGainer + 1) % progressionState.highestGainer.length
            : 0,
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [progressionState]);

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    }
    return `$${marketCap.toFixed(0)}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    }
    return `${minutes}m ago`;
  };

  const handleTradeClick = (token: TrackedToken) => {
    setSelectedToken(token);
    setShowTradingModal(true);
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Updated categories with your desired color scheme
  const categories = [
    {
      key: "gambleBox" as keyof typeof tokenIndices,
      title: "Gamble Box",
      icon: "🎲",
      bgColor:
        "bg-gradient-to-br from-orange-900/80 via-amber-900/70 to-yellow-900/60",
      borderColor: "border-orange-500/40",
      textColor: "text-orange-300",
      buttonColor: "bg-orange-600 hover:bg-orange-700 text-white",
      headerBg: "bg-orange-800/30",
      cardBg: "bg-orange-900/20",
    },
    {
      key: "fastestRunner" as keyof typeof tokenIndices,
      title: "Fastest Runner",
      icon: "⚡",
      bgColor:
        "bg-gradient-to-br from-teal-900/80 via-emerald-900/70 to-green-900/60",
      borderColor: "border-teal-500/40",
      textColor: "text-teal-300",
      buttonColor: "bg-teal-600 hover:bg-teal-700 text-white",
      headerBg: "bg-teal-800/30",
      cardBg: "bg-teal-900/20",
    },
    {
      key: "highestGainer" as keyof typeof tokenIndices,
      title: "Highest Gainer",
      icon: "👑",
      bgColor:
        "bg-gradient-to-br from-yellow-900/80 via-amber-900/70 to-orange-900/60",
      borderColor: "border-yellow-500/40",
      textColor: "text-yellow-300",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
      headerBg: "bg-yellow-800/30",
      cardBg: "bg-yellow-900/20",
    },
  ];

  // Show error state if no real data
  if (!isConnected || tokens.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-400 flex items-center gap-2 font-heading">
            <AlertTriangle className="w-6 h-6" />
            PROGRESSIVE ALPHA - API ERROR
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              NO REAL DATA
            </span>
          </h1>
        </div>

        <Card className="bg-red-900/20 border-red-500/30 rounded-sm p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">
            Unable to fetch REAL token data
          </h3>
          <p className="text-gray-400 mb-4">
            All APIs are currently unavailable. Please try again later.
          </p>
          <p className="text-gray-500 text-sm">
            Status: {connectionStatus} | Source: {dataSource}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3 font-heading">
          <Zap className="w-8 h-8" />
          PROGRESSIVE ALPHA CALLS
          <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-lg border border-green-500/30 flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            LIVE TRACKING
          </span>
        </h1>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-300 text-base">LIVE</span>
          </div>
          <span className="text-gray-400 text-sm">{dataSource}</span>
          {lastUpdate && (
            <span className="text-gray-500 text-sm">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryTokens = progressionState[category.key];
          const currentIndex = tokenIndices[category.key];
          const token = categoryTokens[currentIndex];

          if (!token) {
            return (
              <Card
                key={category.key}
                className={`${category.bgColor} border-2 ${category.borderColor} rounded-2xl backdrop-blur-sm h-[500px]`}
              >
                <CardContent className="p-0 h-full">
                  {/* Header */}
                  <div
                    className={`p-4 border-b border-white/20 ${category.headerBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className={`font-bold ${category.textColor} text-lg`}>
                        {category.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw
                        className={`w-12 h-12 ${category.textColor} opacity-50 animate-spin mx-auto mb-4`}
                      />
                      <p className="text-gray-300 text-lg">
                        Waiting for tokens...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={category.key}
              className={`${category.bgColor} border-2 ${category.borderColor} rounded-2xl backdrop-blur-sm h-[500px]`}
            >
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header */}
                <div
                  className={`p-4 border-b border-white/20 flex-shrink-0 ${category.headerBg}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className={`font-bold ${category.textColor} text-lg`}>
                      {category.title}
                    </h3>
                  </div>
                </div>

                {/* Token Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  {/* Token Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <TokenImage token={token} className="w-16 h-16" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-white text-2xl">
                            ${token.symbol}
                          </h4>
                          <button
                            onClick={() => copyToClipboard(token.mint)}
                            className="w-6 h-6 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedAddress === token.mint ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {/* FIXED: Display the actual token name instead of random numbers */}
                        <p className="text-gray-200 text-base truncate font-medium">
                          {token.name || `Token ${token.symbol}`}
                        </p>
                        <div className="flex items-center gap-3 text-sm mt-2">
                          <span
                            className={`font-bold ${category.textColor} text-base`}
                          >
                            MC: {formatMarketCap(token.usd_market_cap)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">
                            {token.reply_count}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Social Links Row */}
                    <div className="flex gap-3">
                      {token.twitter && (
                        <a
                          href={token.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700/30 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </a>
                      )}
                      {token.website && (
                        <a
                          href={token.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-700/30 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      <button className="w-8 h-8 bg-gray-700/30 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all">
                        <Star className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-gray-700/30 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Trade Button */}
                    <Button
                      onClick={() => handleTradeClick(token)}
                      className={`w-full ${category.buttonColor} font-bold py-3 px-6 rounded-xl text-lg flex items-center justify-center gap-3 transition-all shadow-lg`}
                    >
                      <Zap className="w-5 h-5" />
                      Trade
                    </Button>
                  </div>

                  {/* Performance Metrics at Bottom */}
                  <div className="grid grid-cols-3 gap-3 text-center mt-6">
                    <div
                      className={`${category.cardBg} rounded-xl p-3 border border-gray-600/20`}
                    >
                      <p className="text-xs text-gray-400 mb-1">
                        Called {getTimeAgo(token.firstCallTimestamp)}
                      </p>
                      <p className="font-bold text-white text-base">
                        {formatMarketCap(token.firstCallPrice)}
                      </p>
                    </div>
                    <div
                      className={`${category.cardBg} rounded-xl p-3 border border-gray-600/20`}
                    >
                      <p className="text-xs text-gray-400 mb-1">Current Gain</p>
                      <p
                        className={`font-bold text-base ${
                          token.currentGain >= 1
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {token.currentGain.toFixed(1)}x
                      </p>
                    </div>
                    <div
                      className={`${category.cardBg} rounded-xl p-3 border border-gray-600/20`}
                    >
                      <p className="text-xs text-gray-400 mb-1">Highest Gain</p>
                      <p
                        className={`font-bold text-base ${category.textColor}`}
                      >
                        {token.highestGain.toFixed(1)}x
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trading Platform Modal */}
      <Dialog open={showTradingModal} onOpenChange={setShowTradingModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                Trade Options
              </DialogTitle>
              <button
                onClick={() => setShowTradingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Choose your preferred platform to trade {selectedToken?.symbol}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              AVAILABLE PLATFORMS
            </h3>

            {/* Warning */}
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3">
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
              {TRADING_PLATFORMS.map((platform) => (
                <a
                  key={platform.name}
                  href={selectedToken ? platform.url(selectedToken.mint) : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${platform.color} text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2`}
                  onClick={() => setShowTradingModal(false)}
                >
                  <span>{platform.icon}</span>
                  {platform.name}
                </a>
              ))}
            </div>

            {/* Warning Footer */}
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3">
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

      {/* Token Count Display */}
      <Card className="bg-gray-900/50 border-gray-700/30 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-orange-300 text-base font-bold">Gamble Box</p>
            <p className="text-white font-bold text-2xl">
              {progressionState.gambleBox.length}
            </p>
          </div>
          <div>
            <p className="text-teal-300 text-base font-bold">Fastest Runner</p>
            <p className="text-white font-bold text-2xl">
              {progressionState.fastestRunner.length}
            </p>
          </div>
          <div>
            <p className="text-yellow-300 text-base font-bold">
              Highest Gainer
            </p>
            <p className="text-white font-bold text-2xl">
              {progressionState.highestGainer.length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
