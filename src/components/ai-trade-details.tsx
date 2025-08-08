// NO 'use client' here! This must be a Server Component to be async.
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  FlameIcon as Fire,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { TradeButtonWithModal } from "./trade-modal";

// Import our server API instead
import { fetchRealTimeTokensFromServer } from "@/lib/integrations/client-api";

export async function AITradeDetails() {
  console.log(
    "OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY ? "Loaded but quota exceeded" : "Missing"
  );

  let realTokenData: any[] = [];
  let dataSource = "";
  let tokenCount = 0;

  try {
    // Fetch real token data from our server API
    console.log("Fetching token data for analysis...");
    const response = await fetchRealTimeTokensFromServer();
    realTokenData = response.tokens;
    dataSource = response.source;
    tokenCount = response.count;
    console.log(
      `Fetched ${realTokenData.length} tokens from ${response.source}`
    );
  } catch (error) {
    console.error("Failed to fetch token data:", error);
  }

  // Analyze tokens without AI - use algorithmic analysis
  const analyzeTokensAlgorithmically = (tokens: any[]) => {
    if (!tokens || tokens.length === 0) {
      return {
        overallDegenWinRate: 0,
        topDegenInsights: [],
        marketVibe: "No token data available. Check your connection.",
        totalTokensAnalyzed: 0,
      };
    }

    const now = Date.now();

    // Calculate algorithmic scores for each token
    const scoredTokens = tokens.map((token) => {
      const ageInHours = Math.floor(
        (now - token.created_timestamp) / (1000 * 60 * 60)
      );
      const ageInDays = ageInHours / 24;

      // Risk assessment based on real metrics
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME" = "MEDIUM";
      if (token.usd_market_cap < 10000 && ageInHours < 6) riskLevel = "EXTREME";
      else if (token.usd_market_cap < 50000 && ageInHours < 24)
        riskLevel = "HIGH";
      else if (token.usd_market_cap < 500000) riskLevel = "MEDIUM";
      else riskLevel = "LOW";

      // Win rate calculation based on market cap, age, and activity
      const marketCapScore = Math.min(
        Math.log10(token.usd_market_cap + 1) * 10,
        50
      );
      const ageScore =
        ageInHours < 1 ? 20 : ageInHours < 6 ? 15 : ageInHours < 24 ? 10 : 5;
      const activityScore = Math.min(token.reply_count / 10, 25);
      const socialScore =
        (token.twitter ? 5 : 0) +
        (token.telegram ? 5 : 0) +
        (token.website ? 5 : 0);

      const winRate = Math.min(
        Math.max(marketCapScore + ageScore + activityScore + socialScore, 5),
        95
      );

      // Generate algorithmic comments based on token characteristics
      let degenComment = "";
      if (riskLevel === "EXTREME") {
        degenComment =
          ageInHours < 1
            ? "🔥 ULTRA FRESH - Just launched, pure degen play"
            : "⚡ High risk, high reward - New token with potential";
      } else if (riskLevel === "HIGH") {
        degenComment =
          token.reply_count > 500
            ? "🚀 Strong community buzz, riding the wave"
            : "💎 Early stage gem, watch for momentum";
      } else if (riskLevel === "MEDIUM") {
        degenComment =
          token.usd_market_cap > 100000
            ? "📈 Established player, steady gains potential"
            : "🎯 Mid-tier play, balanced risk/reward";
      } else {
        degenComment = "🏆 Blue chip meme, safer degen play";
      }

      return {
        token: `$${token.symbol}`,
        mint: token.mint,
        symbol: token.symbol,
        winRate: Math.round(winRate),
        riskLevel,
        degenComment,
        marketCap: token.usd_market_cap,
        ageHours: ageInHours,
        score:
          winRate +
          (riskLevel === "EXTREME"
            ? 20
            : riskLevel === "HIGH"
            ? 15
            : riskLevel === "MEDIUM"
            ? 10
            : 5),
      };
    });

    // Sort by score and get top 3
    const topInsights = scoredTokens
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Calculate overall market sentiment
    const avgMarketCap =
      tokens.reduce((sum, t) => sum + t.usd_market_cap, 0) / tokens.length;
    const newTokensCount = tokens.filter(
      (t) => now - t.created_timestamp < 24 * 60 * 60 * 1000
    ).length;
    const highActivityCount = tokens.filter((t) => t.reply_count > 100).length;

    let marketVibe = "";
    let overallWinRate = 0;

    if (newTokensCount > tokens.length * 0.7) {
      marketVibe =
        "🔥 Market is HOT! Fresh tokens flooding in - degen season activated";
      overallWinRate = 75;
    } else if (
      avgMarketCap > 100000 &&
      highActivityCount > tokens.length * 0.5
    ) {
      marketVibe = "📈 Bullish vibes - established tokens showing strength";
      overallWinRate = 65;
    } else if (newTokensCount > tokens.length * 0.3) {
      marketVibe = "⚡ Mixed signals - some fresh plays, proceed with caution";
      overallWinRate = 45;
    } else {
      marketVibe =
        "😴 Market cooling down - fewer new launches, pick carefully";
      overallWinRate = 35;
    }

    return {
      overallDegenWinRate: overallWinRate,
      topDegenInsights: topInsights,
      marketVibe,
      totalTokensAnalyzed: tokens.length,
    };
  };

  const analysis = analyzeTokensAlgorithmically(realTokenData);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 font-heading">
        <Zap className="w-5 h-5" />
        REI9 DEGEN ALPHA
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 border border-blue-500/30">
          ALGORITHMIC
        </span>
        {realTokenData.length > 0 && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 border border-green-500/30">
            LIVE DATA
          </span>
        )}
      </h3>

      {/* API Status Notice - NO ROUNDED CORNERS */}
      <Card className="bg-yellow-900/20 border-yellow-500/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-400 font-bold">
            AI Analysis Temporarily Unavailable
          </p>
        </div>
        <p className="text-gray-300 text-sm">
          OpenAI quota exceeded. Using algorithmic analysis of {tokenCount} real
          tokens from: {dataSource}
        </p>
      </Card>

      {/* Overall Degen Win Rate - NO ROUNDED CORNERS */}
      <Card className="bg-black/50 border-green-500/20 p-4 text-center">
        <p className="text-gray-400 text-sm uppercase font-bold">
          Algorithmic Degen Win Rate
        </p>
        <p className="text-5xl font-black text-green-400 mt-2 font-heading">
          {analysis.overallDegenWinRate}%
        </p>
        <p className="text-gray-300 text-sm mt-2">{analysis.marketVibe}</p>
        <p className="text-gray-500 text-xs mt-1">
          Analyzed {analysis.totalTokensAnalyzed} live tokens algorithmically
        </p>
      </Card>

      <h4 className="text-lg font-bold text-white flex items-center gap-2 mt-8 font-heading">
        <Fire className="w-4 h-4 text-red-400" />
        Top Algorithmic Picks
      </h4>

      <div className="space-y-4">
        {analysis.topDegenInsights.length > 0 ? (
          analysis.topDegenInsights.map((insight, index) => (
            <Card key={index} className="bg-black/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white font-heading">
                      {insight.token}
                    </h4>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1">
                      {insight.ageHours}h old
                    </span>
                  </div>
                  <Badge
                    className={`font-bold uppercase ${
                      insight.riskLevel === "EXTREME"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : insight.riskLevel === "HIGH"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : insight.riskLevel === "MEDIUM"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    {insight.riskLevel} Risk
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.winRate >= 50 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={`font-bold ${
                        insight.winRate >= 50
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {insight.winRate}% Algo Score
                    </span>
                  </div>
                  <span className="text-green-400 font-bold">
                    $
                    {insight.marketCap >= 1000000
                      ? `${(insight.marketCap / 1000000).toFixed(1)}M`
                      : insight.marketCap >= 1000
                      ? `${(insight.marketCap / 1000).toFixed(1)}K`
                      : insight.marketCap.toFixed(0)}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-3">
                  {insight.degenComment}
                </p>

                {/* Trade Button with Modal - FIXED ALIGNMENT */}
                <div className="flex items-stretch gap-2">
                  <TradeButtonWithModal
                    mint={insight.mint}
                    symbol={insight.symbol}
                    className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 px-3 py-2 text-sm font-semibold transition-all flex items-center justify-center"
                  />

                  {/* Contract Address Display - MATCHED HEIGHT */}
                  <div className="bg-gray-800 text-gray-400 border border-gray-700 px-3 py-2 text-sm font-mono text-xs flex items-center gap-1 shrink-0">
                    <Copy className="w-3 h-3" />
                    {insight.mint.slice(0, 8)}...
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-black/50 border-red-500/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500">
                {realTokenData.length > 0
                  ? "Unable to analyze tokens. Check data quality."
                  : "No token data available. Check your connection."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Source Info - NO ROUNDED CORNERS */}
      <Card className="bg-gray-900/50 border-gray-700/30 p-3">
        <p className="text-gray-400 text-xs text-center">
          📊 Data Source: {dataSource} | Last Updated:{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </Card>
    </div>
  );
}
