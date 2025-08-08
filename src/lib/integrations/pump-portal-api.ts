// PumpPortal Real-time API Integration
const PUMP_PORTAL_BASE = "https://pumpportal.fun/api";
const PUMP_PORTAL_WS = "wss://pumpportal.fun/api/data";

export interface PumpPortalToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  metadata_uri: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  market_cap: number;
  reply_count: number;
  last_reply?: number;
  nsfw: boolean;
  usd_market_cap: number;
}

export async function fetchPumpPortalTokens(): Promise<PumpPortalToken[]> {
  try {
    const response = await fetch(
      `${PUMP_PORTAL_BASE}/coins?offset=0&limit=100&sort=created_timestamp&order=DESC&includeNsfw=false`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; TokenTracker/1.0)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`PumpPortal API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching from PumpPortal:", error);
    throw error;
  }
}

export async function fetchPumpPortalTrendingTokens(): Promise<
  PumpPortalToken[]
> {
  try {
    const response = await fetch(
      `${PUMP_PORTAL_BASE}/coins?offset=0&limit=50&sort=market_cap&order=DESC&includeNsfw=false`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; TokenTracker/1.0)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`PumpPortal API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching trending from PumpPortal:", error);
    throw error;
  }
}

// WebSocket connection for real-time updates
export class PumpPortalWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private onNewToken: (token: PumpPortalToken) => void,
    private onTokenUpdate: (token: PumpPortalToken) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(PUMP_PORTAL_WS);

      this.ws.onopen = () => {
        console.log("Connected to PumpPortal WebSocket");
        this.onConnectionChange(true);
        this.reconnectAttempts = 0;

        // Subscribe to new token events
        this.ws?.send(
          JSON.stringify({
            method: "subscribeNewToken",
          })
        );

        // Subscribe to token trade events
        this.ws?.send(
          JSON.stringify({
            method: "subscribeTokenTrade",
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "new_token") {
            this.onNewToken(data);
          } else if (data.type === "token_trade") {
            this.onTokenUpdate(data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("PumpPortal WebSocket connection closed");
        this.onConnectionChange(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("PumpPortal WebSocket error:", error);
        this.onConnectionChange(false);
      };
    } catch (error) {
      console.error("Error connecting to PumpPortal WebSocket:", error);
      this.onConnectionChange(false);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect to PumpPortal... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
