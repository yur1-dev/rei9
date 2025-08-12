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
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Activity, Zap, Crown } from "lucide-react";
import { useState } from "react";

interface PerformanceMetrics {
  totalCalls: number;
  successfulCalls: number;
  winRate: number;
  avgGain: number;
  bestCall: {
    token: string;
    gain: number;
    timestamp: string;
  };
  recentCalls: Array<{
    id: string;
    token: string;
    category: string;
    prediction: number;
    actual: number;
    status: "success" | "failed" | "pending";
    timestamp: string;
  }>;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalCalls: 247,
    successfulCalls: 189,
    winRate: 76.5,
    avgGain: 12.8,
    bestCall: {
      token: "$BONK",
      gain: 847.2,
      timestamp: "2h ago",
    },
    recentCalls: [
      {
        id: "1",
        token: "$PEPE",
        category: "Highest Gainer",
        prediction: 15.5,
        actual: 23.2,
        status: "success",
        timestamp: "1h ago",
      },
      {
        id: "2",
        token: "$DOGE",
        category: "Fastest Runner",
        prediction: 8.2,
        actual: 12.1,
        status: "success",
        timestamp: "3h ago",
      },
      {
        id: "3",
        token: "$SHIB",
        category: "Gamble Box",
        prediction: 25.0,
        actual: -5.2,
        status: "failed",
        timestamp: "5h ago",
      },
      {
        id: "4",
        token: "$FLOKI",
        category: "Fastest Runner",
        prediction: 12.0,
        actual: 0,
        status: "pending",
        timestamp: "30m ago",
      },
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Highest Gainer":
        return <Crown className="w-4 h-4" />;
      case "Fastest Runner":
        return <Zap className="w-4 h-4" />;
      case "Gamble Box":
        return <Target className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-950 via-black to-black" />
      <div className="fixed inset-0 opacity-5 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <MainNavigation />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12 pt-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-green-400 tracking-wider font-heading">
              PERFORMANCE
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Track your AI analysis accuracy and win rates across all token
              categories
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Total Calls
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-white">
                  {metrics.totalCalls}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400">
                  <Activity className="w-4 h-4 mr-2" />
                  <span className="text-sm">All time</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Win Rate
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-green-400">
                  {metrics.winRate}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={metrics.winRate} className="h-2" />
                <div className="flex items-center text-green-400 mt-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {metrics.successfulCalls}/{metrics.totalCalls} successful
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Avg Gain
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-green-400">
                  +{metrics.avgGain}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">Per successful call</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">
                  Best Call
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-yellow-400">
                  {metrics.bestCall.token} +{metrics.bestCall.gain}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-yellow-400">
                  <Crown className="w-4 h-4 mr-2" />
                  <span className="text-sm">{metrics.bestCall.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Calls */}
          <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Recent Analysis Calls
              </CardTitle>
              <CardDescription className="text-gray-400">
                Latest predictions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(call.category)}
                        <span className="font-bold text-white">
                          {call.token}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-gray-400 border-gray-600"
                      >
                        {call.category}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Predicted</div>
                        <div className="font-bold text-blue-400">
                          +{call.prediction}%
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-400">Actual</div>
                        <div
                          className={`font-bold ${
                            call.status === "pending"
                              ? "text-yellow-400"
                              : call.actual > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {call.status === "pending"
                            ? "Pending"
                            : call.actual > 0
                            ? `+${call.actual}%`
                            : `${call.actual}%`}
                        </div>
                      </div>

                      <Badge className={getStatusColor(call.status)}>
                        {call.status.toUpperCase()}
                      </Badge>

                      <div className="text-sm text-gray-500 min-w-[60px] text-right">
                        {call.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Highest Gainer
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-yellow-400 font-bold">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Gain</span>
                    <span className="text-yellow-400 font-bold">+18.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Calls</span>
                    <span className="text-yellow-400 font-bold">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-green-400">
                    Fastest Runner
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-green-400 font-bold">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Gain</span>
                    <span className="text-green-400 font-bold">+12.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Calls</span>
                    <span className="text-green-400 font-bold">94</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-400" />
                  <CardTitle className="text-red-400">Gamble Box</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-red-400 font-bold">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Gain</span>
                    <span className="text-red-400 font-bold">+8.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Calls</span>
                    <span className="text-red-400 font-bold">64</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
