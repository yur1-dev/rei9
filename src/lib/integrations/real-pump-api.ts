import type { TokenData } from "@/types/token";

// Real Pump.fun API endpoints
const PUMP_API_BASE = "https://frontend-api.pump.fun";

export interface PumpFunApiResponse {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  bonding_curve?: string;
  associated_bonding_curve?: string;
  creator: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves?: number;
  virtual_token_reserves?: number;
  total_supply?: number;
  website?: string;
  show_name?: boolean;
  market_cap?: number;
  reply_count?: number;
  nsfw?: boolean;
  usd_market_cap?: number;
}

// Enhanced fetch with better error handling and data validation
export async function fetchRealTokens(): Promise<TokenData[]> {
  try {
    console.log("🔄 Fetching tokens from Pump.fun API...");

    const response = await fetch(
      `${PUMP_API_BASE}/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        cache: "no-store", // Ensure fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("🔍 Raw API Response:", rawData);

    // Handle different response formats
    let tokensArray: PumpFunApiResponse[] = [];
    if (Array.isArray(rawData)) {
      tokensArray = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      tokensArray = rawData.data;
    } else if (rawData.tokens && Array.isArray(rawData.tokens)) {
      tokensArray = rawData.tokens;
    } else {
      console.error("❌ Unexpected API response format:", rawData);
      throw new Error("Invalid API response format");
    }

    console.log(`✅ Processing ${tokensArray.length} tokens from API`);

    // Convert and validate each token
    const processedTokens: TokenData[] = tokensArray
      .map((apiToken, index) => {
        try {
          // Validate required fields
          if (!apiToken.mint || !apiToken.symbol) {
            console.warn(
              `⚠️ Skipping token ${index}: missing required fields`,
              apiToken
            );
            return null;
          }

          const token: TokenData = {
            mint: apiToken.mint,
            name: apiToken.name || apiToken.symbol || `Token ${index}`,
            symbol: apiToken.symbol,
            description: apiToken.description || "",
            image_uri: apiToken.image_uri || "",
            metadata_uri: apiToken.metadata_uri || "",
            twitter: apiToken.twitter,
            telegram: apiToken.telegram,
            bonding_curve: apiToken.bonding_curve || "",
            associated_bonding_curve: apiToken.associated_bonding_curve || "",
            creator: apiToken.creator || "",
            created_timestamp: apiToken.created_timestamp || Date.now(),
            raydium_pool: apiToken.raydium_pool,
            complete: apiToken.complete || false,
            virtual_sol_reserves: apiToken.virtual_sol_reserves || 0,
            virtual_token_reserves: apiToken.virtual_token_reserves || 0,
            total_supply: apiToken.total_supply || 0,
            website: apiToken.website,
            show_name: apiToken.show_name ?? true,
            king_of_the_hill_timestamp: undefined,
            market_cap: apiToken.market_cap || 0,
            reply_count: apiToken.reply_count || 0,
            last_reply: undefined,
            nsfw: apiToken.nsfw || false,
            market_id: undefined,
            inverted: undefined,
            is_currently_live: !apiToken.complete,
            username: undefined,
            profile_image: undefined,
            usd_market_cap: apiToken.usd_market_cap || apiToken.market_cap || 0,
          };

          // Log first few tokens for debugging
          if (index < 3) {
            console.log(`🔍 Processed Token ${index}:`, {
              symbol: token.symbol,
              name: token.name,
              mint: token.mint,
              usd_market_cap: token.usd_market_cap,
            });
          }

          return token;
        } catch (error) {
          console.error(`❌ Error processing token ${index}:`, error, apiToken);
          return null;
        }
      })
      .filter((token): token is TokenData => token !== null);

    console.log(
      `✅ Successfully processed ${processedTokens.length} valid tokens`
    );
    return processedTokens;
  } catch (error) {
    console.error("❌ Error fetching real tokens:", error);
    throw error;
  }
}
