"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { Menu, X, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { WalletModal } from "@/components/wallet-modal"; // Import the WalletModal
import { LoginModal } from "./login-modal"; // Import the LoginModal
import { CustomWalletSelectionModal } from "./custom-wallet-selection-modal"; // Import the new custom modal
import Link from "next/link";

export function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCustomWalletModalOpen, setIsCustomWalletModalOpen] = useState(false); // New state for custom wallet modal
  const { connected, publicKey, connecting } = useWallet();
  const pathname = usePathname();

  // Close custom wallet modal when wallet connects
  useEffect(() => {
    if (connected) {
      setIsCustomWalletModalOpen(false);
    }
  }, [connected]);

  const handleConnectClick = () => {
    if (connected) {
      // If wallet is connected, always show wallet details modal
      setIsWalletModalOpen(true);
    } else if (pathname === "/") {
      // If not connected AND on landing page, open login modal
      setIsLoginModalOpen(true);
    } else {
      // If not connected AND not on landing page, show CUSTOM wallet modal to connect
      setIsCustomWalletModalOpen(true);
    }
  };

  const getConnectButtonText = () => {
    if (connecting) {
      return "CONNECTING...";
    }
    if (connected && publicKey) {
      // Show shortened public key when connected
      return `${publicKey.toString().slice(0, 4)}...${publicKey
        .toString()
        .slice(-4)}`;
    }
    // Different text based on current page
    if (pathname === "/") return "REI STREET";
    if (pathname === "/ai-alpha") return "CONNECT";
    return "CONNECT WALLET";
  };

  const getButtonStyles = () => {
    const baseStyles =
      "px-6 py-2 font-bold uppercase tracking-wide text-sm border-2 transition-all duration-300 hover:scale-105 flex items-center cursor-pointer";

    if (connecting) {
      return `${baseStyles} bg-yellow-500/20 border-yellow-400 text-yellow-400 cursor-not-allowed`;
    }

    if (pathname === "/") {
      // Landing page style - vibrant gradient
      return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-black hover:from-green-400 hover:to-emerald-400`;
    } else if (connected) {
      // Connected state - subtle green background
      return `${baseStyles} bg-green-500/20 border-green-400 text-green-400 hover:bg-green-500/30`;
    } else {
      // Disconnected state - gradient background
      return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-black hover:from-green-400 hover:to-emerald-400`;
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-green-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative cursor-pointer">
              <div className="text-2xl font-black text-green-400 tracking-wider font-heading">
                <Link href="/" className="relative cursor-pointer">
                  <div className="text-2xl font-black text-green-400 tracking-wider font-heading">
                    REI9
                  </div>
                </Link>
              </div>
              {/* <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div> */}
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
            >
              ABOUT
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
            >
              COLLECTION
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
            >
              SIGNALS
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
            >
              CREW
            </Button>
          </div>
          {/* Right Side - Single Unified Connect Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleConnectClick}
              className={getButtonStyles()}
              disabled={connecting}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {getConnectButtonText()}
            </button>
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-green-400 hover:text-green-300 transition-colors duration-200 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-green-500/20">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
            >
              ABOUT
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
            >
              COLLECTION
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
            >
              SIGNALS
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
            >
              CREW
            </Button>
            {/* Mobile Connect Button */}
            <button
              onClick={handleConnectClick}
              className={`${getButtonStyles()} w-full justify-start`}
              disabled={connecting}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {getConnectButtonText()}
            </button>
          </div>
        </div>
      )}
      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <CustomWalletSelectionModal
        isOpen={isCustomWalletModalOpen}
        onClose={() => setIsCustomWalletModalOpen(false)}
      />
    </nav>
  );
}
