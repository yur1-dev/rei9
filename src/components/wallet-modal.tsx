"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
  CheckCircle,
  Crown,
  Star,
  TrendingUp,
  Target,
  Zap,
  Lock,
  Settings,
  BarChart3,
  Calendar,
  Globe,
} from "lucide-react";

interface AccessTier {
  name: string;
  category: string;
  tokensRequired: number;
  textClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ReactNode;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { publicKey, disconnect, wallet } = useWallet();
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in real app this would come from API/blockchain
  const userTokens = 0; // Since token isn't launched yet
  const totalEarnings = 0;
  const successfulTrades = 0;
  const winRate = 0;

  const accessTiers: AccessTier[] = [
    {
      name: "Street Rookie",
      category: "Basic Hustle",
      tokensRequired: 0,
      textClass: "text-gray-400",
      bgClass: "bg-gray-900/20",
      borderClass: "border-gray-500/30",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      name: "Degen Gambler",
      category: "High Risk Plays",
      tokensRequired: 25000,
      textClass: "text-red-400",
      bgClass: "bg-red-900/20",
      borderClass: "border-red-500/30",
      icon: <Target className="w-4 h-4" />,
    },
    {
      name: "Speed Demon",
      category: "Fast Money",
      tokensRequired: 50000,
      textClass: "text-green-400",
      bgClass: "bg-green-900/20",
      borderClass: "border-green-500/30",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      name: "Alpha King",
      category: "Elite Status",
      tokensRequired: 100000,
      textClass: "text-yellow-400",
      bgClass: "bg-yellow-900/20",
      borderClass: "border-yellow-500/30",
      icon: <Crown className="w-4 h-4" />,
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

  const getNextTier = () => {
    return accessTiers.find((tier) => userTokens < tier.tokensRequired);
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
  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
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

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Settings className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">
                Account Dashboard
              </h2>
            </div>
            <p className="text-gray-400 text-sm">
              Manage your REI9 account and view your trading stats
            </p>
          </div>

          {/* Current Tier Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${currentTier.bgClass} ${currentTier.borderClass} border`}
                >
                  {currentTier.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {currentTier.name}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {currentTier.category}
                  </div>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ACTIVE
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
              <TabsTrigger
                value="overview"
                className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="tokens"
                className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                Tokens
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">
                        Wallet Status
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-400 mt-1">
                      Connected
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">REI9 Tokens</span>
                    </div>
                    <div className="text-lg font-bold text-green-400 mt-1">
                      {userTokens.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Wallet Info */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">
                    Wallet Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Network</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-white text-sm">Solana Mainnet</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Wallet</span>
                    <span className="text-white text-sm">
                      {wallet?.adapter?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Address</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-white font-mono text-sm bg-gray-700/50 px-2 py-1 rounded">
                        {shortAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(walletAddress)}
                        className="text-gray-400 hover:text-green-400 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4 mt-4">
              {/* Token Holdings */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Token Holdings
                  </CardTitle>
                  <CardDescription>
                    Your current REI9 token balance and tier status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {userTokens.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm">REI9 Tokens</div>
                  </div>

                  {/* Next Tier Progress */}
                  {nextTier && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Progress to {nextTier.name}
                        </span>
                        <span className="text-gray-400">
                          {userTokens.toLocaleString()} /{" "}
                          {nextTier.tokensRequired.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={(userTokens / nextTier.tokensRequired) * 100}
                        className="h-2"
                      />
                      <div className="text-center text-sm text-gray-400">
                        {(
                          nextTier.tokensRequired - userTokens
                        ).toLocaleString()}{" "}
                        tokens needed for next tier
                      </div>
                    </div>
                  )}

                  {/* Token Launch Status */}
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">
                        REI9 Token Launch Coming Soon
                      </span>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                      Premium tiers will be available after token launch
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 mt-4">
              {/* Trading Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">
                        Total Earnings
                      </span>
                    </div>
                    <div className="text-xl font-bold text-green-400 mt-1">
                      ${totalEarnings.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Win Rate</span>
                    </div>
                    <div className="text-xl font-bold text-blue-400 mt-1">
                      {winRate}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Trading Performance
                  </CardTitle>
                  <CardDescription>
                    Your AI-assisted trading statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No trading data available yet</p>
                    <p className="text-sm mt-2">
                      Start using REI9 signals to see your performance here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              {/* Account Actions */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Account Actions
                  </CardTitle>
                  <CardDescription>
                    Manage your wallet and account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={openInExplorer}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Solana Explorer
                  </Button>

                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                </CardContent>
              </Card>

              {/* Network Info */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Network Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <Globe className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-sm">Network</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-white font-medium text-sm">
                        Solana Mainnet
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <Wallet className="w-4 h-4 mr-3 text-green-400" />
                      <span className="text-sm">Status</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-400 font-medium text-sm">
                        Connected
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {copySuccess && (
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Address copied to clipboard!
                  </span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
