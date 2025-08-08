import { TokenData } from "@/types/token";

// Real Pump.fun API endpoints
const PUMP_API_BASE = "https://frontend-api.pump.fun";
const PUMP_WS_URL = "wss://pumpportal.fun/api/data";

// Solana Stream API
const SOLANA_STREAM_WS = "wss://api.solanastream.xyz/ws";

// KOL Scan API
const KOLSCAN_API = "https://api.kolscan.io";

export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter?: string;
  telegram?: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website?: string;
  show_name: boolean;
  market_cap: number;
  reply_count: number;
  nsfw: boolean;
  usd_market_cap: number;
}

// Fetch initial tokens from Pump.fun
export async function fetchRealTokens(): Promise<TokenData[]> {
  try {
    const response = await fetch(
      `${PUMP_API_BASE}/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PumpFunToken[] = await response.json();

    // Convert to our TokenData format
    return data.map((token) => ({
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      image_uri: token.image_uri,
      metadata_uri: token.metadata_uri,
      twitter: token.twitter,
      telegram: token.telegram,
      bonding_curve: token.bonding_curve,
      associated_bonding_curve: token.associated_bonding_curve,
      creator: token.creator,
      created_timestamp: token.created_timestamp,
      raydium_pool: token.raydium_pool,
      complete: token.complete,
      virtual_sol_reserves: token.virtual_sol_reserves,
      virtual_token_reserves: token.virtual_token_reserves,
      total_supply: token.total_supply,
      website: token.website,
      show_name: token.show_name,
      market_cap: token.market_cap,
      reply_count: token.reply_count,
      nsfw: token.nsfw,
      is_currently_live: !token.complete,
      usd_market_cap: token.usd_market_cap,
    }));
  } catch (error) {
    console.error("Error fetching real tokens:", error);
    throw error;
  }
}

// WebSocket connection for real-time updates
export class RealTimeTokenStream {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private onTokenUpdate: (tokens: TokenData[]) => void,
    private onNewToken: (token: TokenData) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  connect() {
    try {
      // Connect to Pump Portal WebSocket
      this.ws = new WebSocket(PUMP_WS_URL);

      this.ws.onopen = () => {
        console.log("Connected to Pump Portal WebSocket");
        this.onConnectionChange(true);
        this.reconnectAttempts = 0;

        // Subscribe to new token events
        this.ws?.send(
          JSON.stringify({
            method: "subscribeNewToken",
          })
        );

        // Subscribe to token updates
        this.ws?.send(
          JSON.stringify({
            method: "subscribeTokenTrade",
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection closed");
        this.onConnectionChange(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.onConnectionChange(false);
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.onConnectionChange(false);
    }
  }

  private handleWebSocketMessage(data: any) {
    if (data.type === "new_token") {
      // Handle new token creation
      const newToken: TokenData = {
        mint: data.mint,
        name: data.name,
        symbol: data.symbol,
        description: data.description || "",
        image_uri: data.image_uri || "",
        metadata_uri: data.metadata_uri || "",
        twitter: data.twitter,
        telegram: data.telegram,
        bonding_curve: data.bonding_curve,
        associated_bonding_curve: data.associated_bonding_curve,
        creator: data.creator,
        created_timestamp: data.created_timestamp,
        complete: false,
        virtual_sol_reserves: data.virtual_sol_reserves || 0,
        virtual_token_reserves: data.virtual_token_reserves || 0,
        total_supply: data.total_supply || 0,
        website: data.website,
        show_name: data.show_name || true,
        market_cap: data.market_cap || 0,
        reply_count: 0,
        nsfw: data.nsfw || false,
        is_currently_live: true,
        usd_market_cap: data.usd_market_cap || 0,
      };

      this.onNewToken(newToken);
    } else if (data.type === "token_trade") {
      // Handle token trade updates (price changes, volume, etc.)
      // This would update existing tokens with new market data
      console.log("Token trade update:", data);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log("Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

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

  // Sort by market cap and age for better categorization
  const sortedByMarketCap = [...tokens].sort(
    (a, b) => b.usd_market_cap - a.usd_market_cap
  );
  const now = Date.now();

  // Highest Gainer: High market cap tokens (> $50K)
  const highestGainer = sortedByMarketCap
    .filter((token) => token.usd_market_cap > 50000)
    .slice(0, 3);

  // Fastest Runner: Mid-tier tokens ($5K - $50K)
  const fastestRunner = sortedByMarketCap
    .filter(
      (token) =>
        token.usd_market_cap >= 5000 &&
        token.usd_market_cap <= 50000 &&
        !highestGainer.includes(token)
    )
    .slice(0, 3);

  // Gamble Box: Low market cap, newest tokens (< $5K)
  const gambleBox = sortedByMarketCap
    .filter(
      (token) =>
        token.usd_market_cap < 5000 &&
        !highestGainer.includes(token) &&
        !fastestRunner.includes(token)
    )
    .slice(0, 3);

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
  };
}
