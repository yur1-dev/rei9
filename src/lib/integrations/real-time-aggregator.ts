import { TokenData } from "@/types/token";
import {
  fetchSolanaStreamTokens,
  fetchSolanaStreamNewTokens,
  SolanaStreamToken,
} from "./solana-stream-api";
import {
  fetchPumpPortalTokens,
  fetchPumpPortalTrendingTokens,
  PumpPortalToken,
} from "./pump-portal-api";
import {
  fetchKolScanTrendingTokens,
  fetchKolScanNewTokens,
  KolScanToken,
} from "./kolscan-api";

// Convert different API formats to our unified TokenData format
function convertSolanaStreamToken(token: SolanaStreamToken): TokenData {
  return {
    mint: token.mint,
    name: token.name,
    symbol: token.symbol,
    description: token.description || "",
    image_uri: token.image || "",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "",
    created_timestamp: new Date(token.createdAt).getTime(),
    complete: token.marketCap > 100000, // Assume complete if high market cap
    virtual_sol_reserves: token.liquidity,
    virtual_token_reserves: 0,
    total_supply: 1000000000,
    show_name: true,
    market_cap: token.marketCap,
    reply_count: token.holders,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: token.marketCap,
    twitter: token.twitter,
    telegram: token.telegram,
    website: token.website,
  };
}

function convertPumpPortalToken(token: PumpPortalToken): TokenData {
  return {
    mint: token.mint,
    name: token.name,
    symbol: token.symbol,
    description: token.description,
    image_uri: token.image_uri,
    metadata_uri: token.metadata_uri,
    bonding_curve: token.bonding_curve,
    associated_bonding_curve: token.associated_bonding_curve,
    creator: token.creator,
    created_timestamp: token.created_timestamp,
    complete: token.complete,
    virtual_sol_reserves: token.virtual_sol_reserves,
    virtual_token_reserves: token.virtual_token_reserves,
    total_supply: token.total_supply,
    show_name: true,
    market_cap: token.market_cap,
    reply_count: token.reply_count,
    nsfw: token.nsfw,
    is_currently_live: !token.complete,
    usd_market_cap: token.usd_market_cap,
    twitter: token.twitter,
    telegram: token.telegram,
    website: token.website,
  };
}

function convertKolScanToken(token: KolScanToken): TokenData {
  return {
    mint: token.mint,
    name: token.name,
    symbol: token.symbol,
    description: token.description || "",
    image_uri: token.image || "",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "",
    created_timestamp: new Date(token.createdAt).getTime(),
    complete: token.marketCap > 100000,
    virtual_sol_reserves: token.metrics.liquidity,
    virtual_token_reserves: 0,
    total_supply: 1000000000,
    show_name: true,
    market_cap: token.marketCap,
    reply_count: token.holders,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: token.marketCap,
    twitter: token.social?.twitter,
    telegram: token.social?.telegram,
    website: token.social?.website,
  };
}

// Enhanced mock data as fallback
const enhancedMockTokens: TokenData[] = [
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

// Aggregate data from all sources with robust fallback
export async function fetchRealTimeTokens(): Promise<TokenData[]> {
  const allTokens: TokenData[] = [];
  const errors: string[] = [];
  let successfulSources = 0;

  console.log("🚀 Starting multi-source token fetch...");

  // Try PumpPortal first (most reliable)
  try {
    console.log("Fetching from PumpPortal...");
    const pumpPortalTokens = await fetchPumpPortalTokens();
    if (pumpPortalTokens && pumpPortalTokens.length > 0) {
      const convertedPumpPortal = pumpPortalTokens.map(convertPumpPortalToken);
      allTokens.push(...convertedPumpPortal);
      successfulSources++;
      console.log(`✅ PumpPortal: ${convertedPumpPortal.length} tokens`);
    }
  } catch (error) {
    console.error("❌ PumpPortal failed:", error);
    errors.push("PumpPortal");
  }

  // Try SolanaStream (requires auth)
  try {
    console.log("Fetching from SolanaStream...");
    const solanaStreamTokens = await fetchSolanaStreamTokens();
    if (solanaStreamTokens && solanaStreamTokens.length > 0) {
      const convertedSolanaStream = solanaStreamTokens.map(
        convertSolanaStreamToken
      );
      allTokens.push(...convertedSolanaStream);
      successfulSources++;
      console.log(`✅ SolanaStream: ${convertedSolanaStream.length} tokens`);
    }
  } catch (error) {
    console.error("❌ SolanaStream failed:", error);
    errors.push("SolanaStream");
  }

  // Try KolScan
  try {
    console.log("Fetching from KolScan...");
    const kolScanTokens = await fetchKolScanTrendingTokens();
    if (kolScanTokens && kolScanTokens.length > 0) {
      const convertedKolScan = kolScanTokens.map(convertKolScanToken);
      allTokens.push(...convertedKolScan);
      successfulSources++;
      console.log(`✅ KolScan: ${convertedKolScan.length} tokens`);
    }
  } catch (error) {
    console.error("❌ KolScan failed:", error);
    errors.push("KolScan");
  }

  // If no sources worked, use enhanced mock data
  if (allTokens.length === 0) {
    console.log("⚠️ All APIs failed, using enhanced mock data");
    allTokens.push(...enhancedMockTokens);
  }

  // Remove duplicates based on mint address
  const uniqueTokens = allTokens.filter(
    (token, index, self) =>
      index === self.findIndex((t) => t.mint === token.mint)
  );

  console.log(
    `🎯 Final result: ${uniqueTokens.length} unique tokens from ${successfulSources} sources`
  );
  console.log(`⚠️ Failed sources: ${errors.join(", ") || "None"}`);

  return uniqueTokens;
}

// Categorize real tokens with sophisticated logic
export function categorizeRealTokens(tokens: TokenData[]): {
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
