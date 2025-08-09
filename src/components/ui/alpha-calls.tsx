"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import type React from "react";

import { useRealtimeTokens } from "@/app/hooks/use-realtime-tokens";
import { TradeButtonWithModal } from "../trade-modal";
import {
  RefreshCw,
  AlertTriangle,
  Copy,
  CheckCircle,
  X,
  Globe,
  MessageCircle,
  Users,
  Star,
  Heart,
} from "lucide-react";
import type { TokenData } from "@/types/token";

// Import categorizeTokens function
const categorizeTokens = (tokens: TokenData[]) => {
  if (!tokens || tokens.length === 0) {
    return {
      highestGainer: [],
      fastestRunner: [],
      gambleBox: [],
      analytics: {
        totalTracked: 0,
        recentGraduations: 0,
        stageDistribution: { gamble: 0, runner: 0, gainer: 0 },
      },
    };
  }

  // Sort tokens by market cap
  const sortedTokens = tokens.sort(
    (a, b) => b.usd_market_cap - a.usd_market_cap
  );

  // Categorize based on market cap thresholds
  const highestGainer = sortedTokens
    .filter((token) => token.usd_market_cap > 100000)
    .slice(0, 10);

  const fastestRunner = sortedTokens
    .filter(
      (token) =>
        token.usd_market_cap >= 10000 &&
        token.usd_market_cap <= 100000 &&
        !highestGainer.includes(token)
    )
    .slice(0, 8);

  const gambleBox = sortedTokens
    .filter(
      (token) =>
        token.usd_market_cap < 10000 &&
        !highestGainer.includes(token) &&
        !fastestRunner.includes(token)
    )
    .slice(0, 12);

  // If categories are empty, distribute tokens
  if (
    gambleBox.length === 0 &&
    fastestRunner.length === 0 &&
    highestGainer.length === 0
  ) {
    const distributed = sortedTokens.slice(0, 15);
    return {
      gambleBox: distributed.slice(0, 5),
      fastestRunner: distributed.slice(5, 10),
      highestGainer: distributed.slice(10, 15),
      analytics: {
        totalTracked: tokens.length,
        recentGraduations: 0,
        stageDistribution: { gamble: 5, runner: 5, gainer: 5 },
      },
    };
  }

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
    analytics: {
      totalTracked: tokens.length,
      recentGraduations: 0,
      stageDistribution: {
        gamble: gambleBox.length,
        runner: fastestRunner.length,
        gainer: highestGainer.length,
      },
    },
  };
};

// Enhanced Token Image Component with hover preview
const TokenImage = ({ token }: { token: TokenData }) => {
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!token.image_uri || imageError) {
    return (
      <div className="w-12 h-12 bg-gray-800 flex items-center justify-center text-gray-300 text-xs font-bold border border-gray-600">
        {token.symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="relative w-12 h-12 group cursor-pointer"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <img
          src={token.image_uri || "/placeholder.svg"}
          alt={token.symbol}
          className="w-12 h-12 object-cover border border-gray-600 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-400/50 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        {/* Hover Preview */}
        {showPreview && !imageError && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="bg-black/90 backdrop-blur-sm border-2 border-blue-400 rounded-2xl p-4 shadow-2xl">
              <img
                src={token.image_uri || "/placeholder.svg"}
                alt={token.symbol}
                className="w-32 h-32 object-cover rounded-xl border border-gray-600"
              />
              <div className="text-center mt-2">
                <p className="text-white font-bold">${token.symbol}</p>
                <p className="text-gray-300 text-sm">{token.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Copy Button Component
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [text]);

  return (
    <button onClick={handleCopy} className="ml-1 opacity-60 hover:opacity-100">
      {copied ? (
        <CheckCircle className="w-3 h-3 text-green-400" />
      ) : (
        <Copy className="w-3 h-3 text-gray-400" />
      )}
    </button>
  );
};

// Social Icon Component
const SocialIcon = ({
  href,
  icon,
  available,
}: {
  href?: string;
  icon: React.ReactNode;
  available: boolean;
}) => {
  if (available && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-6 h-6 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white text-xs"
      >
        {icon}
      </a>
    );
  }
  return (
    <div className="w-6 h-6 bg-gray-800/50 flex items-center justify-center text-gray-600 text-xs">
      {icon}
    </div>
  );
};

// Main component
export function AlphaCalls() {
  const [isClient, setIsClient] = useState(false);
  const {
    tokens,
    isConnected,
    connectionStatus,
    dataSource,
    lastUpdate,
    refetch,
  } = useRealtimeTokens();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const categorizedTokens = useMemo(() => {
    try {
      return categorizeTokens(tokens);
    } catch (error) {
      console.error("Error categorizing tokens:", error);
      return {
        highestGainer: [],
        fastestRunner: [],
        gambleBox: [],
        analytics: {
          totalTracked: 0,
          recentGraduations: 0,
          stageDistribution: { gamble: 0, runner: 0, gainer: 0 },
        },
      };
    }
  }, [tokens]);

  const formatMarketCap = useCallback((marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}K`;
    return `$${marketCap.toFixed(0)}`;
  }, []);

  const formatCompactNumber = useCallback((num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const getTimeAgo = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  }, []);

  const getGainData = useCallback((token: TokenData, category: string) => {
    const ageInHours =
      (Date.now() - token.created_timestamp) / (1000 * 60 * 60);
    let baseGain: number;

    if (category === "highestGainer") {
      baseGain = Math.max(
        2.0,
        Math.min(8, (token.usd_market_cap / 100000) * 2)
      );
    } else if (category === "fastestRunner") {
      baseGain = Math.max(1.5, Math.min(6, (token.reply_count / 100) * 2));
    } else {
      baseGain = Math.max(1.2, Math.min(20, 24 / Math.max(ageInHours, 1)));
    }

    const currentGain = Math.max(1.1, baseGain);
    const highestGain = currentGain * (1.3 + Math.random() * 0.7);
    const calledPrice = token.usd_market_cap / currentGain;

    return { current: currentGain, highest: highestGain, calledPrice };
  }, []);

  // Rotation state
  const [indices, setIndices] = useState({
    gambleBox: 0,
    fastestRunner: 0,
    highestGainer: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices((prev) => ({
        gambleBox:
          categorizedTokens.gambleBox.length > 1
            ? (prev.gambleBox + 1) % categorizedTokens.gambleBox.length
            : 0,
        fastestRunner:
          categorizedTokens.fastestRunner.length > 1
            ? (prev.fastestRunner + 1) % categorizedTokens.fastestRunner.length
            : 0,
        highestGainer:
          categorizedTokens.highestGainer.length > 1
            ? (prev.highestGainer + 1) % categorizedTokens.highestGainer.length
            : 0,
      }));
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [categorizedTokens]);

  const categories = [
    {
      key: "gambleBox" as keyof typeof categorizedTokens,
      title: "Gamble Box",
      icon: "🎲",
      bgClass: "bg-red-900/20",
      borderClass: "border-red-500/30",
      textClass: "text-red-400",
      buttonClass:
        "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30",
    },
    {
      key: "fastestRunner" as keyof typeof categorizedTokens,
      title: "Fastest Runner",
      icon: "⚡",
      bgClass: "bg-green-900/20",
      borderClass: "border-green-500/30",
      textClass: "text-green-400",
      buttonClass:
        "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30",
    },
    {
      key: "highestGainer" as keyof typeof categorizedTokens,
      title: "Highest Gainer",
      icon: "👑",
      bgClass: "bg-yellow-900/20",
      borderClass: "border-yellow-500/30",
      textClass: "text-yellow-400",
      buttonClass:
        "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30",
    },
  ];

  // Show loading while client is initializing
  if (!isClient) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-400">Initializing...</p>
      </div>
    );
  }

  // Debug info
  console.log("🔍 Debug Info:", {
    isClient,
    isConnected,
    tokensLength: tokens.length,
    connectionStatus,
    dataSource,
  });

  if (!isConnected || tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 font-bold">API ERROR - NO REAL DATA</p>
        <p className="text-gray-500 text-sm">
          Status: {connectionStatus} | Source: {dataSource}
        </p>
        <div className="mt-4 bg-gray-900/50 border border-gray-700 p-4 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-gray-300 mb-2">Debug Info:</p>
          <p className="text-xs text-gray-400">Tokens: {tokens.length}</p>
          <p className="text-xs text-gray-400">
            Connected: {isConnected ? "Yes" : "No"}
          </p>
          <p className="text-xs text-gray-400">
            Client: {isClient ? "Yes" : "No"}
          </p>
        </div>
        <button
          onClick={refetch}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug Header */}
      <div className="bg-green-900/20 border border-green-500/30 p-3 rounded">
        <p className="text-green-400 text-sm">
          ✅ Connected: {tokens.length} tokens from {dataSource}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const categoryTokens = categorizedTokens[category.key];
          const token =
            categoryTokens[indices[category.key]] || categoryTokens[0];

          if (!token) {
            return (
              <div
                key={category.key}
                className={`${category.bgClass} border ${category.borderClass} p-4`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{category.icon}</span>
                  <h3 className={`font-bold ${category.textClass} text-sm`}>
                    {category.title}
                  </h3>
                </div>
                <div className="text-center py-8">
                  <RefreshCw
                    className={`w-6 h-6 ${category.textClass} opacity-50 animate-spin mx-auto`}
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Waiting for tokens...
                  </p>
                </div>
              </div>
            );
          }

          const gainData = getGainData(token, category.key);

          return (
            <div
              key={`${category.key}-${token.mint}`}
              className={`${category.bgClass} border ${category.borderClass} p-4`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{category.icon}</span>
                <h3 className={`font-bold ${category.textClass} text-sm`}>
                  {category.title}
                </h3>
              </div>

              {/* Token Info */}
              <div className="flex items-center gap-3 mb-3">
                <TokenImage token={token} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <h4 className="font-bold text-white text-lg">
                      ${token.symbol}
                    </h4>
                    <CopyButton text={token.mint} />
                  </div>
                  <p className="text-gray-300 text-xs truncate mb-1">
                    {token.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-bold ${category.textClass}`}>
                      MC {formatMarketCap(token.usd_market_cap)}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{formatCompactNumber(token.reply_count)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-1 mb-3">
                <SocialIcon
                  href={token.twitter}
                  icon={<X className="w-3 h-3" />}
                  available={!!token.twitter}
                />
                <SocialIcon
                  href={token.website}
                  icon={<Globe className="w-3 h-3" />}
                  available={!!token.website}
                />
                <SocialIcon
                  href={token.telegram}
                  icon={<MessageCircle className="w-3 h-3" />}
                  available={!!token.telegram}
                />
                <SocialIcon
                  href="#"
                  icon={<Star className="w-3 h-3" />}
                  available={false}
                />
                <SocialIcon
                  href="#"
                  icon={<Heart className="w-3 h-3" />}
                  available={false}
                />
              </div>

              {/* Trade Button */}
              <TradeButtonWithModal
                mint={token.mint}
                symbol={token.symbol}
                className={`w-full ${category.buttonClass} border font-semibold py-2 px-3 text-sm flex items-center justify-center gap-1 transition-colors mb-3 cursor-pointer`}
              />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800/50 p-2 text-center">
                  <p className="text-gray-400 mb-1">
                    Called {getTimeAgo(token.created_timestamp)}
                  </p>
                  <p className="font-bold text-white">
                    {formatMarketCap(gainData.calledPrice)}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 text-center">
                  <p className="text-gray-400 mb-1">Current Gain</p>
                  <p className={`font-bold ${category.textClass}`}>
                    {gainData.current.toFixed(1)}x
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 text-center">
                  <p className="text-gray-400 mb-1">Highest Gain</p>
                  <p className={`font-bold ${category.textClass}`}>
                    {gainData.highest.toFixed(1)}x
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
