import type { TokenData } from "@/types/token";

export interface ApiResponse {
  success: boolean;
  tokens: TokenData[];
  source: string;
  count: number;
  error?: string;
  isRealData?: boolean;
  errors?: string;
}

export async function fetchRealTimeTokensFromServer(): Promise<ApiResponse> {
  // Only run on client side
  if (typeof window === "undefined") {
    console.log(
      "⚠️ fetchRealTimeTokensFromServer called on server, returning empty data"
    );
    return {
      success: false,
      tokens: [],
      source: "SERVER_SIDE_CALL",
      count: 0,
      error: "Cannot fetch from server on server side",
      isRealData: false,
    };
  }

  try {
    console.log("🔄 Client: Fetching from server API...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch("/api/real-tokens", {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    console.log(`📡 Server response status: ${response.status}`);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }

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

    // Validate response structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format");
    }

    if (!Array.isArray(data.tokens)) {
      console.warn("Tokens is not an array, attempting to fix...");
      data.tokens = [];
    }

    // Validate each token has required fields
    const validTokens = data.tokens.filter((token: any) => {
      return (
        token &&
        typeof token === "object" &&
        token.mint &&
        token.symbol &&
        token.name &&
        typeof token.usd_market_cap === "number"
      );
    });

    if (validTokens.length !== data.tokens.length) {
      console.warn(
        `Filtered out ${data.tokens.length - validTokens.length} invalid tokens`
      );
    }

    const result: ApiResponse = {
      ...data,
      tokens: validTokens,
      count: validTokens.length,
    };

    console.log(
      `✅ Client: Received ${result.count} valid tokens from ${result.source}`
    );
    console.log(
      `📊 Data quality: ${result.isRealData ? "REAL" : "FALLBACK"} data`
    );

    return result;
  } catch (error) {
    console.error("❌ Client: Complete failure:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        tokens: [],
        source: "REQUEST TIMEOUT",
        count: 0,
        error: "Request timed out after 25 seconds",
        isRealData: false,
      };
    }

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

// Enhanced categorization with better distribution
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

  // Enhanced sorting with multiple criteria
  const sortedTokens = [...tokens].sort((a, b) => {
    // Primary: Market cap
    const mcDiff = b.usd_market_cap - a.usd_market_cap;
    if (Math.abs(mcDiff) > 10000) return mcDiff;

    // Secondary: Activity (reply count)
    const activityDiff = b.reply_count - a.reply_count;
    if (Math.abs(activityDiff) > 50) return activityDiff;

    // Tertiary: Recency
    return b.created_timestamp - a.created_timestamp;
  });

  // More sophisticated categorization
  const highestGainer = sortedTokens
    .filter((token) => {
      const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
      return (
        token.usd_market_cap > 200000 || // High market cap
        (token.usd_market_cap > 50000 && token.reply_count > 200) || // Good activity
        (ageInHours > 24 && token.usd_market_cap > 100000)
      ); // Established
    })
    .slice(0, 12);

  const fastestRunner = sortedTokens
    .filter((token) => {
      const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
      return (
        !highestGainer.includes(token) &&
        ((token.usd_market_cap >= 20000 && token.usd_market_cap <= 500000) || // Mid-tier
          (token.reply_count > 100 && ageInHours < 48) || // Active and recent
          (ageInHours < 12 && token.usd_market_cap > 30000))
      ); // Recent with decent cap
    })
    .slice(0, 10);

  const gambleBox = sortedTokens
    .filter((token) => {
      const ageInHours = (now - token.created_timestamp) / (1000 * 60 * 60);
      return (
        !highestGainer.includes(token) &&
        !fastestRunner.includes(token) &&
        (ageInHours < 24 || // Very recent
          token.usd_market_cap < 100000 || // Low market cap
          (ageInHours < 6 && token.reply_count > 50))
      ); // Fresh with activity
    })
    .slice(0, 15);

  // If categories are still empty, distribute remaining tokens
  const allCategorized = [...highestGainer, ...fastestRunner, ...gambleBox];
  const remaining = sortedTokens.filter(
    (token) => !allCategorized.includes(token)
  );

  if (remaining.length > 0) {
    const remainingCount = remaining.length;
    const perCategory = Math.ceil(remainingCount / 3);

    if (highestGainer.length < 5) {
      highestGainer.push(
        ...remaining.slice(0, Math.min(perCategory, 5 - highestGainer.length))
      );
    }
    if (fastestRunner.length < 5) {
      const start = highestGainer.length;
      fastestRunner.push(
        ...remaining.slice(
          start,
          start + Math.min(perCategory, 5 - fastestRunner.length)
        )
      );
    }
    if (gambleBox.length < 5) {
      const start = highestGainer.length + fastestRunner.length;
      gambleBox.push(
        ...remaining.slice(
          start,
          start + Math.min(perCategory, 5 - gambleBox.length)
        )
      );
    }
  }

  const analytics = {
    totalTracked: tokens.length,
    recentGraduations: tokens.filter(
      (t) => t.complete && now - t.created_timestamp < 24 * 60 * 60 * 1000
    ).length,
    stageDistribution: {
      gamble: gambleBox.length,
      runner: fastestRunner.length,
      gainer: highestGainer.length,
    },
  };

  console.log("📊 Enhanced Token Categorization:", analytics);
  console.log("🏆 Highest Gainers:", highestGainer.length);
  console.log("⚡ Fastest Runners:", fastestRunner.length);
  console.log("🎲 Gamble Box:", gambleBox.length);

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
    analytics,
  };
}
