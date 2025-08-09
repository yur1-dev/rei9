import { TokenData } from "@/types/token";

// Real Pump.fun API endpoints
const PUMP_API_BASE = "https://frontend-api.pump.fun";
const PUMP_WS_URL = "wss://pumpportal.fun/api/data";

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

interface WebSocketMessage {
  type: string;
  mint?: string;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  bonding_curve?: string;
  associated_bonding_curve?: string;
  creator?: string;
  created_timestamp?: number;
  virtual_sol_reserves?: number;
  virtual_token_reserves?: number;
  total_supply?: number;
  website?: string;
  show_name?: boolean;
  market_cap?: number;
  nsfw?: boolean;
  usd_market_cap?: number;
}

// Enhanced error handling
export class PumpFunAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: string
  ) {
    super(message);
    this.name = "PumpFunAPIError";
  }
}

// Fetch initial tokens from Pump.fun with improved error handling
export async function fetchRealTokens(): Promise<TokenData[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `${PUMP_API_BASE}/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new PumpFunAPIError(
        `HTTP error! status: ${response.status} - ${errorText}`,
        response.status,
        errorText
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new PumpFunAPIError("Response is not JSON");
    }

    const data: PumpFunToken[] = await response.json();

    if (!Array.isArray(data)) {
      throw new PumpFunAPIError("Invalid response format: expected array");
    }

    // Convert to our TokenData format with safe property access
    return data.map((token) => ({
      mint: token.mint || "",
      name: token.name || "",
      symbol: token.symbol || "",
      description: token.description || "",
      image_uri: token.image_uri || "",
      metadata_uri: token.metadata_uri || "",
      twitter: token.twitter || undefined,
      telegram: token.telegram || undefined,
      bonding_curve: token.bonding_curve || "",
      associated_bonding_curve: token.associated_bonding_curve || "",
      creator: token.creator || "",
      created_timestamp: token.created_timestamp || Date.now(),
      raydium_pool: token.raydium_pool || undefined,
      complete: Boolean(token.complete),
      virtual_sol_reserves: Number(token.virtual_sol_reserves) || 0,
      virtual_token_reserves: Number(token.virtual_token_reserves) || 0,
      total_supply: Number(token.total_supply) || 0,
      website: token.website || undefined,
      show_name: Boolean(token.show_name ?? true),
      market_cap: Number(token.market_cap) || 0,
      reply_count: Number(token.reply_count) || 0,
      nsfw: Boolean(token.nsfw),
      is_currently_live: !Boolean(token.complete),
      usd_market_cap: Number(token.usd_market_cap) || 0,
    }));
  } catch (error) {
    if (error instanceof PumpFunAPIError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new PumpFunAPIError("Request timeout");
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new PumpFunAPIError(
        "Network error - check internet connection or CORS policy"
      );
    }

    console.error("Error fetching real tokens:", error);
    throw new PumpFunAPIError(
      `Failed to fetch tokens: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// WebSocket connection for real-time updates with improved reliability
export class RealTimeTokenStream {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isManuallyDisconnected = false;

  constructor(
    private onTokenUpdate: (tokens: TokenData[]) => void,
    private onNewToken: (token: TokenData) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onError?: (error: string) => void
  ) {}

  connect() {
    if (
      this.ws?.readyState === WebSocket.CONNECTING ||
      this.ws?.readyState === WebSocket.OPEN
    ) {
      console.log("WebSocket already connecting or connected");
      return;
    }

    this.isManuallyDisconnected = false;

    try {
      console.log("Connecting to Pump Portal WebSocket...");
      this.ws = new WebSocket(PUMP_WS_URL);

      this.ws.onopen = () => {
        console.log("Connected to Pump Portal WebSocket");
        this.onConnectionChange(true);
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        // Subscribe to new token events with error handling
        try {
          this.ws?.send(
            JSON.stringify({
              method: "subscribeNewToken",
            })
          );

          this.ws?.send(
            JSON.stringify({
              method: "subscribeTokenTrade",
            })
          );
        } catch (sendError) {
          console.error("Error sending subscription messages:", sendError);
          this.onError?.("Failed to subscribe to events");
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          this.handleWebSocketMessage(data);
        } catch (parseError) {
          console.error("Error parsing WebSocket message:", parseError);
          this.onError?.("Failed to parse message from server");
        }
      };

      this.ws.onclose = (event) => {
        console.log(
          `WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`
        );
        this.onConnectionChange(false);
        this.stopHeartbeat();

        if (!this.isManuallyDisconnected) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.onConnectionChange(false);
        this.onError?.("WebSocket connection error");
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.onConnectionChange(false);
      this.onError?.("Failed to create WebSocket connection");
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ method: "ping" }));
        } catch (error) {
          console.error("Failed to send heartbeat:", error);
        }
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleWebSocketMessage(data: WebSocketMessage) {
    try {
      if (data.type === "new_token") {
        const newToken: TokenData = {
          mint: data.mint || "",
          name: data.name || "",
          symbol: data.symbol || "",
          description: data.description || "",
          image_uri: data.image_uri || "",
          metadata_uri: data.metadata_uri || "",
          twitter: data.twitter,
          telegram: data.telegram,
          bonding_curve: data.bonding_curve || "",
          associated_bonding_curve: data.associated_bonding_curve || "",
          creator: data.creator || "",
          created_timestamp: data.created_timestamp || Date.now(),
          complete: false,
          virtual_sol_reserves: Number(data.virtual_sol_reserves) || 0,
          virtual_token_reserves: Number(data.virtual_token_reserves) || 0,
          total_supply: Number(data.total_supply) || 0,
          website: data.website,
          show_name: Boolean(data.show_name ?? true),
          market_cap: Number(data.market_cap) || 0,
          reply_count: 0,
          nsfw: Boolean(data.nsfw),
          is_currently_live: true,
          usd_market_cap: Number(data.usd_market_cap) || 0,
        };

        this.onNewToken(newToken);
      } else if (data.type === "token_trade") {
        console.log("Token trade update:", data);
        // Handle token trade updates here if needed
      } else if (data.type === "pong") {
        // Handle heartbeat response
        console.log("Received pong from server");
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      this.onError?.("Failed to process server message");
    }
  }

  private attemptReconnect() {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      !this.isManuallyDisconnected
    ) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        if (!this.isManuallyDisconnected) {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log("Max reconnection attempts reached or manually disconnected");
      this.onError?.("Failed to reconnect to server");
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
  }

  // Get current connection status
  getConnectionStatus(): string {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "unknown";
    }
  }
}

export function categorizeTokens(tokens: TokenData[]): {
  highestGainer: TokenData[];
  fastestRunner: TokenData[];
  gambleBox: TokenData[];
  analytics: {
    totalTracked: number;
    recentGraduations: number;
    stageDistribution: {
      gamble: number;
      runner: number;
      gainer: number;
    };
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

  // Filter out invalid tokens and sort by market cap
  const validTokens = tokens.filter(
    (token) =>
      token &&
      typeof token.usd_market_cap === "number" &&
      token.usd_market_cap >= 0
  );

  const sortedByMarketCap = [...validTokens].sort(
    (a, b) => b.usd_market_cap - a.usd_market_cap
  );

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

  // Calculate analytics
  const recentGraduations = validTokens.filter(
    (token) =>
      token.complete &&
      token.created_timestamp > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
  ).length;

  return {
    highestGainer,
    fastestRunner,
    gambleBox,
    analytics: {
      totalTracked: validTokens.length,
      recentGraduations,
      stageDistribution: {
        gamble: gambleBox.length,
        runner: fastestRunner.length,
        gainer: highestGainer.length,
      },
    },
  };
}
