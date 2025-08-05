"use client";

import { Button } from "@/components/ui/button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Menu, X, Wallet } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LoginModal } from "./login-modal"; // Import the LoginModal

export function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const pathname = usePathname();

  // Determine which connect button to show based on the current path
  const showConnectToLoginButton = pathname === "/"; // Show "CONNECT" button on landing page
  const showConnectPhantomButton = pathname === "/ai-alpha"; // Show "CONNECT PHANTOM" button on AI Alpha page

  const handleConnectClick = () => {
    setIsLoginModalOpen(true); // Open the login modal
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-green-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo: Changed to REI9 and applied font-heading */}
          <div className="flex items-center">
            <div className="relative cursor-pointer">
              <div className="text-2xl font-black text-green-400 tracking-wider font-heading">
                REI9
              </div>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide cursor-pointer"
            >
              ABOUT
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide cursor-pointer"
            >
              COLLECTION
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide cursor-pointer"
            >
              SIGNALS
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 font-bold uppercase tracking-wide cursor-pointer"
            >
              CREW
            </Button>
          </div>
          {/* Right Side - Conditional Buttons */}
          <div className="flex items-center space-x-4">
            {showConnectToLoginButton && (
              <Button
                onClick={handleConnectClick} // Now opens the login modal
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 !bg-green-500 hover:!bg-green-400 !text-black !font-bold !border-2 !border-green-400 !uppercase !tracking-wide cursor-pointer"
              >
                CONNECT
              </Button>
            )}
            {showConnectPhantomButton && (
              <Button
                onClick={() => setWalletModalVisible(true)} // Opens Solana wallet modal
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 !bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !uppercase !tracking-wide cursor-pointer"
              >
                <Wallet className="w-4 h-4 mr-2" />
                CONNECT
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-green-400 cursor-pointer"
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
        <div className="md:hidden bg-black border-t border-green-500/20">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase cursor-pointer"
            >
              ABOUT
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase cursor-pointer"
            >
              COLLECTION
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase cursor-pointer"
            >
              SIGNALS
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left text-gray-300 hover:text-green-400 font-bold uppercase cursor-pointer"
            >
              CREW
            </Button>
            {showConnectToLoginButton && ( // Added for mobile menu
              <Button
                onClick={handleConnectClick} // Now opens the login modal
                className="w-full text-left inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 !bg-green-500 hover:!bg-green-400 !text-black !font-bold !border-2 !border-green-400 !uppercase !tracking-wide cursor-pointer"
              >
                CONNECT
              </Button>
            )}
            {showConnectPhantomButton && ( // Added for mobile menu
              <Button
                onClick={() => setWalletModalVisible(true)}
                className="w-full text-left !bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !uppercase !tracking-wide cursor-pointer"
              >
                <Wallet className="w-4 h-4 mr-2" />
                CONNECT
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Render the LoginModal here, controlled by state */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </nav>
  );
}
