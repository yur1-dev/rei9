import { TokenData } from "@/types/token";

// More diverse mock tokens for better variety
export const mockTokenPool: TokenData[] = [
  {
    mint: "LGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW14hr",
    name: "Bonk Killer",
    symbol: "BKILL",
    description: "The bonk killer has arrived",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111124",
    created_timestamp: Date.now() - 12 * 60 * 1000,
    complete: false,
    virtual_sol_reserves: 95,
    virtual_token_reserves: 450000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 234000,
    reply_count: 1456,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 234000,
    twitter: "https://twitter.com/bonkkiller",
  },
  {
    mint: "MGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW15hr",
    name: "Ape Escape",
    symbol: "ESCAPE",
    description: "Breaking free from the matrix",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111125",
    created_timestamp: Date.now() - 4 * 60 * 1000,
    complete: false,
    virtual_sol_reserves: 18,
    virtual_token_reserves: 110000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 78900,
    reply_count: 234,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 78900,
    telegram: "https://t.me/apeescape",
  },
  {
    mint: "NGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW16hr",
    name: "Solana Wizard",
    symbol: "WIZARD",
    description: "Magic happens on Solana",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111126",
    created_timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
    complete: true,
    virtual_sol_reserves: 800,
    virtual_token_reserves: 200000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 45600000,
    reply_count: 23400,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 45600000,
    twitter: "https://twitter.com/solanawizard",
    website: "https://solanawizard.com",
  },
  {
    mint: "OGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW17hr",
    name: "Pump Destroyer",
    symbol: "DESTROY",
    description: "Destroying the competition",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111127",
    created_timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    complete: false,
    virtual_sol_reserves: 65,
    virtual_token_reserves: 320000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 156000,
    reply_count: 789,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 156000,
    telegram: "https://t.me/pumpdestroyer",
  },
  {
    mint: "PGCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHyMW18hr",
    name: "Meme Lord",
    symbol: "LORD",
    description: "The ultimate meme ruler",
    image_uri: "/placeholder.svg?height=48&width=48",
    metadata_uri: "",
    bonding_curve: "",
    associated_bonding_curve: "",
    creator: "11111111111111111111111111111128",
    created_timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago
    complete: false,
    virtual_sol_reserves: 22,
    virtual_token_reserves: 130000000,
    total_supply: 1000000000,
    show_name: true,
    market_cap: 98700,
    reply_count: 445,
    nsfw: false,
    is_currently_live: true,
    usd_market_cap: 98700,
    twitter: "https://twitter.com/memelord",
  },
];

export function getRotatedMockTokens(): TokenData[] {
  const now = Date.now();

  return mockTokenPool.map((token) => ({
    ...token,
    // Simulate price movements
    usd_market_cap: Math.floor(
      token.usd_market_cap * (0.9 + Math.random() * 0.2)
    ),
    market_cap: Math.floor(token.market_cap * (0.9 + Math.random() * 0.2)),
    // Simulate activity
    reply_count: token.reply_count + Math.floor(Math.random() * 20),
    // Simulate time progression
    created_timestamp:
      token.created_timestamp - Math.floor(Math.random() * 60000), // ±1 minute
  }));
}
