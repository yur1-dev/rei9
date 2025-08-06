"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import {
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  LogOut,
  Wallet,
  Globe,
  CheckCircle,
} from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { publicKey, disconnect, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
    setIsLoading(true);
    try {
      const balanceInLamports = await connection.getBalance(publicKey);
      setBalance(balanceInLamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const openInExplorer = () => {
    if (publicKey) {
      window.open(
        `https://explorer.solana.com/address/${publicKey.toString()}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    if (isOpen && publicKey) {
      fetchBalance();
    }
  }, [isOpen, publicKey, connection]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const walletAddress = publicKey?.toString() || "";
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 opacity-90"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 cursor-pointer z-20"
          aria-label="Close wallet details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Wallet Connected
            </h2>
            <p className="text-gray-400 text-sm">
              Your wallet is successfully connected
            </p>
          </div>

          {/* Connected Status */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-green-400 text-sm font-medium">
                Connected to {wallet?.adapter?.name || "Wallet"}
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-gray-700/50">
            <div className="space-y-4">
              {/* Network */}
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <Globe className="w-4 h-4 mr-3 text-purple-400" />
                  <span className="text-sm">Network</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  <span className="text-white font-medium text-sm">
                    Mainnet
                  </span>
                </div>
              </div>

              {/* Balance */}
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <Wallet className="w-4 h-4 mr-3 text-blue-400" />
                  <span className="text-sm">Balance</span>
                </div>
                <div className="flex items-center">
                  <span className="text-white font-bold text-sm mr-2">
                    {balance !== null ? `${balance.toFixed(4)} SOL` : "—"}
                  </span>
                  <button
                    onClick={fetchBalance}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-700/50 disabled:opacity-50"
                    aria-label="Refresh balance"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <Copy className="w-4 h-4 mr-3 text-green-400" />
                  <span className="text-sm">Address</span>
                </div>
                <div className="flex items-center">
                  <code className="text-white font-mono text-sm mr-2 bg-gray-700/50 px-2 py-1 rounded">
                    {shortAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="text-gray-400 hover:text-green-400 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-700/50"
                    aria-label="Copy address to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {copySuccess && (
            <div className="text-center mb-4">
              <span className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Copied to clipboard!
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={openInExplorer}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 h-11 font-medium cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Explorer
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="flex-1 bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 h-11 font-medium cursor-pointer transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
