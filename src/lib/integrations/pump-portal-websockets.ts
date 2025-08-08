// Type definitions for WebSocket messages
interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
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
  is_currently_live?: boolean;
  usd_market_cap?: number;
}

interface TradeData {
  signature: string;
  mint: string;
  [key: string]: unknown;
}

interface WebSocketMessage {
  method?: string;
  keys?: string[];
  mint?: string;
  name?: string;
  symbol?: string;
  signature?: string;
  type?: string;
  [key: string]: unknown;
}

interface WebSocketPayload {
  method: string;
  keys?: string[];
}

// PumpPortal WebSocket Integration for Real-time Data
export class PumpPortalWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(
    private onNewToken: (token: TokenData) => void,
    private onTokenTrade: (trade: TradeData) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onError: (error: string) => void
  ) {}

  connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isConnecting = true;

    try {
      console.log("🔄 Connecting to PumpPortal WebSocket...");
      this.ws = new WebSocket("wss://pumpportal.fun/api/data");

      this.ws.onopen = () => {
        console.log("✅ Connected to PumpPortal WebSocket");
        this.isConnecting = false;
        this.onConnectionChange(true);
        this.reconnectAttempts = 0;

        // Subscribe to new token events
        this.subscribe("subscribeNewToken");

        // Subscribe to migration events (tokens going to Raydium)
        this.subscribe("subscribeMigration");
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(
          `⚠️ PumpPortal WebSocket closed: ${event.code} ${event.reason}`
        );
        this.isConnecting = false;
        this.onConnectionChange(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("❌ PumpPortal WebSocket error:", error);
        this.isConnecting = false;
        this.onConnectionChange(false);
        this.onError("WebSocket connection error");
      };
    } catch (error) {
      console.error("❌ Error connecting to PumpPortal WebSocket:", error);
      this.isConnecting = false;
      this.onConnectionChange(false);
      this.onError("Failed to connect to WebSocket");
    }
  }

  private subscribe(method: string, keys?: string[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload: WebSocketPayload = { method };
      if (keys) {
        payload.keys = keys;
      }

      this.ws.send(JSON.stringify(payload));
      console.log(
        `📡 Subscribed to ${method}`,
        keys ? `for keys: ${keys.join(", ")}` : ""
      );
    }
  }

  private handleMessage(data: WebSocketMessage) {
    try {
      // Handle new token creation
      if (data.mint && data.name && data.symbol) {
        console.log("🆕 New token detected:", data.symbol);
        this.onNewToken({
          mint: data.mint,
          name: data.name,
          symbol: data.symbol,
          description: (data.description as string) || "",
          image_uri: (data.image_uri as string) || "",
          metadata_uri: (data.metadata_uri as string) || "",
          twitter: data.twitter as string,
          telegram: data.telegram as string,
          website: data.website as string,
          bonding_curve: data.bonding_curve as string,
          associated_bonding_curve: data.associated_bonding_curve as string,
          creator: data.creator as string,
          created_timestamp: (data.created_timestamp as number) || Date.now(),
          complete: (data.complete as boolean) || false,
          virtual_sol_reserves: (data.virtual_sol_reserves as number) || 0,
          virtual_token_reserves: (data.virtual_token_reserves as number) || 0,
          total_supply: (data.total_supply as number) || 1000000000,
          market_cap: (data.market_cap as number) || 0,
          reply_count: 0,
          nsfw: (data.nsfw as boolean) || false,
          is_currently_live: true,
          usd_market_cap:
            (data.usd_market_cap as number) || (data.market_cap as number) || 0,
        });
      }

      // Handle token trades
      if (data.signature && data.mint) {
        console.log("💰 Token trade detected:", data.mint);
        this.onTokenTrade({
          signature: data.signature,
          mint: data.mint,
          ...data,
        });
      }

      // Handle migration events
      if (data.type === "migration") {
        console.log("🚀 Token migration detected:", data.mint);
      }
    } catch (error) {
      console.error("❌ Error handling WebSocket message:", error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log("❌ Max reconnection attempts reached");
      this.onError("Max reconnection attempts reached");
    }
  }

  subscribeToTokenTrades(tokenMints: string[]) {
    this.subscribe("subscribeTokenTrade", tokenMints);
  }

  subscribeToAccountTrades(accounts: string[]) {
    this.subscribe("subscribeAccountTrade", accounts);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
  }
}
