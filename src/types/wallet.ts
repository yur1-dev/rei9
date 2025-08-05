import type { PublicKey } from "@solana/web3.js";

export interface WalletInfo {
  address: string;
  balance: string; // Balance in SOL, formatted as a string
  network: "solana";
  walletType: "Phantom" | "Solflare" | "Ledger";
  networkName: string;
  symbol: string;
  username: string | null;
  explorer: string;
  publicKey: PublicKey; // Add PublicKey for direct access if needed
}

export interface CustomWalletInfo {
  address: string;
  balance: string; // Balance in SOL, formatted as a string
  walletType: string; // e.g., "Phantom", "Solflare"
  networkName: string; // e.g., "Solana Mainnet"
  symbol: string; // e.g., "SOL"
  explorer: string;
  publicKey: PublicKey; // Add PublicKey for direct access if needed
}

export type WalletType = "Phantom" | "Solflare" | "Ledger";

// Extend the Window interface to include Solana and Solflare
// This is necessary for direct interaction with wallet browser extensions.
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
      on: (event: string, handler: () => void) => void;
      off: (event: string, handler: () => void) => void;
    };
    solflare?: {
      isSolflare?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect?: () => Promise<void>; // disconnect might be optional
      isConnected?: boolean; // isConnected might be optional
      on?: (event: string, handler: () => void) => void;
      off?: (event: string, handler: () => void) => void;
    };
  }
}
