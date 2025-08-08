import { TokenData } from "@/types/token";

export interface ApiResponse {
  success: boolean;
  tokens: TokenData[];
  source: string;
  count: number;
  error?: string;
}

export async function fetchRealTimeTokensFromServer(): Promise<ApiResponse> {
  try {
    console.log("🔄 Client: Fetching from server API...");

    // Handle both client and server environments
    const baseUrl =
      typeof window !== "undefined"
        ? "" // Client-side: use relative URL
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"; // Server-side: use absolute URL

    const response = await fetch(`${baseUrl}/api/real-tokens`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`Server API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log(`✅ Client: Received ${data.count} tokens from ${data.source}`);

    return data;
  } catch (error) {
    console.error("❌ Client: Server API failed:", error);
    throw error;
  }
}

// Categorize tokens with sophisticated logic
export function categorizeTokens(tokens: TokenData[]): {
  highestGainer: TokenData[];
  fastestRunner: TokenData[];
  gambleBox: TokenData[];
} {
  if (!tokens || tokens.length === 0) {
    return {
      highestGainer: [],
      fastestRunner: [],
      gambleBox: [],
    };
  }

  const now = Date.now();

  // Calculate scores for each token
  const tokensWithScores = tokens.map((token) => {
    const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
    const ageInDays = ageInHours / 24;

    // Highest Gainer: Established tokens with high market cap and activity
    const establishmentScore = Math.min(ageInDays * 10, 100);
    const marketCapScore = Math.log10(token.usd_market_cap + 1) * 15;
    const activityScore = Math.log10(token.reply_count + 1) * 10;
    const momentumScore = establishmentScore + marketCapScore + activityScore;

    // Fastest Runner: Mid-tier tokens with good momentum
    const velocityScore =
      (token.reply_count > 100 ? 50 : 0) +
      (token.usd_market_cap > 50000 && token.usd_market_cap < 1000000
        ? 40
        : 0) +
      (ageInHours < 24 ? 30 : 0);

    // Gamble Box: New tokens with potential
    const freshnessScore = ageInHours < 2 ? 100 : ageInHours < 12 ? 70 : 30;
    const riskScore = freshnessScore + (token.usd_market_cap < 100000 ? 50 : 0);

    return {
      ...token,
      momentumScore,
      velocityScore,
      riskScore,
      ageInHours,
    };
  });

  // Sort and categorize
  const highestGainer = tokensWithScores
    .filter(
      (token) => token.usd_market_cap > 500000 || token.momentumScore > 80
    )
    .sort((a, b) => b.momentumScore - a.momentumScore)
    .slice(0, 10);

  const fastestRunner = tokensWithScores
    .filter(
      (token) =>
        token.usd_market_cap >= 10000 &&
        token.usd_market_cap <= 1000000 &&
        token.reply_count > 50 &&
        !highestGainer.includes(token)
    )
    .sort((a, b) => b.velocityScore - a.velocityScore)
    .slice(0, 8);

  const gambleBox = tokensWithScores
    .filter(
      (token) =>
        token.ageInHours < 24 &&
        token.usd_market_cap < 200000 &&
        !highestGainer.includes(token) &&
        !fastestRunner.includes(token)
    )
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 12);

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
  };
}
