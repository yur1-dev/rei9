import { NextResponse } from "next/server";
import type { TokenData } from "@/types/token";

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h6?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  priceChange: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: Array<{ url: string }>;
    socials?: Array<{ platform: string; handle: string }>;
  };
  boosts?: {
    active?: number;
  };
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

interface TokenBoost {
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon?: string;
  header?: string;
  description?: string;
  links?: Array<{ type: string; label: string; url: string }>;
}

// Get trending Solana tokens from multiple DexScreener endpoints
async function fetchTrendingSolanaTokens(): Promise<TokenData[]> {
  const tokens: TokenData[] = [];

  try {
    // 1. Get boosted tokens (trending/promoted)
    console.log("🔄 Fetching boosted tokens from DexScreener...");
    const boostedResponse = await fetch(
      "https://api.dexscreener.com/token-boosts/latest/v1",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "AlphaCalls/1.0",
        },
      }
    );

    if (boostedResponse.ok) {
      const boostedTokens: TokenBoost[] = await boostedResponse.json();
      const solanaBoosts = boostedTokens.filter(
        (token) => token.chainId === "solana"
      );

      console.log(`📈 Found ${solanaBoosts.length} boosted Solana tokens`);

      // Get detailed data for boosted tokens
      for (const boost of solanaBoosts.slice(0, 10)) {
        try {
          const pairResponse = await fetch(
            `https://api.dexscreener.com/tokens/v1/solana/${boost.tokenAddress}`,
            {
              headers: {
                Accept: "application/json",
                "User-Agent": "AlphaCalls/1.0",
              },
            }
          );

          if (pairResponse.ok) {
            const pairData: DexScreenerPair[] = await pairResponse.json();
            if (pairData && pairData.length > 0) {
              const pair = pairData[0]; // Get the first/main pair
              tokens.push(convertDexScreenerToToken(pair));
            }
          }

          // Rate limiting - wait 100ms between requests
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(
            `⚠️ Failed to fetch pair data for ${boost.tokenAddress}:`,
            error
          );
        }
      }
    }

    // 2. Search for popular Solana pairs
    console.log("🔍 Searching for popular Solana tokens...");
    const searchQueries = ["SOL", "USDC", "BONK", "WIF", "POPCAT", "PEPE"];

    for (const query of searchQueries) {
      try {
        const searchResponse = await fetch(
          `https://api.dexscreener.com/latest/dex/search?q=${query}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "AlphaCalls/1.0",
            },
          }
        );

        if (searchResponse.ok) {
          const searchData: DexScreenerResponse = await searchResponse.json();
          const solanaPairs = searchData.pairs
            ?.filter((pair) => pair.chainId === "solana")
            ?.slice(0, 3); // Top 3 results per query

          if (solanaPairs) {
            for (const pair of solanaPairs) {
              // Avoid duplicates
              if (!tokens.find((t) => t.mint === pair.baseToken.address)) {
                tokens.push(convertDexScreenerToToken(pair));
              }
            }
          }
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`⚠️ Search failed for ${query}:`, error);
      }
    }

    // 3. Get some specific high-volume Solana tokens
    console.log("💎 Fetching specific high-volume tokens...");
    const popularTokens = [
      "So11111111111111111111111111111111111111112", // SOL
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
      "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", // POPCAT
    ];

    for (const tokenAddress of popularTokens) {
      try {
        const tokenResponse = await fetch(
          `https://api.dexscreener.com/tokens/v1/solana/${tokenAddress}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "AlphaCalls/1.0",
            },
          }
        );

        if (tokenResponse.ok) {
          const tokenData: DexScreenerPair[] = await tokenResponse.json();
          if (tokenData && tokenData.length > 0) {
            // Get the pair with highest liquidity
            const bestPair = tokenData.sort(
              (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
            )[0];

            if (!tokens.find((t) => t.mint === bestPair.baseToken.address)) {
              tokens.push(convertDexScreenerToToken(bestPair));
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`⚠️ Failed to fetch token ${tokenAddress}:`, error);
      }
    }

    console.log(
      `✅ Successfully fetched ${tokens.length} real tokens from DexScreener`
    );
    return tokens;
  } catch (error) {
    console.error("❌ Error fetching trending tokens:", error);
    throw error;
  }
}

// Convert DexScreener pair data to our token format
function convertDexScreenerToToken(pair: DexScreenerPair): TokenData {
  const now = Date.now();

  return {
    // Core token data
    mint: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    description: `${pair.baseToken.name} (${pair.baseToken.symbol}) token`,
    image_uri: pair.info?.imageUrl || "",
    metadata_uri: "",
    twitter: pair.info?.socials?.find((s) => s.platform === "twitter")?.handle
      ? `https://twitter.com/${
          pair.info.socials.find((s) => s.platform === "twitter")?.handle
        }`
      : undefined,
    website: pair.info?.websites?.[0]?.url,
    telegram: pair.info?.socials?.find((s) => s.platform === "telegram")?.handle
      ? `https://t.me/${
          pair.info.socials.find((s) => s.platform === "telegram")?.handle
        }`
      : undefined,
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "",
    created_timestamp:
      pair.pairCreatedAt || now - Math.random() * 86400000 * 30, // Fallback to random recent date
    complete: true, // Assume DexScreener tokens are "graduated"
    virtual_sol_reserves: 0,
    virtual_token_reserves: 0,
    total_supply: 1000000000, // Default supply
    show_name: true,
    market_cap: pair.marketCap || 0,
    usd_market_cap: pair.marketCap || 0,
    reply_count: (pair.txns.h24?.buys || 0) + (pair.txns.h24?.sells || 0), // Use transaction count as activity
    nsfw: false,
    is_currently_live: true,

    // DexScreener data
    liquidity: pair.liquidity
      ? {
          usd: pair.liquidity.usd || 0,
          base: pair.liquidity.base || 0,
          quote: pair.liquidity.quote || 0,
        }
      : undefined,
    volume: {
      h24: pair.volume.h24 || 0,
      h6: pair.volume.h6 || 0,
      h1: pair.volume.h1 || 0,
      m5: pair.volume.m5 || 0,
    },
    priceChange: {
      h24: pair.priceChange.h24 || 0,
      h6: pair.priceChange.h6 || 0,
      h1: pair.priceChange.h1 || 0,
      m5: pair.priceChange.m5 || 0,
    },
    txns: {
      h24: {
        buys: pair.txns.h24?.buys || 0,
        sells: pair.txns.h24?.sells || 0,
      },
      h6: {
        buys: pair.txns.h6?.buys || 0,
        sells: pair.txns.h6?.sells || 0,
      },
      h1: {
        buys: pair.txns.h1?.buys || 0,
        sells: pair.txns.h1?.sells || 0,
      },
      m5: {
        buys: pair.txns.m5?.buys || 0,
        sells: pair.txns.m5?.sells || 0,
      },
    },
    fdv: pair.fdv,
    pairCreatedAt: pair.pairCreatedAt,

    // Estimate holders based on transaction activity (rough approximation)
    holders: Math.floor(
      ((pair.txns.h24?.buys || 0) + (pair.txns.h24?.sells || 0)) * 2.5
    ),
  };
}

export async function GET() {
  try {
    console.log("🚀 REAL DexScreener API called - fetching live data...");

    const realTokens = await fetchTrendingSolanaTokens();

    if (realTokens.length === 0) {
      throw new Error("No tokens received from DexScreener");
    }

    console.log(
      `✅ Successfully fetched ${realTokens.length} REAL tokens from DexScreener`
    );
    console.log("🔍 Sample real token:", {
      symbol: realTokens[0]?.symbol,
      name: realTokens[0]?.name,
      marketCap: realTokens[0]?.usd_market_cap,
      volume24h: realTokens[0]?.volume?.h24,
      liquidity: realTokens[0]?.liquidity?.usd,
    });

    return NextResponse.json({
      success: true,
      tokens: realTokens,
      source: "DexScreener API (REAL DATA)",
      count: realTokens.length,
      isRealData: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ REAL DexScreener API error:", error);

    return NextResponse.json(
      {
        success: false,
        tokens: [],
        source: "DexScreener API",
        count: 0,
        error:
          error instanceof Error ? error.message : "Unknown DexScreener error",
        isRealData: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
