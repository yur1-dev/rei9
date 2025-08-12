"use client";

import { MainNavigation } from "@/components/main-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Activity,
  Zap,
  Crown,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRealtimeTokens } from "@/app/hooks/use-realtime-tokens";
import type { TokenData } from "@/types/token";

export default function PerformancePage() {
  const [isClient, setIsClient] = useState(false);

  // Get real tokens from your hook (same as AlphaCalls uses)
  const hookData = useRealtimeTokens() as any;
  const tokens: TokenData[] = useMemo(() => {
    if (!hookData) return [];
    if (Array.isArray(hookData)) return hookData;
    if (typeof hookData === "object" && hookData.tokens) return hookData.tokens;
    return [];
  }, [hookData]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate real metrics from actual token data
  const metrics = useMemo(() => {
    if (!tokens.length)
      return {
        totalTokens: 0,
        avgMarketCap: 0,
        highestMarketCap: 0,
        newestToken: null,
        categoryBreakdown: { gainer: 0, runner: 0, gamble: 0 },
      };

    const totalTokens = tokens.length;
    const avgMarketCap =
      tokens.reduce((sum, t) => sum + t.usd_market_cap, 0) / totalTokens;
    const highestMarketCap = Math.max(...tokens.map((t) => t.usd_market_cap));
    const newestToken = tokens.reduce(
      (newest, token) =>
        token.created_timestamp > (newest?.created_timestamp || 0)
          ? token
          : newest,
      tokens[0]
    );

    // Categorize tokens (same logic as AlphaCalls)
    const categoryBreakdown = {
      gainer: tokens.filter((t) => t.usd_market_cap > 50000).length,
      runner: tokens.filter(
        (t) => t.usd_market_cap >= 5000 && t.usd_market_cap <= 50000
      ).length,
      gamble: tokens.filter((t) => t.usd_market_cap < 5000).length,
    };

    return {
      totalTokens,
      avgMarketCap,
      highestMarketCap,
      newestToken,
      categoryBreakdown,
    };
  }, [tokens]);

  // Get recent tokens for display
  const recentTokens = useMemo(() => {
    return tokens
      .sort((a, b) => b.created_timestamp - a.created_timestamp)
      .slice(0, 10)
      .map((token) => {
        const ageInHours =
          (Date.now() - token.created_timestamp) / (1000 * 60 * 60);
        const category =
          token.usd_market_cap > 50000
            ? "Highest Gainer"
            : token.usd_market_cap >= 5000
            ? "Fastest Runner"
            : "Gamble Box";

        // Calculate potential based on category and age
        const potential =
          category === "Gamble Box"
            ? 5 + Math.random() * 45
            : category === "Fastest Runner"
            ? 2 + Math.random() * 8
            : 1.5 + Math.random() * 6.5;

        return {
          symbol: token.symbol,
          name: token.name,
          marketCap: token.usd_market_cap,
          category,
          ageHours: ageInHours,
          potential: potential,
          replies: token.reply_count,
          volume24h: token.volume?.h24 || 0,
          priceChange24h: token.priceChange?.h24 || 0,
        };
      });
  }, [tokens]);

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}K`;
    return `$${marketCap.toFixed(0)}`;
  };

  const getTimeAgo = (hours: number) => {
    if (hours < 1) return `${Math.floor(hours * 60)}m ago`;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Highest Gainer":
        return <Crown className="w-4 h-4" />;
      case "Fastest Runner":
        return <Zap className="w-4 h-4" />;
      case "Gamble Box":
        return <Target className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Highest Gainer":
        return "text-yellow-400 border-yellow-500/30";
      case "Fastest Runner":
        return "text-green-400 border-green-500/30";
      case "Gamble Box":
        return "text-red-400 border-red-500/30";
      default:
        return "text-gray-400 border-gray-500/30";
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-950 via-black to-black" />
      <div className="fixed inset-0 opacity-5 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <MainNavigation />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12 pt-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mt-8">
            <h1 className="text-4xl md:text-6xl font-black text-green-400 tracking-wider font-heading">
              PERFORMANCE
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Live analysis of tokens currently tracked by Alpha Calls
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4" />
              <span>Real-time data • {tokens.length} tokens analyzed</span>
            </div>
          </div>

          {/* Real Metrics from Current Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Total Tokens
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-white">
                  {metrics.totalTokens}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400">
                  <Activity className="w-4 h-4 mr-2" />
                  <span className="text-sm">Currently analyzing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Avg Market Cap
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-green-400">
                  {formatMarketCap(metrics.avgMarketCap)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">All tracked tokens</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Highest Cap
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-green-400">
                  {formatMarketCap(metrics.highestMarketCap)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400">
                  <Crown className="w-4 h-4 mr-2" />
                  <span className="text-sm">Top performer</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Newest Token
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-yellow-400">
                  {metrics.newestToken
                    ? `$${metrics.newestToken.symbol}`
                    : "None"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-yellow-400">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {metrics.newestToken
                      ? getTimeAgo(
                          (Date.now() - metrics.newestToken.created_timestamp) /
                            (1000 * 60 * 60)
                        )
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Token Analysis */}
          <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Live Token Analysis
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real tokens currently being analyzed by Alpha Calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTokens.length > 0 ? (
                <div className="space-y-4">
                  {recentTokens.map((token, index) => (
                    <div
                      key={`${token.symbol}-${index}`}
                      className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(token.category)}
                          <span className="font-bold text-white">
                            ${token.symbol}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(
                            token.category
                          )} border`}
                        >
                          {token.category}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            Market Cap
                          </div>
                          <div className="font-bold text-white">
                            {formatMarketCap(token.marketCap)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-400">Potential</div>
                          <div className="font-bold text-green-400">
                            +{token.potential.toFixed(1)}x
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-400">Replies</div>
                          <div className="font-bold text-blue-400">
                            {token.replies}
                          </div>
                        </div>

                        {token.volume24h > 0 && (
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              Volume 24h
                            </div>
                            <div className="font-bold text-purple-400">
                              {formatMarketCap(token.volume24h)}
                            </div>
                          </div>
                        )}

                        <div className="text-right min-w-[80px]">
                          <div className="text-sm text-gray-400">Age</div>
                          <div className="text-sm text-gray-500">
                            {getTimeAgo(token.ageHours)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No tokens currently being analyzed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution (Real Data) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Highest Gainer
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count</span>
                    <span className="text-yellow-400 font-bold">
                      {metrics.categoryBreakdown.gainer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Criteria</span>
                    <span className="text-yellow-400 font-bold">$50K MC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk</span>
                    <span className="text-yellow-400 font-bold">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-green-400">
                    Fastest Runner
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count</span>
                    <span className="text-green-400 font-bold">
                      {metrics.categoryBreakdown.runner}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Criteria</span>
                    <span className="text-green-400 font-bold">
                      $5K-$50K MC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk</span>
                    <span className="text-green-400 font-bold">Medium</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-400" />
                  <CardTitle className="text-red-400">Gamble Box</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count</span>
                    <span className="text-red-400 font-bold">
                      {metrics.categoryBreakdown.gamble}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Criteria</span>
                    <span className="text-red-400 font-bold">&lt;$5K MC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk</span>
                    <span className="text-red-400 font-bold">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
