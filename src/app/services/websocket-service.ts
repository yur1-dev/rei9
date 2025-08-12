"use client";

export interface NewTokenEvent {
  mint: string;
  symbol: string;
  name: string;
  uri: string;
  timestamp: number;
  signature: string;
  user: string;
  initialBuy?: number;
}

export interface TokenTradeEvent {
  mint: string;
  signature: string;
  user: string;
  timestamp: number;
  is_buy: boolean;
  token_amount: number;
  sol_amount: number;
  new_token_supply: number;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
}

export interface MigrationEvent {
  mint: string;
  signature: string;
  timestamp: number;
}

type EventType = "newToken" | "tokenTrade" | "migration";
type EventHandler = (data: any) => void;

class PumpPortalWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<EventType, EventHandler[]> = new Map();
  private connectionState:
    | "CONNECTING"
    | "CONNECTED"
    | "DISCONNECTED"
    | "ERROR" = "DISCONNECTED";

  constructor() {
    this.connect();
  }

  private connect() {
    if (typeof window === "undefined") return;

    try {
      this.connectionState = "CONNECTING";
      this.ws = new WebSocket("wss://pumpportal.fun/api/data");

      this.ws.onopen = () => {
        console.log("🔗 WebSocket connected to PumpPortal");
        this.connectionState = "CONNECTED";
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket disconnected", event.code, event.reason);
        this.connectionState = "DISCONNECTED";
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.warn(
          "⚠️ WebSocket connection failed - continuing without real-time updates"
        );
        this.connectionState = "ERROR";
        if (this.reconnectAttempts === 0) {
          console.log("📱 App will work with API data only");
        }
      };
    } catch (error) {
      console.warn("⚠️ WebSocket not available - using API data only");
      this.connectionState = "ERROR";
    }
  }

  private handleMessage(data: any) {
    // Handle different message types based on the data structure
    if (data.txType === "create") {
      this.emit("newToken", data as NewTokenEvent);
    } else if (data.txType === "buy" || data.txType === "sell") {
      this.emit("tokenTrade", data as TokenTradeEvent);
    } else if (data.txType === "migration") {
      this.emit("migration", data as MigrationEvent);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  public subscribeNewToken() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ method: "subscribeNewToken" }));
      console.log("📡 Subscribed to new token events");
    }
  }

  public subscribeTokenTrade(tokens?: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload = tokens
        ? { method: "subscribeTokenTrade", keys: tokens }
        : { method: "subscribeTokenTrade" };

      this.ws.send(JSON.stringify(payload));
      console.log("📡 Subscribed to token trade events");
    }
  }

  public subscribeAccountTrade(accounts: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          method: "subscribeAccountTrade",
          keys: accounts,
        })
      );
      console.log("📡 Subscribed to account trade events");
    }
  }

  public subscribeMigration() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ method: "subscribeMigration" }));
      console.log("📡 Subscribed to migration events");
    }
  }

  public on(event: EventType, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: EventType, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: EventType, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  public getConnectionState() {
    return this.connectionState;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let wsInstance: PumpPortalWebSocket | null = null;

export function getPumpPortalWebSocket(): PumpPortalWebSocket {
  if (!wsInstance) {
    wsInstance = new PumpPortalWebSocket();
  }
  return wsInstance;
}
