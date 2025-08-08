import { TokenData } from "@/types/token";

// Enhanced mock data that will definitely work
const enhancedMockTokens: TokenData[] = [
  // Highest Gainer tokens (established, high market cap)
  {
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW2hr",
    name: "Gorbagana",
    symbol: "GOR",
    description: "The legendary meme that conquered Solana",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111112",
    created_timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    complete: true,
    virtual_sol_reserves: 500,
    virtual_token_reserves: 800000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 28600000,
    reply_count: 17500,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 28600000,
    twitter: "https://twitter.com/gorbagana",
    telegram: "https://t.me/gorbagana",
  },
  {
    mint: "8GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW3hr",
    name: "Pepe Kingdom",
    symbol: "PEPEK",
    description: "The royal pepe has arrived",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111113",
    created_timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    complete: true,
    virtual_sol_reserves: 300,
    virtual_token_reserves: 600000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 15200000,
    reply_count: 12400,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 15200000,
    twitter: "https://twitter.com/pepekingdom",
  },

  // Fastest Runner tokens (mid-tier, good momentum)
  {
    mint: "AGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW5hr",
    name: "Trench Island",
    symbol: "STI",
    description: "Island vibes meet crypto gains",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111115",
    created_timestamp: Date.now() - 25 * 60 * 1000, // 25 minutes ago
    complete: false,
    virtual_sol_reserves: 80,
    virtual_token_reserves: 300000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 176800,
    reply_count: 888,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 176800,
    telegram: "https://t.me/trenchisland",
    website: "https://trenchisland.com",
  },
  {
    mint: "BGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW6hr",
    name: "Velocity Cat",
    symbol: "VCAT",
    description: "Fast as lightning, cute as a kitten",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111116",
    created_timestamp: Date.now() - 15 * 60 * 1000, // 15 minutes ago
    complete: false,
    virtual_sol_reserves: 45,
    virtual_token_reserves: 250000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 89500,
    reply_count: 456,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 89500,
    twitter: "https://twitter.com/velocitycat",
  },

  // Gamble Box tokens (new, high risk)
  {
    mint: "DGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW8hr",
    name: "DUMB AI",
    symbol: "GRUK",
    description: "AI so dumb it might just work",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111118",
    created_timestamp: Date.now() - 9 * 60 * 1000, // 9 minutes ago
    complete: false,
    virtual_sol_reserves: 15,
    virtual_token_reserves: 120000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 130000,
    reply_count: 997,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 130000,
    twitter: "https://twitter.com/dumbai",
  },
  {
    mint: "EGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW9hr",
    name: "Chaos Monkey",
    symbol: "CHAOS",
    description: "Pure chaos in token form",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111119",
    created_timestamp: Date.now() - 3 * 60 * 1000, // 3 minutes ago
    complete: false,
    virtual_sol_reserves: 8,
    virtual_token_reserves: 80000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 45600,
    reply_count: 234,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 45600,
    telegram: "https://t.me/chaosmonkey",
  },
];

export async function fetchTokens(limit: number = 50): Promise<TokenData[]> {
  try {
    const response = await fetch(
      `/api/tokens?limit=${limit}&sort=created_timestamp`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }

    // Always fallback to mock data
    console.log("Using enhanced mock data");
    return enhancedMockTokens;
  } catch (error) {
    console.error("Error fetching tokens, using mock data:", error);
    return enhancedMockTokens;
  }
}

export async function fetchTokensByMarketCap(
  limit: number = 50
): Promise<TokenData[]> {
  try {
    const response = await fetch(`/api/tokens?limit=${limit}&sort=market_cap`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }

    return [...enhancedMockTokens].sort(
      (a, b) => b.usd_market_cap - a.usd_market_cap
    );
  } catch (error) {
    console.error("Error fetching tokens by market cap:", error);
    return [...enhancedMockTokens].sort(
      (a, b) => b.usd_market_cap - a.usd_market_cap
    );
  }
}

export function categorizeTokens(tokens: TokenData[]): {
  highestGainer: TokenData[];
  fastestRunner: TokenData[];
  gambleBox: TokenData[];
} {
  // Always ensure we have tokens to work with
  const workingTokens =
    tokens && tokens.length > 0 ? tokens : enhancedMockTokens;

  console.log("Categorizing tokens:", workingTokens.length);

  // Simple but effective categorization that guarantees results
  const highestGainer = workingTokens
    .filter((token) => token.usd_market_cap > 1000000) // Over 1M
    .sort((a, b) => b.usd_market_cap - a.usd_market_cap);

  const fastestRunner = workingTokens
    .filter(
      (token) =>
        token.usd_market_cap > 50000 &&
        token.usd_market_cap <= 1000000 &&
        !highestGainer.includes(token)
    )
    .sort((a, b) => b.reply_count - a.reply_count);

  const gambleBox = workingTokens
    .filter(
      (token) =>
        token.usd_market_cap <= 200000 &&
        !highestGainer.includes(token) &&
        !fastestRunner.includes(token)
    )
    .sort((a, b) => b.created_timestamp - a.created_timestamp);

  // Ensure each category has at least one token by using fallbacks
  const result = {
    highestGainer:
      highestGainer.length > 0
        ? highestGainer
        : [workingTokens[0], workingTokens[1]].filter(Boolean),
    fastestRunner:
      fastestRunner.length > 0
        ? fastestRunner
        : [workingTokens[2], workingTokens[3]].filter(Boolean),
    gambleBox:
      gambleBox.length > 0
        ? gambleBox
        : [workingTokens[4], workingTokens[5]].filter(Boolean),
  };

  console.log("Final categorization result:", {
    highestGainer: result.highestGainer.length,
    fastestRunner: result.fastestRunner.length,
    gambleBox: result.gambleBox.length,
    totalInput: workingTokens.length,
  });

  return result;
}
