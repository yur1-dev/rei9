"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { TokenData } from "@/types/token";

interface WebSocketMessage {
  method: string;
  data?: any;
  action?: string;
  payload?: any;
}

interface NewTokenEvent {
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
  show_name: boolean;
  king_of_the_hill_timestamp?: number;
  market_cap: number;
  reply_count: number;
  last_reply?: number;
  nsfw: boolean;
  market_id?: string;
  inverted?: boolean;
  is_currently_live: boolean;
  username?: string;
  profile_image?: string;
  usd_market_cap: number;
}

interface TokenTradeEvent {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  new_market_cap: number;
}

interface ConnectionState {
  isConnected: boolean;
  status: string;
  reconnectAttempts: number;
  endpoint: string;
}

interface WebSocketEndpoint {
  url: string;
  name: string;
  protocol: "pumpportal" | "solanastream";
  priority: number;
  requiresAuth?: boolean;
}

const MAX_TOKENS = 50;
const MAX_TRADES = 100;
const MAX_RECONNECT_ATTEMPTS = 3;

// Available WebSocket endpoints (prioritized)
const ENDPOINTS: WebSocketEndpoint[] = [
  {
    url: "wss://pumpportal.fun/api/data",
    name: "PumpPortal",
    protocol: "pumpportal",
    priority: 1,
    requiresAuth: false,
  },
  {
    url: "ws://94.130.79.116:9223", // Your SolanaStream endpoint
    name: "SolanaStream",
    protocol: "solanastream",
    priority: 2,
    requiresAuth: true, // Uses JWT tokens
  },
];

export function useEnhancedWebSocketTokens() {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenData>>(new Map());
  const [recentTrades, setRecentTrades] = useState<TokenTradeEvent[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    status: "Initializing...",
    reconnectAttempts: 0,
    endpoint: "",
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef(false);
  const currentEndpointRef = useRef(0);
  const subscribedTokensRef = useRef<Set<string>>(new Set());

  // Memoize sorted new tokens
  const newTokens = useMemo(() => {
    return Array.from(tokenMap.values())
      .sort((a, b) => b.created_timestamp - a.created_timestamp)
      .slice(0, MAX_TOKENS);
  }, [tokenMap]);

  // Transform PumpPortal/SolanaStream data to your TokenData format
  const transformTokenData = useCallback(
    (tokenData: NewTokenEvent): TokenData => {
      return {
        mint: tokenData.mint,
        name: tokenData.name,
        symbol: tokenData.symbol,
        description:
          tokenData.description || `${tokenData.name} - Fresh launch`,
        image_uri: tokenData.image_uri || "",
        metadata_uri: tokenData.metadata_uri || "",
        twitter: tokenData.twitter,
        telegram: tokenData.telegram,
        website: tokenData.website,
        bonding_curve: tokenData.bonding_curve,
        associated_bonding_curve: tokenData.associated_bonding_curve,
        creator: tokenData.creator,
        created_timestamp: tokenData.created_timestamp,
        raydium_pool: tokenData.raydium_pool,
        complete: tokenData.complete,
        virtual_sol_reserves: tokenData.virtual_sol_reserves,
        virtual_token_reserves: tokenData.virtual_token_reserves,
        total_supply: tokenData.total_supply,
        show_name: tokenData.show_name,
        king_of_the_hill_timestamp: tokenData.king_of_the_hill_timestamp,
        market_cap: tokenData.market_cap,
        reply_count: tokenData.reply_count || 1,
        last_reply: tokenData.last_reply || Date.now(),
        nsfw: tokenData.nsfw,
        market_id: tokenData.market_id,
        inverted: tokenData.inverted,
        is_currently_live: tokenData.is_currently_live,
        username: tokenData.username,
        profile_image: tokenData.profile_image,
        usd_market_cap: tokenData.usd_market_cap,
        volume: {
          h24: 0,
          h6: 0,
          h1: 0,
          m5: 0,
        },
        priceChange: {
          h24: 0,
          h6: 0,
          h1: 0,
          m5: 0,
        },
        txns: {
          h24: { buys: 0, sells: 0 },
          h6: { buys: 0, sells: 0 },
          h1: { buys: 0, sells: 0 },
          m5: { buys: 0, sells: 0 },
        },
        liquidity: {
          usd: tokenData.virtual_sol_reserves * 200, // Estimate
          base: tokenData.virtual_sol_reserves,
          quote: tokenData.virtual_token_reserves,
        },
      };
    },
    []
  );

  // Handle new token events
  const handleNewToken = useCallback(
    (tokenData: NewTokenEvent) => {
      try {
        const transformedToken = transformTokenData(tokenData);

        setTokenMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(tokenData.mint, transformedToken);

          // Keep only the most recent tokens
          if (newMap.size > MAX_TOKENS) {
            const sortedEntries = Array.from(newMap.entries()).sort(
              ([, a], [, b]) => b.created_timestamp - a.created_timestamp
            );
            const trimmedMap = new Map(sortedEntries.slice(0, MAX_TOKENS));
            return trimmedMap;
          }

          return newMap;
        });

        console.log(
          `🆕 New token detected: ${tokenData.symbol} (${tokenData.name})`
        );
      } catch (error) {
        console.error("❌ Error processing new token:", error);
      }
    },
    [transformTokenData]
  );

  // Handle token trade events
  const handleTokenTrade = useCallback((tradeData: TokenTradeEvent) => {
    try {
      // Add to recent trades
      setRecentTrades((prev) => [tradeData, ...prev.slice(0, MAX_TRADES - 1)]);

      // Update token data if we're tracking it
      setTokenMap((prev) => {
        const token = prev.get(tradeData.mint);
        if (!token) return prev;

        const newMap = new Map(prev);
        newMap.set(tradeData.mint, {
          ...token,
          usd_market_cap: tradeData.new_market_cap,
          market_cap: tradeData.new_market_cap,
          virtual_sol_reserves: tradeData.virtual_sol_reserves,
          virtual_token_reserves: tradeData.virtual_token_reserves,
          reply_count: token.reply_count + 1,
          last_reply: tradeData.timestamp,
          liquidity: {
            ...token.liquidity!,
            usd: tradeData.virtual_sol_reserves * 200,
            base: tradeData.virtual_sol_reserves,
            quote: tradeData.virtual_token_reserves,
          },
        });

        return newMap;
      });

      console.log(
        `💰 Trade on ${tradeData.mint}: ${tradeData.is_buy ? "BUY" : "SELL"} ${
          tradeData.sol_amount
        } SOL`
      );
    } catch (error) {
      console.error("❌ Error processing token trade:", error);
    }
  }, []);

  // Clean up connections
  const cleanupConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isReconnectingRef.current = false;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (typeof window === "undefined" || isReconnectingRef.current) return;

    isReconnectingRef.current = true;
    cleanupConnection();

    const endpoint = ENDPOINTS[currentEndpointRef.current];

    try {
      setConnectionState((prev) => ({
        ...prev,
        status: `Connecting to ${endpoint.name}...`,
        endpoint: endpoint.name,
      }));

      console.log(`🔌 Attempting connection to ${endpoint.name}...`);

      const ws = new WebSocket(endpoint.url);
      wsRef.current = ws;

      // Connection timeout
      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`⏰ Connection timeout for ${endpoint.name}`);
          ws.close();
        }
      }, 15000);

      ws.onopen = () => {
        console.log(`✅ Connected to ${endpoint.name}`);
        clearTimeout(timeout);

        setConnectionState({
          isConnected: true,
          status: `Connected to ${endpoint.name}`,
          reconnectAttempts: 0,
          endpoint: endpoint.name,
        });

        isReconnectingRef.current = false;

        // Subscribe based on protocol
        try {
          if (endpoint.protocol === "pumpportal") {
            // PumpPortal subscriptions
            ws.send(JSON.stringify({ method: "subscribeNewToken" }));
            ws.send(JSON.stringify({ method: "subscribeMigration" }));
            console.log(
              "📡 Subscribed to PumpPortal new tokens and migrations"
            );

            // Subscribe to existing tracked tokens
            subscribedTokensRef.current.forEach((tokenAddress) => {
              ws.send(
                JSON.stringify({
                  method: "subscribeTokenTrade",
                  keys: [tokenAddress],
                })
              );
            });
          } else if (endpoint.protocol === "solanastream") {
            // SolanaStream subscriptions
            ws.send(
              JSON.stringify({
                action: "subscribe",
                stream: "new_tokens",
                // Add your JWT credentials here if needed
                // auth: { jwt: "your-jwt-token", nkey: "your-nkey" }
              })
            );
            console.log("📡 Subscribed to SolanaStream new tokens");
          }
        } catch (subError) {
          console.error(
            `❌ Subscription failed for ${endpoint.name}:`,
            subError
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle different message formats
          if (endpoint.protocol === "pumpportal") {
            switch (message.method) {
              case "newToken":
                if (message.data) handleNewToken(message.data);
                break;
              case "tokenTrade":
                if (message.data) handleTokenTrade(message.data);
                break;
              case "migration":
                console.log("🚀 Token migration detected:", message.data);
                break;
              default:
                console.log(`📨 Unknown PumpPortal message: ${message.method}`);
            }
          } else if (endpoint.protocol === "solanastream") {
            switch (message.action) {
              case "new_token":
                if (message.payload) handleNewToken(message.payload);
                break;
              case "token_trade":
                if (message.payload) handleTokenTrade(message.payload);
                break;
              default:
                console.log(
                  `📨 Unknown SolanaStream message: ${message.action}`
                );
            }
          }
        } catch (error) {
          console.error(
            `❌ Error parsing message from ${endpoint.name}:`,
            error
          );
        }
      };

      ws.onclose = (event) => {
        console.log(
          `🔌 ${endpoint.name} disconnected:`,
          event.code,
          event.reason
        );
        clearTimeout(timeout);
        isReconnectingRef.current = false;

        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          status: `Disconnected from ${endpoint.name}`,
        }));

        // Try reconnecting or next endpoint
        if (connectionState.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            1000 * Math.pow(2, connectionState.reconnectAttempts),
            30000
          );

          setConnectionState((prev) => ({
            ...prev,
            status: `Reconnecting in ${delay / 1000}s... (${
              prev.reconnectAttempts + 1
            }/${MAX_RECONNECT_ATTEMPTS})`,
            reconnectAttempts: prev.reconnectAttempts + 1,
          }));

          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          // Try next endpoint
          currentEndpointRef.current =
            (currentEndpointRef.current + 1) % ENDPOINTS.length;

          setConnectionState((prev) => ({
            ...prev,
            status: `Trying next endpoint...`,
            reconnectAttempts: 0,
          }));

          setTimeout(connect, 2000);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ ${endpoint.name} WebSocket error:`, error);
        clearTimeout(timeout);
        isReconnectingRef.current = false;
      };
    } catch (error) {
      console.error(
        `❌ Failed to create WebSocket connection to ${endpoint.name}:`,
        error
      );
      isReconnectingRef.current = false;

      // Try next endpoint
      currentEndpointRef.current =
        (currentEndpointRef.current + 1) % ENDPOINTS.length;
      setTimeout(connect, 5000);
    }
  }, [
    handleNewToken,
    handleTokenTrade,
    cleanupConnection,
    connectionState.reconnectAttempts,
  ]);

  // Disconnect
  const disconnect = useCallback(() => {
    cleanupConnection();
    setConnectionState({
      isConnected: false,
      status: "Disconnected",
      reconnectAttempts: 0,
      endpoint: "",
    });
    subscribedTokensRef.current.clear();
  }, [cleanupConnection]);

  // Subscribe to specific token trades
  const subscribeToToken = useCallback((tokenAddress: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const endpoint = ENDPOINTS[currentEndpointRef.current];

      if (endpoint.protocol === "pumpportal") {
        wsRef.current.send(
          JSON.stringify({
            method: "subscribeTokenTrade",
            keys: [tokenAddress],
          })
        );
      } else if (endpoint.protocol === "solanastream") {
        wsRef.current.send(
          JSON.stringify({
            action: "subscribe_token_trade",
            token: tokenAddress,
          })
        );
      }

      subscribedTokensRef.current.add(tokenAddress);
      console.log(`👀 Subscribed to trades for token: ${tokenAddress}`);
    }
  }, []);

  // Unsubscribe from token trades
  const unsubscribeFromToken = useCallback((tokenAddress: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const endpoint = ENDPOINTS[currentEndpointRef.current];

      if (endpoint.protocol === "pumpportal") {
        wsRef.current.send(
          JSON.stringify({
            method: "unsubscribeTokenTrade",
            keys: [tokenAddress],
          })
        );
      } else if (endpoint.protocol === "solanastream") {
        wsRef.current.send(
          JSON.stringify({
            action: "unsubscribe_token_trade",
            token: tokenAddress,
          })
        );
      }

      subscribedTokensRef.current.delete(tokenAddress);
      console.log(`👋 Unsubscribed from trades for token: ${tokenAddress}`);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const initTimeout = setTimeout(connect, 1000);

    return () => {
      clearTimeout(initTimeout);
      cleanupConnection();
    };
  }, [connect, cleanupConnection]);

  return {
    // Token data
    newTokens,
    recentTrades,
    tokenCount: tokenMap.size,

    // Connection state
    isConnected: connectionState.isConnected,
    connectionStatus: connectionState.status,
    currentEndpoint: connectionState.endpoint,
    reconnectAttempts: connectionState.reconnectAttempts,

    // Actions
    connect,
    disconnect,
    subscribeToToken,
    unsubscribeFromToken,
  };
}
