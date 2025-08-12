"use client";

import type React from "react";

import { MainNavigation } from "@/components/main-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Lock,
  Zap,
  Star,
  CheckCircle,
  X,
  Wallet,
  Target,
  Sparkles,
  Eye,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { WalletModal } from "@/components/wallet-modal";
import { CustomWalletSelectionModal } from "@/components/custom-wallet-selection-modal";

interface AccessTier {
  name: string;
  requirement: string;
  tokensRequired: number;
  features: string[];
  premiumFeatures: string[];
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  buttonClass: string;
  icon: React.ReactNode;
  available: boolean;
  category: string;
}

export default function AccessPage() {
  const { connected, publicKey } = useWallet();
  const [userTokens, setUserTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCustomWalletModalOpen, setIsCustomWalletModalOpen] = useState(false);

  const checkTokenBalance = async () => {
    if (!connected || !publicKey) return;

    setIsLoading(true);
    // Simulate API call to check token balance
    setTimeout(() => {
      // Since REI9 token is not launched yet, show 0 balance
      setUserTokens(0);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (connected) {
      checkTokenBalance();
    }
  }, [connected]);

  const handleConnectClick = () => {
    if (connected) {
      setIsWalletModalOpen(true);
    } else {
      setIsCustomWalletModalOpen(true);
    }
  };

  const accessTiers: AccessTier[] = [
    {
      name: "Street Rookie",
      requirement: "Free Access",
      tokensRequired: 0,
      features: [
        "Basic token tracking",
        "Public dashboard access",
        "Community chat access",
        "Basic market data",
        "Standard refresh rates",
      ],
      premiumFeatures: [],
      color: "gray",
      bgClass: "bg-gray-900/20",
      borderClass: "border-gray-500/30",
      textClass: "text-gray-400",
      buttonClass:
        "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border-gray-500/30",
      icon: <Lock className="w-6 h-6" />,
      available: true,
      category: "Basic Hustle",
    },
    {
      name: "Degen Gambler",
      requirement: "25K REI9 Tokens",
      tokensRequired: 25000,
      features: [
        "All Street Level features",
        "Early token alerts (<$5K MC)",
        "High-risk/high-reward signals",
        "Degen play notifications",
        "Risk assessment tools",
      ],
      premiumFeatures: [
        "🎲 Exclusive gamble box picks",
        "⚡ Lightning-fast alerts",
        "🔥 High volatility tracking",
        "💎 Diamond hand indicators",
        "🚨 Rug pull warnings",
      ],
      color: "red",
      bgClass: "bg-red-900/20",
      borderClass: "border-red-500/30",
      textClass: "text-red-400",
      buttonClass:
        "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30",
      icon: <Target className="w-6 h-6" />,
      available: userTokens >= 25000,
      category: "High Risk Plays",
    },
    {
      name: "Speed Demon",
      requirement: "50K REI9 Tokens",
      tokensRequired: 50000,
      features: [
        "All previous tier features",
        "Mid-cap momentum tracking ($5K-$50K)",
        "Growth trajectory analysis",
        "Community sentiment scoring",
        "Balanced risk/reward signals",
      ],
      premiumFeatures: [
        "⚡ Fastest runner predictions",
        "📈 Momentum indicators",
        "🎯 Sweet spot targeting",
        "🔍 Deep market analysis",
        "💪 Strong fundamental picks",
      ],
      color: "green",
      bgClass: "bg-green-900/20",
      borderClass: "border-green-500/30",
      textClass: "text-green-400",
      buttonClass:
        "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30",
      icon: <Zap className="w-6 h-6" />,
      available: userTokens >= 50000,
      category: "Fast Money",
    },
    {
      name: "Alpha King",
      requirement: "100K REI9 Tokens",
      tokensRequired: 100000,
      features: [
        "All previous tier features",
        "Established token analysis (>$50K MC)",
        "Proven track record insights",
        "Lower risk profile signals",
        "Portfolio management tools",
      ],
      premiumFeatures: [
        "👑 Elite gainer predictions",
        "🏆 Proven winner tracking",
        "📊 Advanced analytics",
        "🛡️ Risk management suite",
        "💰 Profit optimization",
      ],
      color: "yellow",
      bgClass: "bg-yellow-900/20",
      borderClass: "border-yellow-500/30",
      textClass: "text-yellow-400",
      buttonClass:
        "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30",
      icon: <Crown className="w-6 h-6" />,
      available: userTokens >= 100000,
      category: "Elite Status",
    },
  ];

  const getCurrentTier = () => {
    const qualifiedTiers = accessTiers.filter(
      (tier) => userTokens >= tier.tokensRequired
    );
    return qualifiedTiers.reduce((highest, current) =>
      current.tokensRequired > highest.tokensRequired ? current : highest
    );
  };

  const getAccessStatus = (tier: AccessTier) => {
    if (!connected) return "Connect Wallet";
    if (tier.tokensRequired === 0) return "Active";
    if (userTokens >= tier.tokensRequired) return "Unlocked";
    return "Locked";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Unlocked":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Locked":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const currentTier = getCurrentTier();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-950 via-black to-black" />
      <div className="fixed inset-0 opacity-5 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <MainNavigation />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mt-8">
            <h1 className="text-4xl md:text-6xl font-black text-green-400 tracking-wider font-heading">
              ACCESS TIERS
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Unlock exclusive alpha with REI9 tokens. Each tier gives you
              deeper access to our AI-powered trading intelligence.
            </p>
          </div>

          {/* Wallet Status */}
          {connected ? (
            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm max-w-3xl mx-auto">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="text-white font-bold">
                        {publicKey?.toString().slice(0, 8)}...
                        {publicKey?.toString().slice(-8)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Connected Wallet
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">
                      {isLoading ? "..." : userTokens.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">REI9 Tokens</div>
                  </div>
                </div>

                {/* Current Tier Badge */}
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-bold">
                      Current Tier: {currentTier.name}
                    </span>
                  </div>
                  <div className="text-center mt-1 text-sm text-gray-400">
                    {currentTier.category}
                  </div>
                </div>

                {/* Token Launch Status */}
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      REI9 Token Launch Coming Soon
                    </span>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    Premium tiers will be available after token launch. Get
                    ready to secure your access!
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-yellow-900/20 border-yellow-500/30 max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <Wallet className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-300 mb-4">
                  Connect your Solana wallet to check your REI9 token balance
                  and unlock access tiers.
                </p>
                <Button
                  onClick={handleConnectClick}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold cursor-pointer transition-all duration-200 hover:scale-105"
                >
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Access Tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6 items-stretch">
            {accessTiers.map((tier, index) => {
              const status = getAccessStatus(tier);
              const isUnlocked = status === "Active" || status === "Unlocked";

              return (
                <Card
                  key={index}
                  className={`${tier.bgClass} ${
                    tier.borderClass
                  } border backdrop-blur-sm transition-all duration-300 h-full flex flex-col ${
                    isUnlocked
                      ? "hover:border-opacity-60 shadow-lg hover:shadow-xl"
                      : ""
                  } hover:transform hover:scale-[1.02]`}
                >
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={
                            isUnlocked ? tier.textClass : "text-gray-500"
                          }
                        >
                          {tier.icon}
                        </div>
                        <div>
                          <CardTitle
                            className={`text-lg ${
                              isUnlocked ? tier.textClass : "text-white"
                            }`}
                          >
                            {tier.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400 text-sm">
                            {tier.category}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        className={getStatusColor(status)}
                        style={{ fontSize: "10px", padding: "2px 6px" }}
                      >
                        {status}
                      </Badge>
                    </div>

                    {/* Token Requirement */}
                    <div className="text-center p-3 bg-black/30 rounded-lg border border-gray-700">
                      <div className="text-xl font-bold text-white mb-1">
                        {tier.tokensRequired === 0
                          ? "FREE"
                          : `${tier.tokensRequired.toLocaleString()}`}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {tier.tokensRequired === 0
                          ? "No tokens required"
                          : "REI9 Tokens Required"}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between text-sm">
                    {/* Standard Features */}
                    <div>
                      <h4 className="text-white font-bold mb-2 flex items-center text-sm">
                        <Star className="w-3 h-3 mr-1 text-blue-400" />
                        Standard Features
                      </h4>
                      <div className="space-y-1">
                        {tier.features
                          .slice(0, 4)
                          .map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center space-x-2"
                            >
                              {isUnlocked ? (
                                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <X className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              )}
                              <span
                                className={`text-xs ${
                                  isUnlocked ? "text-gray-300" : "text-gray-500"
                                }`}
                              >
                                {feature}
                              </span>
                            </div>
                          ))}
                        {tier.features.length > 4 && (
                          <div className="text-xs text-gray-500 italic">
                            +{tier.features.length - 4} more features
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Premium Features */}
                    {tier.premiumFeatures.length > 0 && (
                      <div>
                        <h4
                          className={`font-bold mb-2 flex items-center text-sm ${tier.textClass}`}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Premium Alpha Features
                        </h4>
                        <div className="space-y-1">
                          {tier.premiumFeatures
                            .slice(0, 3)
                            .map((feature, featureIndex) => (
                              <div
                                key={featureIndex}
                                className="flex items-center space-x-2"
                              >
                                {isUnlocked ? (
                                  <Crown
                                    className={`w-3 h-3 flex-shrink-0 ${tier.textClass}`}
                                  />
                                ) : (
                                  <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                )}
                                <span
                                  className={`text-xs font-medium ${
                                    isUnlocked
                                      ? tier.textClass
                                      : "text-gray-500"
                                  }`}
                                >
                                  {feature}
                                </span>
                              </div>
                            ))}
                          {tier.premiumFeatures.length > 3 && (
                            <div
                              className={`text-xs italic ${tier.textClass} opacity-70`}
                            >
                              +{tier.premiumFeatures.length - 3} more premium
                              features
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Access Indicator */}
                    {isUnlocked && (
                      <div
                        className={`${tier.bgClass} ${tier.borderClass} border p-3 rounded-lg`}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <Eye className={`w-4 h-4 ${tier.textClass}`} />
                          <span
                            className={`font-bold text-xs ${tier.textClass}`}
                          >
                            ✨ ACCESS GRANTED ✨
                          </span>
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-gray-300 text-xs">
                            Full access to all {tier.name} features
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Buy Tokens CTA */}
                    {!isUnlocked && tier.tokensRequired > 0 && (
                      <Button
                        className={`w-full ${tier.buttonClass} border font-bold py-2 text-xs cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md`}
                      >
                        Buy{" "}
                        {(tier.tokensRequired - userTokens).toLocaleString()}{" "}
                        More REI9 Tokens
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* How to Get Tokens */}
          <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">
                How to Get REI9 Tokens
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                Follow these simple steps to unlock premium access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto transition-all duration-200 hover:bg-green-500/30 cursor-pointer">
                    <span className="text-green-400 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-bold text-white">Buy on DEX</h3>
                  <p className="text-gray-400 text-sm">
                    Purchase REI9 tokens on Raydium, Jupiter, or other Solana
                    DEXs
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto transition-all duration-200 hover:bg-green-500/30 cursor-pointer">
                    <span className="text-green-400 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-bold text-white">Hold in Wallet</h3>
                  <p className="text-gray-400 text-sm">
                    Keep tokens in your connected Solana wallet for automatic
                    detection
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto transition-all duration-200 hover:bg-green-500/30 cursor-pointer">
                    <span className="text-green-400 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-bold text-white">Access Unlocked</h3>
                  <p className="text-gray-400 text-sm">
                    Instant access when you reach tier requirements
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold px-8 py-3 text-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  Buy REI9 Tokens Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
        <CustomWalletSelectionModal
          isOpen={isCustomWalletModalOpen}
          onClose={() => setIsCustomWalletModalOpen(false)}
        />
      </main>
    </div>
  );
}
