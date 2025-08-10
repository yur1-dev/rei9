"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TokenData } from "@/types/token";

interface DexScreenerResponse {
  success: boolean;
  tokens: TokenData[];
  source: string;
  count: number;
  error?: string;
  isRealData?: boolean;
  timestamp?: string;
}

export function useRealtimeTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    "Initializing DexScreener..."
  );
  const [dataSource, setDataSource] = useState("DexScreener");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const fetchTokens = useCallback(
    async (isRetry = false) => {
      if (typeof window === "undefined") {
        console.log("⚠️ Hook called on server, skipping...");
        return;
      }

      try {
        console.log(
          `🔄 Fetching tokens from DexScreener... ${
            isRetry ? `(Retry ${retryCount + 1})` : ""
          }`
        );
        setConnectionStatus(
          isRetry
            ? `Retrying REAL DexScreener... (${retryCount + 1})`
            : "Fetching REAL data from DexScreener..."
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch("/api/real-tokens", {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);
        console.log(`📡 Tokens API response: ${response.status}`);

        if (!response.ok) {
          let errorText = "Unknown error";
          try {
            const errorData = await response.json();
            errorText =
              errorData.error || errorData.message || `HTTP ${response.status}`;
          } catch {
            errorText = await response
              .text()
              .catch(() => `HTTP ${response.status}`);
          }

          console.error(`❌ Tokens API error ${response.status}:`, errorText);
          setIsConnected(false);
          setConnectionStatus(`DexScreener Error: ${response.status}`);
          setDataSource("DexScreener Failed");

          if (response.status >= 500 && retryCount < 3) {
            setRetryCount((prev) => prev + 1);
            fetchTimeoutRef.current = setTimeout(
              () => fetchTokens(true),
              5000 * (retryCount + 1)
            );
          }
          return;
        }

        const data: DexScreenerResponse = await response.json();
        console.log("📦 Tokens response:", {
          success: data.success,
          tokenCount: data.tokens?.length || 0,
          source: data.source,
          isRealData: data.isRealData,
        });

        if (
          data.success &&
          data.tokens &&
          Array.isArray(data.tokens) &&
          data.tokens.length > 0
        ) {
          // Validate and enhance token data
          const validTokens = data.tokens
            .filter((token: any) => {
              const isValid =
                token &&
                typeof token === "object" &&
                token.mint &&
                token.symbol &&
                token.name &&
                typeof token.mint === "string" &&
                typeof token.symbol === "string" &&
                typeof token.name === "string";

              if (!isValid) {
                console.warn("❌ Invalid token filtered out:", token);
              }
              return isValid;
            })
            .map((token: any) => ({
              // Core token data
              mint: token.mint,
              name: token.name,
              symbol: token.symbol,
              description: token.description || `${token.name} token`,
              image_uri: token.image_uri || "",
              metadata_uri: token.metadata_uri || "",
              twitter: token.twitter,
              telegram: token.telegram,
              website: token.website,
              bonding_curve: token.bonding_curve || "",
              associated_bonding_curve: token.associated_bonding_curve || "",
              creator: token.creator || "",
              created_timestamp: token.created_timestamp || Date.now(),
              raydium_pool: token.raydium_pool,
              complete: Boolean(token.complete),
              virtual_sol_reserves: Number(token.virtual_sol_reserves) || 0,
              virtual_token_reserves: Number(token.virtual_token_reserves) || 0,
              total_supply: Number(token.total_supply) || 1000000000,
              show_name: Boolean(token.show_name ?? true),
              king_of_the_hill_timestamp: token.king_of_the_hill_timestamp,
              market_cap:
                Number(token.market_cap) || Number(token.usd_market_cap) || 0,
              reply_count: Number(token.reply_count) || 0,
              last_reply: token.last_reply,
              nsfw: Boolean(token.nsfw),
              market_id: token.market_id,
              inverted: Boolean(token.inverted),
              is_currently_live: Boolean(token.is_currently_live ?? true),
              username: token.username,
              profile_image: token.profile_image,
              usd_market_cap:
                Number(token.usd_market_cap) || Number(token.market_cap) || 0,

              // DexScreener data
              holders: Number(token.holders) || undefined,
              liquidity: token.liquidity
                ? {
                    usd: Number(token.liquidity.usd) || 0,
                    base: Number(token.liquidity.base) || 0,
                    quote: Number(token.liquidity.quote) || 0,
                  }
                : undefined,
              volume: token.volume
                ? {
                    h24: Number(token.volume.h24) || 0,
                    h6: Number(token.volume.h6) || 0,
                    h1: Number(token.volume.h1) || 0,
                    m5: Number(token.volume.m5) || 0,
                  }
                : undefined,
              priceChange: token.priceChange
                ? {
                    h24: Number(token.priceChange.h24) || 0,
                    h6: Number(token.priceChange.h6) || 0,
                    h1: Number(token.priceChange.h1) || 0,
                    m5: Number(token.priceChange.m5) || 0,
                  }
                : undefined,
              txns: token.txns
                ? {
                    h24: {
                      buys: Number(token.txns.h24?.buys) || 0,
                      sells: Number(token.txns.h24?.sells) || 0,
                    },
                    h6: {
                      buys: Number(token.txns.h6?.buys) || 0,
                      sells: Number(token.txns.h6?.sells) || 0,
                    },
                    h1: {
                      buys: Number(token.txns.h1?.buys) || 0,
                      sells: Number(token.txns.h1?.sells) || 0,
                    },
                    m5: {
                      buys: Number(token.txns.m5?.buys) || 0,
                      sells: Number(token.txns.m5?.sells) || 0,
                    },
                  }
                : undefined,
              fdv: Number(token.fdv) || undefined,
              pairCreatedAt: token.pairCreatedAt || undefined,
            }));

          if (validTokens.length > 0) {
            console.log(
              `✅ Got ${validTokens.length} valid tokens from DexScreener`
            );
            console.log("🔍 Sample token:", validTokens[0]);
            setTokens(validTokens);
            setIsConnected(true);
            setConnectionStatus("✅ Connected to REAL DexScreener API");
            setDataSource("DexScreener LIVE API");
            setLastUpdate(new Date());
            setIsRealData(data.isRealData || true);
            setRetryCount(0);
            return;
          } else {
            console.warn("⚠️ No valid tokens after filtering");
          }
        }

        console.warn(
          "⚠️ DexScreener API returned invalid or empty data:",
          data
        );
        setIsConnected(false);
        setConnectionStatus(
          data.error || "No valid tokens received from DexScreener"
        );
        setDataSource("DexScreener");
      } catch (error) {
        console.error("❌ Fetch failed:", error);
        setIsConnected(false);
        setIsRealData(false);

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            setConnectionStatus("DexScreener request timeout");
          } else if (error.message.includes("fetch")) {
            setConnectionStatus("DexScreener network error");
          } else {
            setConnectionStatus(`DexScreener error: ${error.message}`);
          }
        } else {
          setConnectionStatus("Unknown DexScreener error");
        }

        setDataSource("DexScreener Error");

        if (retryCount < 3) {
          setRetryCount((prev) => prev + 1);
          fetchTimeoutRef.current = setTimeout(
            () => fetchTokens(true),
            3000 * (retryCount + 1)
          );
        }
      }
    },
    [retryCount]
  );

  // Initial fetch
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log("🚀 Initializing real-time token fetching...");
      fetchTokens();
    }
  }, [fetchTokens]);

  // Auto-refresh every 60 seconds for DexScreener data
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      console.log("🔄 Auto-refreshing tokens from DexScreener...");
      fetchTokens();
    }, 60000); // 60 seconds for DexScreener updates

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchTokens]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refetch = useCallback(() => {
    console.log("🔄 Manual DexScreener refresh triggered");
    setRetryCount(0);
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    isConnected,
    connectionStatus,
    dataSource,
    lastUpdate,
    isRealData,
    retryCount,
    refetch,
  };
}
