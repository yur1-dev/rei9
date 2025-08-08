"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRealtimeTokens } from "@/app/hooks/use-realtime-tokens";
import { categorizeTokens } from "@/lib/integrations/client-api";
import { TradeButtonWithModal } from "../trade-modal";
import {
  TrendingUp,
  Zap,
  Dice6,
  Wifi,
  WifiOff,
  Crown,
  Rocket,
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
  Shield,
} from "lucide-react";
import { TokenData } from "@/types/token";

// Compact Token Image Component
const TokenImage = ({ token }: { token: TokenData }) => {
  const [imageError, setImageError] = useState(false);

  if (!token.image_uri || imageError) {
    return (
      <div className="w-12 h-12 bg-gray-800 flex items-center justify-center text-gray-300 text-xs font-bold border border-gray-600">
        {token.symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <img
      src={token.image_uri || "/placeholder.svg"}
      alt={token.symbol}
      className="w-12 h-12 object-cover border border-gray-600"
      onError={() => setImageError(true)}
    />
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

export function AlphaCalls() {
  const { tokens, isConnected, connectionStatus, dataSource } =
    useRealtimeTokens();

  const categorizedTokens = useMemo(() => {
    try {
      return categorizeTokens(tokens);
    } catch (error) {
      console.error("Error categorizing tokens:", error);
      return { highestGainer: [], fastestRunner: [], gambleBox: [] };
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
        Math.min(10, (token.usd_market_cap / 500000) * 3)
      );
    } else if (category === "fastestRunner") {
      baseGain = Math.max(1.5, Math.min(8, (token.reply_count / 200) * 2));
    } else {
      baseGain = Math.max(1.2, Math.min(15, 48 / Math.max(ageInHours, 1)));
    }

    const currentGain = Math.max(1.1, baseGain);
    const highestGain = currentGain * (1.2 + Math.random() * 0.8);
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

  if (!isConnected || tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 font-bold">API ERROR - NO REAL DATA</p>
        <p className="text-gray-500 text-sm">
          Status: {connectionStatus} | Source: {dataSource}
        </p>
      </div>
    );
  }

  return (
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
  );
}
