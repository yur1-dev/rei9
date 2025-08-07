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

  // Define only the wallets you want to support
  const supportedWallets = [
    {
      name: "Phantom",
      description: "Solana wallet",
      icon: (
        <Image
          src="/phantom.png"
          alt="Phantom Logo"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-contain"
        />
      ),
    },
    {
      name: "MetaMask",
      description: "Ethereum wallet",
      icon: (
        <Image
          src="/metamask.png"
          alt="MetaMask Logo"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-contain"
        />
      ),
    },
  ];

  // Check if wallet is installed
  const isWalletInstalled = (walletName: string) => {
    return wallets.some(
      (w) =>
        w.adapter.name.toLowerCase() === walletName.toLowerCase() &&
        w.readyState === "Installed"
    );
  };

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
        </DialogHeader>

        <div className="px-6 pb-6 space-y-3">
          {supportedWallets.map((wallet) => {
            const isInstalled = isWalletInstalled(wallet.name);
            const isConnecting = connecting && selectedWallet === wallet.name;

            return (
              <button
                key={wallet.name}
                onClick={() =>
                  isInstalled && handleWalletSelect(wallet.name as WalletName)
                }
                disabled={!isInstalled || connecting}
                className="w-full flex items-center justify-between p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {wallet.icon}
                  <div className="text-left">
                    <div className="text-white font-semibold text-lg">
                      {wallet.name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {wallet.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isInstalled
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {isInstalled ? "Ready" : "Install"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="pt-4 text-center">
            <p className="text-xs text-gray-500">
              By connecting a wallet, you agree to our{" "}
              <span className="text-green-400 cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-green-400 cursor-pointer hover:underline">
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
