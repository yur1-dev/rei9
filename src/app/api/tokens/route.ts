import { NextResponse } from "next/server";
import { TokenData } from "@/types/token";

const PUMP_API_BASE = "https://frontend-api.pump.fun";

// Mock data as fallback
const mockTokens: TokenData[] = [
  {
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    name: "Pepe",
    symbol: "PEPE",
    description: "The most memeable memecoin in existence",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111112",
    created_timestamp: Date.now() - 3600000, // 1 hour ago
    complete: false,
    virtual_sol_reserves: 30,
    virtual_token_reserves: 1073000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 85000000,
    reply_count: 1247,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 85000,
  },
  {
    mint: "8GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW3hr",
    name: "Doge Killer",
    symbol: "DOGEK",
    description: "The next big thing in memecoins",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111113",
    created_timestamp: Date.now() - 7200000, // 2 hours ago
    complete: false,
    virtual_sol_reserves: 25,
    virtual_token_reserves: 950000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 45000000,
    reply_count: 892,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 45000,
  },
  {
    mint: "9GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW4hr",
    name: "Moon Shot",
    symbol: "MOON",
    description: "To the moon and beyond",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111114",
    created_timestamp: Date.now() - 1800000, // 30 minutes ago
    complete: false,
    virtual_sol_reserves: 15,
    virtual_token_reserves: 800000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 25000000,
    reply_count: 456,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 25000,
  },
  {
    mint: "AGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW5hr",
    name: "Shiba Inu 2.0",
    symbol: "SHIB2",
    description: "The evolution of Shiba",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111115",
    created_timestamp: Date.now() - 10800000, // 3 hours ago
    complete: false,
    virtual_sol_reserves: 8,
    virtual_token_reserves: 600000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 12000000,
    reply_count: 234,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 12000,
  },
  {
    mint: "BGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW6hr",
    name: "Rug Pull Survivor",
    symbol: "RPS",
    description: "Survived the rug, now we moon",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111116",
    created_timestamp: Date.now() - 900000, // 15 minutes ago
    complete: false,
    virtual_sol_reserves: 5,
    virtual_token_reserves: 400000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 8000000,
    reply_count: 123,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 8000,
  },
  {
    mint: "CGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW7hr",
    name: "Diamond Hands",
    symbol: "DIAMOND",
    description: "For true diamond hands only",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111117",
    created_timestamp: Date.now() - 14400000, // 4 hours ago
    complete: false,
    virtual_sol_reserves: 3,
    virtual_token_reserves: 200000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 3500000,
    reply_count: 67,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 3500,
  },
  {
    mint: "DGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW8hr",
    name: "Gamble Coin",
    symbol: "GAMBLE",
    description: "Pure gambling, no utility",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111118",
    created_timestamp: Date.now() - 600000, // 10 minutes ago
    complete: false,
    virtual_sol_reserves: 2,
    virtual_token_reserves: 150000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 1500000,
    reply_count: 89,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 1500,
  },
  {
    mint: "EGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymW9hr",
    name: "Trash Panda",
    symbol: "TRASH",
    description: "One man's trash is another's treasure",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111119",
    created_timestamp: Date.now() - 300000, // 5 minutes ago
    complete: false,
    virtual_sol_reserves: 1,
    virtual_token_reserves: 100000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 800000,
    reply_count: 34,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 800,
  },
  {
    mint: "FGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHymWAhr",
    name: "YOLO Token",
    symbol: "YOLO",
    description: "You only live once, might as well gamble",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111120",
    created_timestamp: Date.now() - 1200000, // 20 minutes ago
    complete: false,
    virtual_sol_reserves: 0.5,
    virtual_token_reserves: 50000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 500000,
    reply_count: 12,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 500,
  },
];

async function fetchFromPumpFun(endpoint: string): Promise<TokenData[]> {
  try {
    const response = await fetch(`${PUMP_API_BASE}${endpoint}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching from pump.fun:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "50";
  const sort = searchParams.get("sort") || "created_timestamp";

  try {
    // Try to fetch from the real API first
    const endpoint = `/coins?offset=0&limit=${limit}&sort=${sort}&order=DESC&includeNsfw=false`;
    let tokens = await fetchFromPumpFun(endpoint);

    // If no data from API, use mock data
    if (tokens.length === 0) {
      console.log("Using mock data as fallback");
      tokens = mockTokens;
    }

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("API route error:", error);
    // Return mock data on error
    return NextResponse.json(mockTokens);
  }
}
