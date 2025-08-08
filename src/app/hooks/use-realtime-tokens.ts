"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TokenData } from "@/types/token";
import {
  fetchRealTimeTokensFromServer,
  categorizeTokens,
} from "@/lib/integrations/client-api";

interface RealtimeTokensHook {
  tokens: TokenData[];
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  lastUpdate: Date | null;
  dataSource: string;
}

export function useRealtimeTokens(): RealtimeTokensHook {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<string>("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data from server API
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setConnectionStatus("connecting");
        setDataSource("Connecting...");

        const response = await fetchRealTimeTokensFromServer();

        if (mounted) {
          setTokens(response.tokens);
          setLastUpdate(new Date());
          setIsConnected(response.success);
          setConnectionStatus(response.success ? "connected" : "error");
          setDataSource(response.source);

          console.log(
            `✅ Hook: Updated with ${response.count} tokens from ${response.source}`
          );
        }
      } catch (error) {
        console.error("❌ Hook: Failed to fetch data:", error);
        if (mounted) {
          setConnectionStatus("error");
          setDataSource("Connection failed");
          setIsConnected(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up periodic updates every 30 seconds
    intervalRef.current = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    tokens,
    isConnected,
    connectionStatus,
    lastUpdate,
    dataSource,
  };
}
