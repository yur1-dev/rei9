"use client";
import { useState, useEffect, useCallback } from "react";
import type { TokenData } from "@/types/token";

interface ApiResponse {
  success: boolean;
  tokens: TokenData[];
  source: string;
  count: number;
  error?: string;
  isRealData?: boolean;
}

export function useRealtimeTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [dataSource, setDataSource] = useState("Unknown");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchTokens = useCallback(async () => {
    // Only run in browser
    if (typeof window === "undefined") {
      console.log("⚠️ Hook called on server, skipping...");
      return;
    }

    try {
      console.log("🔄 Client: Fetching tokens from API...");
      setConnectionStatus("Fetching...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/real-tokens", {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      console.log(`📡 Client: API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Client: API Error ${response.status}:`, errorText);

        setIsConnected(false);
        setConnectionStatus(`API Error: ${response.status}`);
        setDataSource("API Failed");
        return;
      }

      const data: ApiResponse = await response.json();
      console.log("📦 Client: API Response:", data);

      if (data.success && data.tokens && data.tokens.length > 0) {
        console.log(
          `✅ Client: Got ${data.tokens.length} real tokens from ${data.source}`
        );

        setTokens(data.tokens);
        setIsConnected(true);
        setConnectionStatus("Connected");
        setDataSource(data.source);
        setLastUpdate(new Date());
      } else {
        console.warn("⚠️ Client: API returned no tokens:", data);

        setIsConnected(false);
        setConnectionStatus(data.error || "No tokens received");
        setDataSource(data.source || "Unknown");
      }
    } catch (error) {
      console.error("❌ Client: Fetch failed:", error);

      setIsConnected(false);
      setConnectionStatus(
        error instanceof Error ? error.message : "Network Error"
      );
      setDataSource("Client Error");
    }
  }, []);

  // Initial fetch - only in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchTokens();
    }
  }, [fetchTokens]);

  // Periodic refresh every 2 minutes - only in browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      console.log("🔄 Client: Auto-refreshing tokens...");
      fetchTokens();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchTokens]);

  return {
    tokens,
    isConnected,
    connectionStatus,
    dataSource,
    lastUpdate,
    refetch: fetchTokens,
  };
}
