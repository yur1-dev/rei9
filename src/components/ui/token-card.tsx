import { TokenData, TokenCategory } from "@/types/token";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Twitter,
  MessageCircle,
  Zap,
  TrendingUp,
  Dice6,
  Globe,
  Star,
  Users,
  Copy,
  CheckCircle,
  X,
  MapPin,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { TradeButtonWithModal } from "../trade-modal";

interface TokenCardProps {
  token: TokenData;
  category: TokenCategory;
}

const categoryConfig = {
  highestGainer: {
    icon: TrendingUp,
    emoji: "👑",
    title: "Highest Gainer",
    color: "text-yellow-300",
    borderColor: "border-yellow-500/40",
    bgColor:
      "bg-gradient-to-br from-yellow-900/80 via-amber-900/70 to-orange-900/60",
    headerBg: "bg-yellow-800/30",
    cardBg: "bg-yellow-900/20",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  fastestRunner: {
    icon: Zap,
    emoji: "⚡",
    title: "Fastest Runner",
    color: "text-teal-300",
    borderColor: "border-teal-500/40",
    bgColor:
      "bg-gradient-to-br from-teal-900/80 via-emerald-900/70 to-green-900/60",
    headerBg: "bg-teal-800/30",
    cardBg: "bg-teal-900/20",
    buttonColor: "bg-teal-600 hover:bg-teal-700 text-white",
  },
  gambleBox: {
    icon: Dice6,
    emoji: "🎲",
    title: "Gamble Box",
    color: "text-orange-300",
    borderColor: "border-orange-500/40",
    bgColor:
      "bg-gradient-to-br from-orange-900/80 via-amber-900/70 to-yellow-900/60",
    headerBg: "bg-orange-800/30",
    cardBg: "bg-orange-900/20",
    buttonColor: "bg-orange-600 hover:bg-orange-700 text-white",
  },
};

export function TokenCard({ token, category }: TokenCardProps) {
  const config = categoryConfig[category];
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

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

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Calculate performance metrics (mock data for now - you can replace with real data)
  const getPerformanceMetrics = () => {
    const ageInHours =
      (Date.now() - token.created_timestamp) / (1000 * 60 * 60);
    const baseGain =
      category === "highestGainer"
        ? Math.max(1.5, (token.usd_market_cap / 1000000) * 2)
        : category === "fastestRunner"
        ? Math.max(1.2, Math.min(5, token.reply_count / 100))
        : Math.max(1.1, Math.min(10, 24 / Math.max(ageInHours, 1)));

    const currentGain = Math.max(1.1, baseGain);
    const highestGain = currentGain * (1 + Math.random() * 0.5);
    const calledPrice = token.usd_market_cap / currentGain;

    return {
      calledPrice,
      currentGain,
      highestGain,
      calledTime: getTimeAgo(token.created_timestamp),
    };
  };

  const metrics = getPerformanceMetrics();

  // Social media icon component with conditional rendering and tooltips
  const SocialIcon = ({
    icon: Icon,
    href,
    label,
    available,
  }: {
    icon: any;
    href?: string;
    label: string;
    available: boolean;
  }) => {
    if (available && href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-700/30 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all"
          title={label}
        >
          <Icon className="w-3 h-3" />
        </a>
      );
    }

    return (
      <div
        className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-800/50 flex items-center justify-center text-gray-600 cursor-not-allowed"
        title={`No ${label}`}
      >
        <Icon className="w-3 h-3" />
      </div>
    );
  };

  return (
    <Card
      className={`${config.bgColor} border-2 ${config.borderColor} backdrop-blur-sm h-[280px] sm:h-[320px]`}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header */}
        <div
          className={`p-3 sm:p-4 border-b border-white/20 flex-shrink-0 ${config.headerBg}`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl">{config.emoji}</span>
            <h3 className={`font-bold ${config.color} text-sm sm:text-base`}>
              {config.title}
            </h3>
          </div>
        </div>

        {/* Token Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          {/* Token Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* SHARP SQUARE TOKEN IMAGE - NO ROUNDED CORNERS */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 overflow-hidden bg-gray-800/50 border border-gray-600/30 relative flex-shrink-0">
                {token.image_uri && !imageError ? (
                  <img
                    src={token.image_uri || "/placeholder.svg"}
                    alt={token.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs sm:text-sm font-bold">
                    {token.symbol.slice(0, 3)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <h4 className="font-bold text-white text-lg sm:text-xl">
                    ${token.symbol}
                  </h4>
                  <button
                    onClick={() => copyToClipboard(token.mint)}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedAddress === token.mint ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
                <p className="text-gray-200 text-sm sm:text-base truncate font-medium mb-1">
                  {token.name || `Token ${token.symbol}`}
                </p>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={`font-bold ${config.color}`}>
                    MC: {formatMarketCap(token.usd_market_cap)}
                  </span>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">{token.reply_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Row - EXACTLY 5 ICONS AS SHOWN IN IMAGE */}
            <div className="flex gap-2">
              <SocialIcon
                icon={X}
                href={token.twitter}
                label="Twitter"
                available={!!token.twitter}
              />
              <SocialIcon
                icon={Star}
                href={token.website}
                label="Website"
                available={!!token.website}
              />
              <SocialIcon
                icon={MapPin}
                href={token.telegram}
                label="Telegram"
                available={!!token.telegram}
              />
              <SocialIcon
                icon={Heart}
                href="#"
                label="Favorites"
                available={false}
              />
              <SocialIcon
                icon={Users}
                href="#"
                label="Community"
                available={false}
              />
            </div>

            {/* Trade Button - NO ROUNDED CORNERS */}
            <TradeButtonWithModal
              mint={token.mint}
              symbol={token.symbol}
              className={`w-full ${config.buttonColor} font-bold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg`}
            />
          </div>

          {/* Performance Metrics at Bottom - NO ROUNDED CORNERS */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mt-3 sm:mt-4">
            <div
              className={`${config.cardBg} p-2 sm:p-3 border border-gray-600/20`}
            >
              <p className="text-xs text-gray-400 mb-1">
                Called {metrics.calledTime}
              </p>
              <p className="font-bold text-white text-xs sm:text-sm">
                {formatMarketCap(metrics.calledPrice)}
              </p>
            </div>
            <div
              className={`${config.cardBg} p-2 sm:p-3 border border-gray-600/20`}
            >
              <p className="text-xs text-gray-400 mb-1">Current Gain</p>
              <p
                className={`font-bold text-xs sm:text-sm ${
                  metrics.currentGain >= 1 ? "text-green-400" : "text-red-400"
                }`}
              >
                {metrics.currentGain.toFixed(1)}x
              </p>
            </div>
            <div
              className={`${config.cardBg} p-2 sm:p-3 border border-gray-600/20`}
            >
              <p className="text-xs text-gray-400 mb-1">Highest Gain</p>
              <p className={`font-bold text-xs sm:text-sm ${config.color}`}>
                {metrics.highestGain.toFixed(1)}x
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
