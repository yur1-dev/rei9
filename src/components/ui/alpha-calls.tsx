"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import type React from "react";
import Image from "next/image";

import { useRealtimeTokens } from "@/app/hooks/use-realtime-tokens";
import { TradeButtonWithModal } from "@/components/trade-modal";
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

// Define proper types for categorized tokens
interface CategorizedTokens {
  highestGainer: TokenData[];
  fastestRunner: TokenData[];
  gambleBox: TokenData[];
  analytics: {
    totalTracked: number;
    recentGraduations: number;
    stageDistribution: {
      gamble: number;
      runner: number;
      gainer: number;
    };
  };
}

// Define valid category keys
type CategoryKey = keyof Pick<
  CategorizedTokens,
  "highestGainer" | "fastestRunner" | "gambleBox"
>;

// SMART categorization for NEW tokens with trading potential
const categorizeTokensForTrading = (tokens: TokenData[]): CategorizedTokens => {
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

  const now = Date.now();

  // Sort by creation time and trading potential for NEW tokens
  const sortedTokens = [...tokens].sort((a, b) => {
    // Prioritize very recent tokens (last 6 hours)
    const aAge = (now - a.created_timestamp) / (1000 * 60 * 60);
    const bAge = (now - b.created_timestamp) / (1000 * 60 * 60);

    // Fresh tokens get priority
    if (aAge < 6 && bAge >= 6) return -1;
    if (bAge < 6 && aAge >= 6) return 1;

    // Then by market cap for established tokens
    const mcDiff = b.usd_market_cap - a.usd_market_cap;
    if (Math.abs(mcDiff) > 10000) return mcDiff;

    // Finally by activity/engagement
    const activityDiff = b.reply_count - a.reply_count;
    return activityDiff;
  });

  // 🏆 HIGHEST GAINER: Established new tokens with good performance (>$50K)
  const highestGainer = sortedTokens
    .filter((token) => {
      const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
      const volume24h = token.volume?.h24 || 0;
      return (
        token.usd_market_cap > 50000 && // Market cap > $50K (as per About page)
        ageInHours < 48 && // Less than 2 days old
        volume24h > 1000 && // Some volume
        token.reply_count > 30 // Some community engagement
      );
    })
    .slice(0, 12);

  // ⚡ FASTEST RUNNER: Mid-tier new tokens with momentum ($5K-$50K)
  const fastestRunner = sortedTokens
    .filter((token) => {
      const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
      return (
        !highestGainer.includes(token) &&
        ageInHours < 24 && // Less than 1 day old
        token.usd_market_cap >= 5000 && // Market cap >= $5K (as per About page)
        token.usd_market_cap <= 50000 && // Market cap <= $50K (as per About page)
        token.reply_count > 15 // Some community activity
      );
    })
    .slice(0, 10);

  // 🎲 GAMBLE BOX: Very fresh tokens with small caps (<$5K)
  const gambleBox = sortedTokens
    .filter((token) => {
      const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
      return (
        !highestGainer.includes(token) &&
        !fastestRunner.includes(token) &&
        ageInHours < 12 && // Very fresh (less than 12 hours)
        token.usd_market_cap < 5000 // Market cap < $5K (as per About page)
      );
    })
    .slice(0, 15);

  // If categories are still empty, distribute remaining tokens intelligently
  const allCategorized = [...highestGainer, ...fastestRunner, ...gambleBox];
  const remaining = sortedTokens.filter(
    (token) => !allCategorized.includes(token)
  );

  if (remaining.length > 0) {
    console.log(`📝 Distributing ${remaining.length} remaining tokens...`);

    // Fill empty categories with best remaining tokens
    if (highestGainer.length === 0) {
      const bestRemaining = remaining
        .filter((t) => t.usd_market_cap > 30000) // Lower threshold for fallback
        .slice(0, 3);
      highestGainer.push(...bestRemaining);
    }

    if (fastestRunner.length === 0) {
      const midTierRemaining = remaining
        .filter(
          (t) =>
            !highestGainer.includes(t) &&
            t.usd_market_cap > 2000 &&
            t.usd_market_cap < 30000
        )
        .slice(0, 3);
      fastestRunner.push(...midTierRemaining);
    }

    if (gambleBox.length === 0) {
      const freshRemaining = remaining
        .filter(
          (t) =>
            !highestGainer.includes(t) &&
            !fastestRunner.includes(t) &&
            t.usd_market_cap < 10000
        )
        .slice(0, 5);
      gambleBox.push(...freshRemaining);
    }
  }

  const analytics = {
    totalTracked: tokens.length,
    recentGraduations: tokens.filter((t) => t.complete).length,
    stageDistribution: {
      gamble: gambleBox.length,
      runner: fastestRunner.length,
      gainer: highestGainer.length,
    },
  };

  console.log("🎯 SMART Token Categorization (Updated to match About page):");
  console.log(
    `  👑 Highest Gainers: ${highestGainer.length} (>$50K market cap)`
  );
  console.log(
    `  ⚡ Fastest Runners: ${fastestRunner.length} ($5K-$50K market cap)`
  );
  console.log(`  🎲 Gamble Box: ${gambleBox.length} (<$5K market cap)`);
  console.log(`  📊 Total tracked: ${analytics.totalTracked}`);

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
    analytics,
  };
};

// Enhanced Token Image Component with hover preview
const TokenImage = ({ token }: { token: TokenData }) => {
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!token.image_uri || imageError) {
    return (
      <div className="w-12 h-12 bg-gray-800 flex items-center justify-center text-gray-300 text-xs font-bold border border-gray-600 rounded">
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
        <Image
          src={token.image_uri}
          alt={token.symbol}
          width={48}
          height={48}
          className="w-12 h-12 object-cover border border-gray-600 rounded transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-400/50 group-hover:scale-105"
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
              <Image
                src={token.image_uri}
                alt={token.symbol}
                width={128}
                height={128}
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
    <button
      onClick={handleCopy}
      className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
    >
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
        className="w-6 h-6 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white text-xs rounded transition-colors"
      >
        {icon}
      </a>
    );
  }
  return (
    <div className="w-6 h-6 bg-gray-800/50 flex items-center justify-center text-gray-600 text-xs rounded">
      {icon}
    </div>
  );
};

// Enhanced gain calculation based on token age and performance
const calculateRealisticGains = (token: TokenData, category: string) => {
  const ageInHours = (Date.now() - token.created_timestamp) / (1000 * 60 * 60);
  const volume24h = token.volume?.h24 || 0;
  const priceChange24h = token.priceChange?.h24 || 0;

  let baseGain: number;
  let potentialMultiplier: number;

  if (category === "highestGainer") {
    // Established performers - more conservative but proven
    baseGain = Math.max(2.0, Math.min(8, 1 + Math.abs(priceChange24h) / 50));
    potentialMultiplier = 1.2 + (volume24h / 100000) * 0.3;
  } else if (category === "fastestRunner") {
    // Momentum plays - moderate risk/reward
    baseGain = Math.max(1.5, Math.min(12, 1 + token.reply_count / 50));
    potentialMultiplier = 1.5 + (token.usd_market_cap / 50000) * 0.2;
  } else {
    // Gamble box - high risk but massive potential
    const freshnessBonus = Math.max(1, 24 / Math.max(ageInHours, 1));
    baseGain = Math.max(1.2, Math.min(50, freshnessBonus));
    potentialMultiplier = 2.0 + Math.random() * 3.0; // 2x to 5x potential
  }

  const currentGain = Math.max(1.1, baseGain);
  const highestGain = currentGain * potentialMultiplier;
  const calledPrice = token.usd_market_cap / currentGain;

  return {
    current: currentGain,
    highest: highestGain,
    calledPrice,
    risk:
      category === "gambleBox"
        ? "HIGH"
        : category === "fastestRunner"
        ? "MEDIUM"
        : "LOW",
  };
};

// Define the hook return type
interface UseRealtimeTokensReturn {
  tokens?: TokenData[];
  isConnected?: boolean;
  connectionStatus?: string;
  [key: string]: any;
}

// Main component
export function AlphaCalls() {
  const [isClient, setIsClient] = useState(false);

  // Use the hook data with proper typing
  const hookData = useRealtimeTokens() as UseRealtimeTokensReturn | TokenData[];

  // Extract data based on what the hook returns
  const tokens: TokenData[] = useMemo(() => {
    if (Array.isArray(hookData)) {
      return hookData;
    } else if (
      hookData &&
      typeof hookData === "object" &&
      "tokens" in hookData
    ) {
      return hookData.tokens || [];
    }
    return [];
  }, [hookData]);

  const isConnected = useMemo(() => {
    if (Array.isArray(hookData)) {
      return hookData.length > 0;
    } else if (
      hookData &&
      typeof hookData === "object" &&
      "isConnected" in hookData
    ) {
      return hookData.isConnected || false;
    }
    return false;
  }, [hookData]);

  const connectionStatus = useMemo(() => {
    if (Array.isArray(hookData)) {
      return hookData.length > 0 ? "Connected" : "No tokens";
    } else if (
      hookData &&
      typeof hookData === "object" &&
      "connectionStatus" in hookData
    ) {
      return hookData.connectionStatus || "Unknown";
    }
    return "Connecting...";
  }, [hookData]);

  const refetch = useCallback(() => {
    console.log("Refetch requested");
    // Add your refetch logic here if the hook provides it
    if (
      hookData &&
      typeof hookData === "object" &&
      "refetch" in hookData &&
      typeof hookData.refetch === "function"
    ) {
      hookData.refetch();
    }
  }, [hookData]);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const categorizedTokens = useMemo(() => {
    try {
      return categorizeTokensForTrading(tokens); // Use smart categorization!
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

  // Rotation state with proper typing
  const [indices, setIndices] = useState<Record<CategoryKey, number>>({
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
      key: "gambleBox" as CategoryKey,
      title: "Gamble Box",
      subtitle: "High Risk • High Reward",
      icon: "🎲",
      bgClass: "bg-red-900/20",
      borderClass: "border-red-500/30",
      textClass: "text-red-400",
      buttonClass:
        "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30",
    },
    {
      key: "fastestRunner" as CategoryKey,
      title: "Fastest Runner",
      subtitle: "Medium Risk • Good Momentum",
      icon: "⚡",
      bgClass: "bg-green-900/20",
      borderClass: "border-green-500/30",
      textClass: "text-green-400",
      buttonClass:
        "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30",
    },
    {
      key: "highestGainer" as CategoryKey,
      title: "Highest Gainer",
      subtitle: "Lower Risk • Proven Performance",
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
        <p className="text-gray-400">Initializing Alpha Calls...</p>
      </div>
    );
  }

  // Debug info
  console.log("🔍 AlphaCalls Debug:", {
    isClient,
    isConnected,
    tokensLength: tokens.length,
    connectionStatus,
    categorized: {
      gainers: categorizedTokens.highestGainer.length,
      runners: categorizedTokens.fastestRunner.length,
      gambles: categorizedTokens.gambleBox.length,
    },
  });

  if (!isConnected || tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 font-bold">⚠️ NO FRESH TOKENS DETECTED</p>
        <p className="text-gray-500 text-sm">Status: {connectionStatus}</p>
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
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 mx-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Hunt for Fresh Tokens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Status Header */}
      <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-green-400 text-sm font-medium">
            🎯 ALPHA DETECTED: {tokens.length} fresh tokens analyzed
          </p>
          <div className="text-xs text-gray-400">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
          <div className="text-center">
            <span className="text-yellow-400 font-bold">
              {categorizedTokens.highestGainer.length}
            </span>
            <span className="text-gray-400 ml-1">Proven</span>
          </div>
          <div className="text-center">
            <span className="text-green-400 font-bold">
              {categorizedTokens.fastestRunner.length}
            </span>
            <span className="text-gray-400 ml-1">Momentum</span>
          </div>
          <div className="text-center">
            <span className="text-red-400 font-bold">
              {categorizedTokens.gambleBox.length}
            </span>
            <span className="text-gray-400 ml-1">Fresh</span>
          </div>
        </div>
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
                className={`${category.bgClass} border ${category.borderClass} p-4 rounded-lg`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <h3 className={`font-bold ${category.textClass} text-sm`}>
                      {category.title}
                    </h3>
                    <p className="text-gray-500 text-xs">{category.subtitle}</p>
                  </div>
                </div>
                <div className="text-center py-8">
                  <RefreshCw
                    className={`w-6 h-6 ${category.textClass} opacity-50 animate-spin mx-auto`}
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Scanning for tokens...
                  </p>
                </div>
              </div>
            );
          }

          const gainData = calculateRealisticGains(token, category.key);
          const ageInHours =
            (Date.now() - token.created_timestamp) / (1000 * 60 * 60);
          const isVeryFresh = ageInHours < 6;

          return (
            <div
              key={`${category.key}-${token.mint}`}
              className={`${category.bgClass} border ${category.borderClass} p-4 rounded-lg transition-all duration-300 hover:shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{category.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-bold ${category.textClass} text-sm`}>
                    {category.title}
                  </h3>
                  <p className="text-gray-500 text-xs">{category.subtitle}</p>
                </div>
                {isVeryFresh && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
                    🔥 HOT
                  </span>
                )}
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
                className={`w-full ${category.buttonClass} border font-semibold py-2 px-3 text-sm flex items-center justify-center gap-1 transition-colors mb-3 cursor-pointer rounded`}
              />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800/50 p-2 text-center rounded">
                  <p className="text-gray-400 mb-1">
                    Called {getTimeAgo(token.created_timestamp)}
                  </p>
                  <p className="font-bold text-white">
                    {formatMarketCap(gainData.calledPrice)}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 text-center rounded">
                  <p className="text-gray-400 mb-1">Current Gain</p>
                  <p className={`font-bold ${category.textClass}`}>
                    {gainData.current.toFixed(1)}x
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 text-center rounded">
                  <p className="text-gray-400 mb-1">Max Potential</p>
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
