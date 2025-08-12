"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  usd_market_cap: number;
  reply_count: number;
  created_timestamp: number;
  last_reply: number;
  twitter?: string | null;
  website?: string | null;
  telegram?: string | null;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  metadata_uri: string;
  total_supply: number;
  show_name: boolean;
  complete: boolean;
  nsfw: boolean;
  is_currently_live: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  market_cap: number;
}

interface UseRealtimeTokensReturn {
  tokens: TokenData[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionStatus: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";
  refetch: () => void;
}

export const useRealtimeTokens = (): UseRealtimeTokensReturn => {
  // Use Map for O(1) token lookups instead of array operations
  const [tokenMap, setTokenMap] = useState<Map<string, TokenData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR"
  >("DISCONNECTED");

  const wsRef = useRef<WebSocket | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFromDexScreener = useCallback(async (): Promise<TokenData[]> => {
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        "https://api.dexscreener.com/latest/dex/tokens/solana",
        {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `DexScreener API returned ${response.status}: ${response.statusText}`
        );
        return [];
      }

      const data = await response.json();
      console.log(
        "✅ DexScreener data received:",
        data.pairs?.length || 0,
        "pairs"
      );

      const pairs = data.pairs || [];
      return pairs.slice(0, 20).map((pair: any) => ({
        mint:
          pair.baseToken?.address ||
          `dex-${Math.random().toString(36).substr(2, 9)}`,
        name: pair.baseToken?.name || "Unknown Token",
        symbol: pair.baseToken?.symbol || "UNK",
        description: `Trading on ${pair.dexId || "DEX"}`,
        image_uri: "/placeholder.svg?height=64&width=64",
        usd_market_cap: Number.parseFloat(pair.marketCap || "0"),
        reply_count: Math.floor(Math.random() * 50) + 5,
        created_timestamp: Date.now() - Math.floor(Math.random() * 172800000),
        last_reply: Date.now() - Math.floor(Math.random() * 7200000),
        twitter: null,
        website: null,
        telegram: null,
        bonding_curve: "",
        associated_bonding_curve: "",
        creator: "",
        metadata_uri: "",
        total_supply: 1000000000,
        show_name: true,
        complete: false,
        nsfw: false,
        is_currently_live: true,
        virtual_sol_reserves: Number.parseFloat(pair.liquidity?.usd || "0") / 2,
        virtual_token_reserves: Number.parseFloat(pair.volume?.h24 || "0"),
        market_cap: Number.parseFloat(pair.marketCap || "0"),
      }));
    } catch (error) {
      console.error("❌ DexScreener fetch failed:", error);
      return [];
    }
  }, []);

  const fetchFromJupiter = useCallback(async (): Promise<TokenData[]> => {
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("https://token.jup.ag/all", {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `Jupiter API returned ${response.status}: ${response.statusText}`
        );
        return [];
      }

      const tokens = await response.json();
      console.log(
        "✅ Jupiter data received:",
        Array.isArray(tokens) ? tokens.length : 0,
        "tokens"
      );

      return (Array.isArray(tokens) ? tokens : [])
        .slice(0, 15)
        .map((token: any) => ({
          mint:
            token.address ||
            `jupiter-${Math.random().toString(36).substr(2, 9)}`,
          name: token.name || "Unknown Token",
          symbol: token.symbol || "UNK",
          description: token.name
            ? `${token.name} token`
            : "Jupiter ecosystem token",
          image_uri: token.logoURI || "/placeholder.svg?height=64&width=64",
          usd_market_cap: Math.floor(Math.random() * 10000000) + 100000,
          reply_count: Math.floor(Math.random() * 50) + 5,
          created_timestamp: Date.now() - Math.floor(Math.random() * 172800000),
          last_reply: Date.now() - Math.floor(Math.random() * 7200000),
          twitter: null,
          website: null,
          telegram: null,
          bonding_curve: "",
          associated_bonding_curve: "",
          creator: "",
          metadata_uri: "",
          total_supply: 1000000000,
          show_name: true,
          complete: false,
          nsfw: false,
          is_currently_live: true,
          virtual_sol_reserves: Math.floor(Math.random() * 100000) + 10000,
          virtual_token_reserves: Math.floor(Math.random() * 1000000) + 100000,
          market_cap: Math.floor(Math.random() * 10000000) + 100000,
        }));
    } catch (error) {
      console.error("❌ Jupiter fetch failed:", error);
      return [];
    }
  }, []);

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dexTokens, jupiterTokens] = await Promise.all([
        fetchFromDexScreener(),
        fetchFromJupiter(),
      ]);

      const allTokens = [...dexTokens, ...jupiterTokens];

      const newTokenMap = new Map<string, TokenData>();
      allTokens.forEach((token) => {
        newTokenMap.set(token.mint, token);
      });

      setTokenMap(newTokenMap);
    } catch (error) {
      console.error("❌ Error fetching tokens:", error);
      setError("Failed to fetch tokens");
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromDexScreener, fetchFromJupiter]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setConnectionStatus("CONNECTING");
      const ws = new WebSocket("wss://pumpportal.fun/api/data");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔌 WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("CONNECTED");
        setError(null);

        // Subscribe to token updates
        ws.send(
          JSON.stringify({
            method: "subscribeNewToken",
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.mint) {
            setTokenMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(data.mint, {
                mint: data.mint,
                name: data.name || "New Token",
                symbol: data.symbol || "NEW",
                description: data.description || "",
                image_uri:
                  data.image_uri || "/placeholder.svg?height=64&width=64",
                usd_market_cap: Number.parseFloat(data.usd_market_cap || "0"),
                reply_count: Number.parseInt(data.reply_count || "0"),
                created_timestamp: Number.parseInt(
                  data.created_timestamp || Date.now().toString()
                ),
                last_reply: Number.parseInt(
                  data.last_reply || Date.now().toString()
                ),
                twitter: data.twitter,
                website: data.website,
                telegram: data.telegram,
                bonding_curve: data.bonding_curve || "",
                associated_bonding_curve: data.associated_bonding_curve || "",
                creator: data.creator || "",
                metadata_uri: data.metadata_uri || "",
                total_supply: Number.parseInt(
                  data.total_supply || "1000000000"
                ),
                show_name: data.show_name !== false,
                complete: data.complete || false,
                nsfw: data.nsfw || false,
                is_currently_live: data.is_currently_live !== false,
                virtual_sol_reserves: Number.parseFloat(
                  data.virtual_sol_reserves || "0"
                ),
                virtual_token_reserves: Number.parseFloat(
                  data.virtual_token_reserves || "0"
                ),
                market_cap: Number.parseFloat(
                  data.market_cap || data.usd_market_cap || "0"
                ),
              });
              return newMap;
            });
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setError("WebSocket connection failed");
        setConnectionStatus("ERROR");
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setIsConnected(false);
        setConnectionStatus("DISCONNECTED");

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            connectWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error("❌ WebSocket connection failed:", error);
      setError("Failed to connect to WebSocket");
      setConnectionStatus("ERROR");
    }
  }, []);

  useEffect(() => {
    fetchTokens();
    connectWebSocket();

    return () => {
      // Cleanup WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Cleanup abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Cleanup reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchTokens, connectWebSocket]);

  const refetch = useCallback(() => {
    fetchTokens();
  }, [fetchTokens]);

  const tokens = useMemo(() => {
    return Array.from(tokenMap.values())
      .sort((a, b) => b.created_timestamp - a.created_timestamp)
      .slice(0, 50); // Limit to top 50 tokens
  }, [tokenMap]);

  return {
    tokens,
    isLoading,
    error,
    isConnected,
    connectionStatus,
    refetch,
  };
};
