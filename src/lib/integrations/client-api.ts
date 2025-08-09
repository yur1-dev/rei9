import type { TokenData } from "@/types/token";

export interface ApiResponse {
  success: boolean;
  tokens: TokenData[];
  source: string;
  count: number;
  error?: string;
  isRealData?: boolean;
}

export async function fetchRealTimeTokensFromServer(): Promise<ApiResponse> {
  try {
    console.log("🔄 Client: Fetching from server API...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    const response = await fetch("/api/real-tokens", {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    console.log(`📡 Server response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Server API error: ${response.status}`, errorData);

      return {
        success: false,
        tokens: [],
        source: `SERVER ERROR ${response.status}`,
        count: 0,
        error: errorData.error || `Server returned ${response.status}`,
        isRealData: false,
      };
    }

    const data: ApiResponse = await response.json();
    console.log(`✅ Client: Received ${data.count} tokens from ${data.source}`);

    return data;
  } catch (error) {
    console.error("❌ Client: Complete failure:", error);

    return {
      success: false,
      tokens: [],
      source: "CLIENT ERROR",
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      isRealData: false,
    };
  }
}

// Enhanced categorization
export function categorizeTokens(tokens: TokenData[]): {
  highestGainer: TokenData[];
  fastestRunner: TokenData[];
  gambleBox: TokenData[];
  analytics: {
    totalTracked: number;
    recentGraduations: number;
    stageDistribution: { gamble: number; runner: number; gainer: number };
  };
} {
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

  // Sort tokens by market cap and age
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

  const analytics = {
    totalTracked: tokens.length,
    recentGraduations: 0,
    stageDistribution: {
      gamble: gambleBox.length,
      runner: fastestRunner.length,
      gainer: highestGainer.length,
    },
  };

  console.log("📊 Token Categorization:", analytics);

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
    analytics,
  };
}
