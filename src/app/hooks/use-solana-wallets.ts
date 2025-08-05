"use client";

import { useWallet as useSolanaAdapterWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { PublicKey } from "@solana/web3.js";
import type { CustomWalletInfo } from "@/types/wallet";

interface UseSolanaWalletResult {
  walletInfo: CustomWalletInfo | null;
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  disconnect: () => Promise<void>;
  select: (walletName: string) => void;
  connect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  error: Error | null;
}

const getSolanaBalance = async (address: string): Promise<string> => {
  try {
    const response = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const data = await response.json();
    if (data.result && data.result.value !== undefined) {
      const balance = data.result.value / 1000000000;
      return balance.toFixed(4);
    }
    return "0.0000";
  } catch (error) {
    console.error("Failed to fetch Solana balance:", error);
    return "0.0000";
  }
};

export const useSolanaWallet = (): UseSolanaWalletResult => {
  const {
    publicKey,
    connected,
    disconnect,
    select,
    connecting,
    wallet, // The connected wallet adapter
    connect: adapterConnect, // Renamed to avoid conflict with our custom hook's connect
    error: adapterError,
  } = useSolanaAdapterWallet();

  const [balance, setBalance] = useState<string>("0.0000");
  const [customError, setCustomError] = useState<Error | null>(null);

  const refreshBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const fetchedBalance = await getSolanaBalance(publicKey.toString());
        setBalance(fetchedBalance);
      } catch (err) {
        console.error("Error refreshing balance:", err);
        setCustomError(err as Error);
      }
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    } else {
      setBalance("0.0000"); // Reset balance if disconnected
    }
  }, [connected, publicKey, refreshBalance]);

  // Combine adapter error with any custom errors
  useEffect(() => {
    if (adapterError) {
      setCustomError(adapterError);
    } else {
      setCustomError(null);
    }
  }, [adapterError]);

  const walletInfo: CustomWalletInfo | null = useMemo(() => {
    if (connected && publicKey && wallet) {
      return {
        address: publicKey.toString(),
        balance: balance,
        walletType: wallet.adapter.name,
        networkName: "Solana Mainnet", // Hardcoded for now, can be dynamic
        symbol: "SOL",
        explorer: "https://explorer.solana.com",
        publicKey: publicKey,
      };
    }
    return null;
  }, [connected, publicKey, balance, wallet]);

  return {
    walletInfo,
    connected,
    publicKey,
    connecting,
    disconnect,
    select,
    connect: adapterConnect, // Expose the adapter's connect method
    refreshBalance,
    error: customError,
  };
};
