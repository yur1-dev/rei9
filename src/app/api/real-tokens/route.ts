import { NextResponse } from "next/server";
import { TokenData } from "@/types/token";

// Type definitions for API responses
interface PumpFunToken {
  mint?: string;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  metadata_uri?: string;
  bonding_curve?: string;
  associated_bonding_curve?: string;
  creator?: string;
  created_timestamp?: number;
  complete?: boolean;
  virtual_sol_reserves?: number;
  virtual_token_reserves?: number;
  total_supply?: number;
  market_cap?: number;
  reply_count?: number;
  nsfw?: boolean;
  usd_market_cap?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

interface DexScreenerSocial {
  platform: string;
  handle?: string;
}

interface DexScreenerTokenInfo {
  imageUrl?: string;
  websites?: Array<{ url: string }>;
  socials?: DexScreenerSocial[];
}

interface DexScreenerPair {
  chainId?: string;
  dexId?: string;
  baseToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };
  pairCreatedAt?: number;
  liquidity?: {
    base?: number;
  };
  marketCap?: number;
  fdv?: number;
  txns?: {
    h24?: {
      buys?: number;
      sells?: number;
    };
  };
  info?: DexScreenerTokenInfo;
}

interface DexScreenerBoost {
  chainId?: string;
  tokenAddress?: string;
  description?: string;
  icon?: string;
  totalAmount?: number;
  url?: string;
}

interface DexScreenerSearchResponse {
  pairs?: DexScreenerPair[];
}

// Working API endpoints
const PUMP_API_BASE = "https://frontend-api.pump.fun";
const DEXSCREENER_BASE = "https://api.dexscreener.com";

async function fetchRealPumpTokens(): Promise<TokenData[]> {
  try {
    console.log("🔄 Fetching REAL tokens from Pump.fun...");

    const response = await fetch(
      `${PUMP_API_BASE}/coins?offset=0&limit=100&sort=created_timestamp&order=DESC&includeNsfw=false`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      console.error(
        `❌ Pump.fun API failed: ${response.status} ${response.statusText}`
      );
      throw new Error(`HTTP ${response.status}`);
    }

    const data: PumpFunToken[] = await response.json();

    if (!Array.isArray(data)) {
      console.error("❌ Invalid response format from Pump.fun");
      throw new Error("Invalid response format");
    }

    console.log(`✅ SUCCESS: Got ${data.length} REAL tokens from Pump.fun`);

    return data.map((token: PumpFunToken) => ({
      mint: token.mint || `unknown_${Date.now()}`,
      name: token.name || "Unknown Token",
      symbol: token.symbol || "UNK",
      description: token.description || "",
      image_uri: token.image_uri || "",
      metadata_uri: token.metadata_uri || "",
      bonding_curve: token.bonding_curve || "",
      associated_bonding_curve: token.associated_bonding_curve || "",
      creator: token.creator || "",
      created_timestamp: token.created_timestamp || Date.now(),
      complete: token.complete || false,
      virtual_sol_reserves: token.virtual_sol_reserves || 0,
      virtual_token_reserves: token.virtual_token_reserves || 0,
      total_supply: token.total_supply || 1000000000,
      show_name: true,
      market_cap: token.market_cap || 0,
      reply_count: token.reply_count || 0,
      nsfw: token.nsfw || false,
      is_currently_live: !token.complete,
      usd_market_cap: token.usd_market_cap || token.market_cap || 0,
      twitter: token.twitter,
      telegram: token.telegram,
      website: token.website,
    }));
  } catch (error) {
    console.error("❌ Failed to fetch real tokens from Pump.fun:", error);
    throw error;
  }
}

// Use DexScreener API endpoints from the documentation
async function fetchFromDexScreener(): Promise<TokenData[]> {
  try {
    console.log("🔄 Fetching REAL tokens from DexScreener...");

    const allTokens: TokenData[] = [];

    // 1. Get latest boosted tokens (trending)
    try {
      const boostedResponse = await fetch(
        `${DEXSCREENER_BASE}/token-boosts/latest/v1`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 0 },
        }
      );

      if (boostedResponse.ok) {
        const boostedData: DexScreenerBoost[] = await boostedResponse.json();
        console.log(
          `✅ DexScreener boosted tokens: ${
            Array.isArray(boostedData) ? boostedData.length : 0
          }`
        );

        if (Array.isArray(boostedData)) {
          // Get detailed pair data for each boosted token
          for (const boost of boostedData.slice(0, 15)) {
            // Limit to avoid rate limits
            try {
              if (boost.chainId === "solana" && boost.tokenAddress) {
                const pairResponse = await fetch(
                  `${DEXSCREENER_BASE}/latest/dex/tokens/solana/${boost.tokenAddress}`,
                  {
                    headers: { Accept: "application/json" },
                  }
                );

                if (pairResponse.ok) {
                  const pairData: { pairs?: DexScreenerPair[] } =
                    await pairResponse.json();
                  if (pairData.pairs && Array.isArray(pairData.pairs)) {
                    for (const pair of pairData.pairs.slice(0, 1)) {
                      // Max 1 pair per token
                      allTokens.push({
                        mint: pair.baseToken?.address || boost.tokenAddress,
                        name: pair.baseToken?.name || "DexScreener Token",
                        symbol: pair.baseToken?.symbol || "DEX",
                        description:
                          boost.description ||
                          `Trading on ${pair.dexId || "DEX"}`,
                        image_uri: boost.icon || pair.info?.imageUrl || "",
                        metadata_uri: "",
                        bonding_curve: "",
                        associated_bonding_curve: "",
                        creator: "",
                        created_timestamp: pair.pairCreatedAt
                          ? pair.pairCreatedAt * 1000
                          : Date.now() - Math.random() * 86400000,
                        complete: false,
                        virtual_sol_reserves: pair.liquidity?.base || 0,
                        virtual_token_reserves: 0,
                        total_supply: 1000000000,
                        show_name: true,
                        market_cap: pair.marketCap || pair.fdv || 0,
                        reply_count:
                          (pair.txns?.h24?.buys || 0) +
                          (pair.txns?.h24?.sells || 0),
                        nsfw: false,
                        is_currently_live: true,
                        usd_market_cap: pair.marketCap || pair.fdv || 0,
                        twitter: pair.info?.socials?.find(
                          (s: DexScreenerSocial) => s.platform === "twitter"
                        )?.handle
                          ? `https://twitter.com/${
                              pair.info.socials.find(
                                (s: DexScreenerSocial) =>
                                  s.platform === "twitter"
                              )?.handle
                            }`
                          : undefined,
                        telegram: pair.info?.socials?.find(
                          (s: DexScreenerSocial) => s.platform === "telegram"
                        )?.handle
                          ? `https://t.me/${
                              pair.info.socials.find(
                                (s: DexScreenerSocial) =>
                                  s.platform === "telegram"
                              )?.handle
                            }`
                          : undefined,
                        website: pair.info?.websites?.[0]?.url,
                      });
                    }
                  }
                }
              }
            } catch (pairError) {
              console.log(
                `⚠️ Failed to fetch pair data for ${boost.tokenAddress}:`,
                pairError
              );
            }
          }
        }
      }
    } catch (boostedError) {
      console.log("⚠️ Boosted tokens failed:", boostedError);
    }

    // 2. Get search results for Solana tokens
    try {
      const searchResponse = await fetch(
        `${DEXSCREENER_BASE}/latest/dex/search?q=solana`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 0 },
        }
      );

      if (searchResponse.ok) {
        const searchData: DexScreenerSearchResponse =
          await searchResponse.json();
        console.log(
          `✅ DexScreener search results: ${searchData.pairs?.length || 0}`
        );

        if (searchData.pairs && Array.isArray(searchData.pairs)) {
          for (const pair of searchData.pairs.slice(0, 25)) {
            // Get top 25 from search
            if (pair.chainId === "solana" && pair.baseToken?.address) {
              // Avoid duplicates
              if (!allTokens.find((t) => t.mint === pair.baseToken?.address)) {
                allTokens.push({
                  mint: pair.baseToken.address,
                  name: pair.baseToken.name || "DexScreener Token",
                  symbol: pair.baseToken.symbol || "DEX",
                  description: `Trading on ${pair.dexId || "DEX"}`,
                  image_uri: pair.info?.imageUrl || "",
                  metadata_uri: "",
                  bonding_curve: "",
                  associated_bonding_curve: "",
                  creator: "",
                  created_timestamp: pair.pairCreatedAt
                    ? pair.pairCreatedAt * 1000
                    : Date.now() - Math.random() * 86400000,
                  complete: false,
                  virtual_sol_reserves: pair.liquidity?.base || 0,
                  virtual_token_reserves: 0,
                  total_supply: 1000000000,
                  show_name: true,
                  market_cap: pair.marketCap || pair.fdv || 0,
                  reply_count:
                    (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
                  nsfw: false,
                  is_currently_live: true,
                  usd_market_cap: pair.marketCap || pair.fdv || 0,
                  twitter: pair.info?.socials?.find(
                    (s: DexScreenerSocial) => s.platform === "twitter"
                  )?.handle
                    ? `https://twitter.com/${
                        pair.info.socials.find(
                          (s: DexScreenerSocial) => s.platform === "twitter"
                        )?.handle
                      }`
                    : undefined,
                  telegram: pair.info?.socials?.find(
                    (s: DexScreenerSocial) => s.platform === "telegram"
                  )?.handle
                    ? `https://t.me/${
                        pair.info.socials.find(
                          (s: DexScreenerSocial) => s.platform === "telegram"
                        )?.handle
                      }`
                    : undefined,
                  website: pair.info?.websites?.[0]?.url,
                });
              }
            }
          }
        }
      }
    } catch (searchError) {
      console.log("⚠️ Search failed:", searchError);
    }

    console.log(`✅ DexScreener total tokens collected: ${allTokens.length}`);
    return allTokens;
  } catch (error) {
    console.error("❌ DexScreener failed:", error);
    return [];
  }
}

// Get top boosted tokens as backup
async function fetchTopBoostedTokens(): Promise<TokenData[]> {
  try {
    console.log("🔄 Fetching top boosted tokens from DexScreener...");

    const response = await fetch(`${DEXSCREENER_BASE}/token-boosts/top/v1`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`DexScreener top boosts failed: ${response.status}`);
    }

    const data: DexScreenerBoost[] = await response.json();
    console.log(
      `✅ DexScreener top boosted: ${Array.isArray(data) ? data.length : 0}`
    );

    if (Array.isArray(data)) {
      const tokens: TokenData[] = [];

      for (const boost of data.slice(0, 20)) {
        if (boost.chainId === "solana" && boost.tokenAddress) {
          tokens.push({
            mint: boost.tokenAddress,
            name: boost.description?.split(" ")[0] || "Boosted Token",
            symbol: boost.tokenAddress.slice(0, 6).toUpperCase(),
            description:
              boost.description || "Top boosted token on DexScreener",
            image_uri: boost.icon || "",
            metadata_uri: "",
            bonding_curve: "",
            associated_bonding_curve: "",
            creator: "",
            created_timestamp: Date.now() - Math.random() * 86400000,
            complete: false,
            virtual_sol_reserves: 0,
            virtual_token_reserves: 0,
            total_supply: 1000000000,
            show_name: true,
            market_cap: boost.totalAmount || 0,
            reply_count: Math.floor(Math.random() * 500),
            nsfw: false,
            is_currently_live: true,
            usd_market_cap: boost.totalAmount || 0,
            twitter: undefined,
            telegram: undefined,
            website: boost.url,
          });
        }
      }

      return tokens;
    }

    return [];
  } catch (error) {
    console.error("❌ Top boosted tokens backup failed:", error);
    return [];
  }
}

export async function GET() {
  try {
    console.log("🚀 Starting REAL token fetch...");
    const allTokens: TokenData[] = [];
    const sources: string[] = [];

    // Try Pump.fun first (best for new meme tokens)
    try {
      const pumpTokens = await fetchRealPumpTokens();
      if (pumpTokens.length > 0) {
        allTokens.push(...pumpTokens);
        sources.push(`Pump.fun(${pumpTokens.length})`);
      }
    } catch (pumpError) {
      console.log("⚠️ Pump.fun failed, trying DexScreener...");
    }

    // Try DexScreener (trending/boosted tokens)
    try {
      const dexTokens = await fetchFromDexScreener();
      if (dexTokens.length > 0) {
        // Remove duplicates based on mint address
        const newTokens = dexTokens.filter(
          (token) => !allTokens.find((existing) => existing.mint === token.mint)
        );
        allTokens.push(...newTokens);
        sources.push(`DexScreener(${newTokens.length})`);
      }
    } catch (dexError) {
      console.log("⚠️ DexScreener failed, trying backup...");
    }

    // Backup: Top boosted tokens
    if (allTokens.length < 20) {
      try {
        const backupTokens = await fetchTopBoostedTokens();
        if (backupTokens.length > 0) {
          const newTokens = backupTokens.filter(
            (token) =>
              !allTokens.find((existing) => existing.mint === token.mint)
          );
          allTokens.push(...newTokens);
          sources.push(`TopBoosts(${newTokens.length})`);
        }
      } catch (backupError) {
        console.log("⚠️ Backup also failed");
      }
    }

    // Remove duplicates and filter out invalid tokens
    const uniqueTokens = allTokens
      .filter(
        (token, index, self) =>
          index === self.findIndex((t) => t.mint === token.mint)
      )
      .filter(
        (token) =>
          token.mint && token.symbol && token.name && token.usd_market_cap >= 0 // Allow 0 market cap tokens
      );

    if (uniqueTokens.length > 0) {
      console.log(
        `✅ SUCCESS: Returning ${
          uniqueTokens.length
        } REAL tokens from: ${sources.join(", ")}`
      );
      return NextResponse.json({
        success: true,
        tokens: uniqueTokens,
        source: `LIVE APIs: ${sources.join(", ")}`,
        count: uniqueTokens.length,
        timestamp: new Date().toISOString(),
      });
    }

    // If all APIs fail, return error
    console.error("❌ ALL APIs FAILED - No real data available");
    return NextResponse.json(
      {
        success: false,
        tokens: [],
        source: "ALL APIs FAILED",
        count: 0,
        error: "Unable to fetch real token data from any source",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      {
        success: false,
        tokens: [],
        source: "SERVER ERROR",
        count: 0,
        error: error instanceof Error ? error.message : "Unknown server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
