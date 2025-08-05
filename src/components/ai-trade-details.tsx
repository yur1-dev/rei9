// NO 'use client' here! This must be a Server Component to be async.
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod"; // Import zod for schema definition
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  FlameIcon as Fire,
  KeyRound,
} from "lucide-react"; // Added KeyRound icon

// Define the Zod schema for the AI's structured output
const DegenTradeInsightSchema = z.object({
  token: z.string().describe("The memecoin token symbol, e.g., $BONK"),
  winRate: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "AI-predicted win rate percentage for this token based on degen strategies (0-100)."
    ),
  riskLevel: z
    .enum(["LOW", "MEDIUM", "HIGH", "EXTREME"])
    .describe("The risk level associated with trading this token."),
  degenComment: z
    .string()
    .describe("A short, street-smart comment or alpha signal for this token."),
});

const DegenTradeAnalysisSchema = z.object({
  overallDegenWinRate: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Overall AI-predicted win rate percentage for degen trades across the market (0-100)."
    ),
  topDegenInsights: z
    .array(DegenTradeInsightSchema)
    .max(3)
    .describe("Top 3 AI-detected degen trade opportunities."),
  marketVibe: z
    .string()
    .describe(
      "A short, street-smart summary of the current memecoin market vibe."
    ),
});

export async function AITradeDetails() {
  // --- DEBUGGING: Check if API key is loaded ---
  console.log(
    "OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY ? "Loaded" : "Missing"
  );
  // --- END DEBUGGING ---

  // Check if API key is missing before attempting to generate AI analysis
  if (!process.env.OPENAI_API_KEY) {
    return (
      <Card className="bg-red-900/20 border-red-500/30 rounded-sm p-4 text-center">
        <p className="text-red-400 text-lg font-bold flex items-center justify-center gap-2">
          <KeyRound className="w-6 h-6" />
          API Key Missing!
        </p>
        <p className="text-red-300 text-sm mt-2">
          Please set the `OPENAI_API_KEY` environment variable in your Vercel
          project settings.
        </p>
        <p className="text-red-300 text-xs mt-1">
          Go to Project Settings &gt; Environment Variables and add
          `OPENAI_API_KEY`.
        </p>
      </Card>
    );
  }

  let aiAnalysis: z.infer<typeof DegenTradeAnalysisSchema>;
  try {
    const result = await generateObject({
      model: openai("gpt-4o"), // Removed explicit apiKey parameter
      schema: DegenTradeAnalysisSchema,
      prompt: `You are an AI specializing in Solana memecoin degen trading. Analyze the current market and provide an overall win rate percentage for degen strategies. Identify the top 3 most promising or risky degen trade opportunities, including their token symbol, an AI-predicted win rate percentage (0-100), a risk level (LOW, MEDIUM, HIGH, EXTREME), and a concise, street-smart comment. Also, provide a short summary of the current memecoin market vibe. Focus on high-risk, high-reward scenarios typical of degen trading.`,
    });
    aiAnalysis = result.object;
  } catch (error) {
    console.error("Failed to generate AI analysis:", error);
    // Provide a fallback or error message if AI generation fails
    aiAnalysis = {
      overallDegenWinRate: 0,
      topDegenInsights: [],
      marketVibe: "AI offline. The streets are quiet. No alpha to report.",
    };
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 font-heading">
        <Zap className="w-5 h-5" />
        REI9 DEGEN ALPHA
      </h3>

      {/* Overall Degen Win Rate */}
      <Card className="bg-black/50 border-green-500/20 rounded-sm p-4 text-center">
        <p className="text-gray-400 text-sm uppercase font-bold">
          Overall Degen Win Rate
        </p>
        <p className="text-5xl font-black text-green-400 mt-2 font-heading">
          {aiAnalysis.overallDegenWinRate}%
        </p>
        <p className="text-gray-300 text-sm mt-2">{aiAnalysis.marketVibe}</p>
      </Card>

      <h4 className="text-lg font-bold text-white flex items-center gap-2 mt-8 font-heading">
        <Fire className="w-4 h-4 text-red-400" />
        Top Degen Plays
      </h4>
      <div className="space-y-4">
        {aiAnalysis.topDegenInsights.length > 0 ? (
          aiAnalysis.topDegenInsights.map((insight, index) => (
            <Card
              key={index}
              className="bg-black/50 border-green-500/20 rounded-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-white font-heading">
                    {insight.token}
                  </h4>
                  <Badge
                    className={`font-bold uppercase ${
                      insight.riskLevel === "EXTREME"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : insight.riskLevel === "HIGH"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    {insight.riskLevel} Risk
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {insight.winRate >= 50 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold ${
                      insight.winRate >= 50 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {insight.winRate}% Win Rate
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{insight.degenComment}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No degen plays detected. Stay sharp.
          </p>
        )}
      </div>
    </div>
  );
}
