"use client";

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
  Brain,
  Zap,
  Target,
  Crown,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description:
        "Advanced machine learning algorithms analyze market patterns, social sentiment, and trading volumes to identify high-potential tokens.",
      color: "text-blue-400",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-Time Tracking",
      description:
        "Live data streams from PumpFun and DexScreener provide instant updates on token performance and market movements.",
      color: "text-green-400",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Categorization",
      description:
        "Tokens are automatically sorted into Gamble Box, Fastest Runner, and Highest Gainer categories based on market cap and potential.",
      color: "text-red-400",
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Premium Alpha",
      description:
        "Exclusive access to high-conviction calls and detailed analysis for token holders with 100k+ REI9 tokens.",
      color: "text-yellow-400",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Data Collection",
      description:
        "Our system continuously monitors PumpFun for new token launches and tracks existing tokens across multiple data sources.",
    },
    {
      step: "2",
      title: "AI Analysis",
      description:
        "Machine learning models analyze market cap, volume, social metrics, and trading patterns to score each token's potential.",
    },
    {
      step: "3",
      title: "Categorization",
      description:
        "Tokens are automatically sorted into risk categories: Gamble Box (<$5K), Fastest Runner ($5K-$50K), Highest Gainer (>$50K).",
    },
    {
      step: "4",
      title: "Real-Time Updates",
      description:
        "Live tracking provides instant updates on price movements, market cap changes, and trading activity.",
    },
  ];

  const stats = [
    {
      label: "Tokens Analyzed",
      value: "10,000+",
      icon: <Target className="w-5 h-5" />,
    },
    {
      label: "Win Rate",
      value: "76.5%",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Active Users",
      value: "2,500+",
      icon: <Users className="w-5 h-5" />,
    },
    { label: "Uptime", value: "99.9%", icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-950 via-black to-black" />
      <div className="fixed inset-0 opacity-5 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <MainNavigation />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12 pt-24">
        <div className="space-y-16">
          {/* Header */}
          <div className="text-center space-y-6 mt-8">
            <h1 className="text-4xl md:text-6xl font-black text-green-400 tracking-wider font-heading">
              ABOUT REI9
            </h1>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
              Underground Solana trading platform powered by AI. Raw alpha from
              the streets. No suits, no BS. Private members only.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm text-center"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2 text-green-400">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What Makes REI9 Different
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Cutting-edge technology meets street-smart trading intelligence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={feature.color}>{feature.icon}</div>
                      <CardTitle className="text-xl text-white">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                From raw data to actionable alpha in four simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-3 py-1">
                          {step.step}
                        </Badge>
                        {index < howItWorks.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-green-400/50 hidden lg:block" />
                        )}
                      </div>
                      <CardTitle className="text-lg text-white">
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Token Categories */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Token Categories
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Smart risk categorization based on market cap and potential
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-red-400" />
                    <div>
                      <CardTitle className="text-red-400">Gamble Box</CardTitle>
                      <CardDescription className="text-red-300/70">
                        High Risk, High Reward
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-red-400" />
                      <span>Market Cap: {"<$5K"}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-red-400" />
                      <span>Newest launches</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-red-400" />
                      <span>Highest volatility</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Fresh tokens with massive upside potential but significant
                    risk. Perfect for degen plays.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Zap className="w-8 h-8 text-green-400" />
                    <div>
                      <CardTitle className="text-green-400">
                        Fastest Runner
                      </CardTitle>
                      <CardDescription className="text-green-300/70">
                        Balanced Growth
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Market Cap: $5K-$50K</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Strong momentum</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Growing community</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Mid-tier tokens showing consistent growth and strong
                    fundamentals. The sweet spot.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <div>
                      <CardTitle className="text-yellow-400">
                        Highest Gainer
                      </CardTitle>
                      <CardDescription className="text-yellow-300/70">
                        Established Winners
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                      <span>Market Cap: {">$50K"}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                      <span>Proven track record</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                      <span>Lower risk profile</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Established tokens with strong performance history and
                    continued growth potential.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6">
            <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 max-w-2xl mx-auto">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Access the Alpha?
                </h3>
                <p className="text-gray-300 mb-6">
                  Join the underground. Get premium access with 100k+ REI9
                  tokens.
                </p>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold px-8 py-3">
                  Check Access Requirements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
