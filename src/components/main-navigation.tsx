"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { Menu, X, Wallet, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LoginModal } from "./login-modal";
import { CustomWalletSelectionModal } from "./custom-wallet-selection-modal";
import Link from "next/link";
import { WalletModal } from "@/components/wallet-modal";

export function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCustomWalletModalOpen, setIsCustomWalletModalOpen] = useState(false);
  const { connected, publicKey, connecting } = useWallet();
  const pathname = usePathname();

  useEffect(() => {
    if (connected) {
      setIsCustomWalletModalOpen(false);
    }
  }, [connected]);

  // Check if we're on landing page or dashboard pages
  const isLandingPage = pathname === "/";
  const isDashboardPage = [
    "/dashboard",
    "/performance",
    "/about",
    "/access",
  ].includes(pathname);

  // Smooth scroll function for landing page sections
  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleConnectClick = () => {
    if (connected) {
      setIsWalletModalOpen(true);
    } else if (pathname === "/") {
      setIsLoginModalOpen(true);
    } else {
      setIsCustomWalletModalOpen(true);
    }
  };

  const getConnectButtonText = () => {
    if (connecting) {
      return "CONNECTING...";
    }
    if (connected && publicKey) {
      return `${publicKey.toString().slice(0, 4)}...${publicKey
        .toString()
        .slice(-4)}`;
    }
    if (pathname === "/") return "REI STREET";
    return "CONNECT";
  };

  const getButtonStyles = () => {
    const baseStyles =
      "px-6 py-2 font-bold uppercase tracking-wide text-sm border-2 transition-all duration-300 hover:scale-105 flex items-center cursor-pointer";
    if (connecting) {
      return `${baseStyles} bg-yellow-500/20 border-yellow-400 text-yellow-400 cursor-not-allowed`;
    }
    if (pathname === "/") {
      return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-black hover:from-green-400 hover:to-emerald-400`;
    } else if (connected) {
      return `${baseStyles} bg-green-500/20 border-green-400 text-green-400 hover:bg-green-500/30`;
    } else {
      return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-black hover:from-green-400 hover:to-emerald-400`;
    }
  };

  const isActivePage = (path: string) => pathname === path;

  const getCurrentTier = () => {
    // Mock function to get current tier - in real app this would come from props or context
    const userTokens = 0; // Since token isn't launched yet

    const accessTiers = [
      {
        name: "Street Rookie",
        tokensRequired: 0,
        textClass: "text-gray-400",
        bgClass: "bg-gray-500/20",
      },
      {
        name: "Degen Gambler",
        tokensRequired: 25000,
        textClass: "text-red-400",
        bgClass: "bg-red-500/20",
      },
      {
        name: "Speed Demon",
        tokensRequired: 50000,
        textClass: "text-green-400",
        bgClass: "bg-green-500/20",
      },
      {
        name: "Alpha King",
        tokensRequired: 100000,
        textClass: "text-yellow-400",
        bgClass: "bg-yellow-500/20",
      },
    ];

    const qualifiedTiers = accessTiers.filter(
      (tier) => userTokens >= tier.tokensRequired
    );
    return qualifiedTiers.reduce((highest, current) =>
      current.tokensRequired > highest.tokensRequired ? current : highest
    );
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative cursor-pointer">
              <div className="text-2xl font-black text-green-400 tracking-wider font-heading">
                <Link
                  href={isLandingPage ? "/" : "/dashboard"}
                  className="relative cursor-pointer"
                >
                  <div className="text-2xl font-black text-green-400 tracking-wider font-heading">
                    REI9
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Conditional based on page type */}
          <div className="hidden md:flex items-center space-x-8">
            {isLandingPage ? (
              // Landing page scroll navigation
              <>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("features")}
                >
                  FEATURES
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("collection")}
                >
                  COLLECTION
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("signals")}
                >
                  SIGNALS
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("crew")}
                >
                  CREW
                </Button>
              </>
            ) : (
              // Dashboard page routing navigation
              <>
                <Link
                  href="/dashboard"
                  className={`font-bold uppercase tracking-wide transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/dashboard")
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                >
                  DASHBOARD
                </Link>
                <Link
                  href="/performance"
                  className={`font-bold uppercase tracking-wide transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/performance")
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                >
                  PERFORMANCE
                </Link>
                <Link
                  href="/about"
                  className={`font-bold uppercase tracking-wide transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/about")
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                >
                  ABOUT
                </Link>
                <Link
                  href="/access"
                  className={`font-bold uppercase tracking-wide transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/access")
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                >
                  ACCESS
                </Link>
              </>
            )}
          </div>

          {/* Right Side - Wallet Button with Tier Info */}
          <div className="flex items-center space-x-4">
            {connected ? (
              <div className="flex items-center space-x-3">
                {/* Tier Badge */}
                <div
                  className={`hidden md:flex items-center px-3 py-1 rounded-full border ${
                    getCurrentTier().bgClass
                  } ${getCurrentTier().textClass} border-current/30`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  <span className="text-xs font-bold">
                    {getCurrentTier().name}
                  </span>
                </div>

                {/* Wallet Button */}
                <button
                  onClick={handleConnectClick}
                  className={getButtonStyles()}
                  disabled={connecting}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {getConnectButtonText()}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                className={getButtonStyles()}
                disabled={connecting}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {getConnectButtonText()}
              </button>
            )}

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

      {/* Mobile Menu - Conditional based on page type */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-green-500/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 space-y-2">
            {/* Mobile Tier Badge */}
            {connected && (
              <div className="mb-4 flex justify-center">
                <div
                  className={`flex items-center px-3 py-2 rounded-full border ${
                    getCurrentTier().bgClass
                  } ${getCurrentTier().textClass} border-current/30`}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  <span className="text-sm font-bold">
                    Current Tier: {getCurrentTier().name}
                  </span>
                </div>
              </div>
            )}

            {/* Rest of mobile menu items remain the same */}
            {isLandingPage ? (
              // Landing page mobile menu
              <>
                <Button
                  variant="ghost"
                  className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("features")}
                >
                  FEATURES
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("collection")}
                >
                  COLLECTION
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("signals")}
                >
                  SIGNALS
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase transition-colors duration-200 cursor-pointer"
                  onClick={() => scrollToSection("crew")}
                >
                  CREW
                </Button>
              </>
            ) : (
              // Dashboard mobile menu
              <>
                <Link
                  href="/dashboard"
                  className={`block w-full text-left font-bold uppercase transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/dashboard")
                      ? "text-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
                <Link
                  href="/performance"
                  className={`block w-full text-left font-bold uppercase transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/performance")
                      ? "text-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  PERFORMANCE
                </Link>
                <Link
                  href="/about"
                  className={`block w-full text-left font-bold uppercase transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/about")
                      ? "text-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ABOUT
                </Link>
                <Link
                  href="/access"
                  className={`block w-full text-left font-bold uppercase transition-colors duration-200 px-3 py-2 rounded ${
                    isActivePage("/access")
                      ? "text-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ACCESS
                </Link>
              </>
            )}

            {/* Mobile Connect Button */}
            <button
              onClick={handleConnectClick}
              className={`${getButtonStyles()} w-full justify-start mt-4`}
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
