"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomWalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomWalletSelectionModal({
  isOpen,
  onClose,
}: CustomWalletSelectionModalProps) {
  const { wallets, select, connecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      setSelectedWallet(walletName);
      select(walletName);
      // Wallet adapter will manage the connection flow.
      // Close the modal in parent once connected.
    } catch (error) {
      console.error("Error selecting wallet:", error);
      setSelectedWallet(null);
    }
  };

  const getWalletIcon = (walletName: string) => {
    switch (walletName.toLowerCase()) {
      case "phantom":
        return (
          <Image
            src="/phantom.png"
            alt="Phantom Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-contain"
          />
        );
      case "metamask":
        return (
          <Image
            src="/metamask.png"
            alt="MetaMask Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-contain"
          />
        );
      case "solflare":
        return (
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
        );
    }
  };

  const getWalletDescription = (walletName: string) => {
    switch (walletName.toLowerCase()) {
      case "phantom":
        return "Solana wallet";
      case "metamask":
        return "Ethereum wallet";
      case "solflare":
        return "Solana web wallet";
      default:
        return "Crypto wallet";
    }
  };

  // Always include installed wallets, and add MetaMask if not detected
  const customWalletList = [
    ...wallets.filter((w) => w.readyState === "Installed"),
    ...(wallets.some((w) => w.adapter.name.toLowerCase() === "metamask")
      ? []
      : [
          {
            adapter: { name: "MetaMask" },
            readyState: "NotDetected" as const,
          },
        ]),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-gray-900 border-0 rounded-2xl w-full max-w-md p-0"
        style={{
          animation: "none",
          transform: "none",
          transition: "none",
          animationDuration: "0s",
          transitionDuration: "0s",
        }}
      >
        <DialogHeader className="relative p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Connect Your Wallet
          </DialogTitle>
          <p className="text-gray-400 text-center mt-2 text-sm">
            Choose your preferred wallet to get started
          </p>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          ></button>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-3">
          {customWalletList.map((wallet) => {
            const isInstalled = wallet.readyState === "Installed";
            const name = wallet.adapter.name;
            const isConnecting = connecting && selectedWallet === name;
            return (
              <button
                key={name}
                onClick={() =>
                  isInstalled && handleWalletSelect(name as WalletName)
                }
                disabled={!isInstalled || connecting}
                className="w-full flex items-center justify-between p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {getWalletIcon(name)}
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">
                      {name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {getWalletDescription(name)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="bg-gray-600 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                      {isInstalled ? "Popular" : "Install"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {customWalletList.length > 2 && (
            <button className="w-full p-4 text-center text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:bg-gray-700/30">
              <span className="text-sm">▼ Show more wallets</span>
            </button>
          )}
          <div className="pt-4 text-center">
            <p className="text-xs text-gray-500">
              By connecting a wallet, you agree to our{" "}
              <span className="text-blue-400 cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-400 cursor-pointer hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
