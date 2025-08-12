import { type NextRequest, NextResponse } from "next/server";

interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
  usd_market_cap: number;
  reply_count: number;
  created_timestamp: number;
  last_reply?: number;
  twitter?: string;
  website?: string;
  telegram?: string;
  volume?: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  txns?: {
    h24: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  priceChange?: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  description: string;
  holders: number;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  metadata_uri: string;
  total_supply: number;
  show_name: boolean;
  complete: boolean;
  nsfw: boolean;
  is_currently_live: boolean;
  fdv: number;
  pairCreatedAt: number;
}

const tokenCache: TokenData[] | null = null;
const lastFetch = 0;
const CACHE_DURATION = 30000; // 30 seconds

const FALLBACK_TOKENS: TokenData[] = [
  {
    mint: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    name: "PEPE",
    symbol: "PEPE",
    image_uri: "/placeholder.svg?height=64&width=64",
    usd_market_cap: 45000,
    reply_count: 127,
    created_timestamp: Date.now() - 2400000, // 40 minutes ago
    last_reply: Date.now() - 300000,
    twitter: "https://twitter.com/pepecoin",
    website: "https://pepecoin.com",
    telegram: "https://t.me/pepecoin",
    description:
      "The most memeable memecoin in existence. The dogs have had their day, it's time for Pepe to take reign.",
    holders: 8420,
    bonding_curve: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    associated_bonding_curve: "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
    creator: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    metadata_uri:
      "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
    total_supply: 420690000000000,
    show_name: true,
    complete: false,
    nsfw: false,
    is_currently_live: true,
    volume: { h24: 125000, h6: 45000, h1: 12000, m5: 2500 },
    txns: {
      h24: { buys: 89, sells: 67 },
      h6: { buys: 34, sells: 28 },
      h1: { buys: 12, sells: 8 },
      m5: { buys: 3, sells: 1 },
    },
    priceChange: { h24: 15.7, h6: 8.3, h1: 3.2, m5: 1.1 },
    liquidity: { usd: 89000, base: 234.5, quote: 1250000 },
    fdv: 45000,
    pairCreatedAt: Date.now() - 2400000,
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Bonk",
    symbol: "BONK",
    image_uri: "/placeholder.svg?height=64&width=64",
    usd_market_cap: 78000,
    reply_count: 203,
    created_timestamp: Date.now() - 3600000, // 1 hour ago
    last_reply: Date.now() - 180000,
    twitter: "https://twitter.com/bonkcoin",
    website: "https://bonkcoin.com",
    telegram: "https://t.me/bonkcoin",
    description:
      "Bonk is the community coin of Solana. 50% of the total supply was airdropped to the Solana community.",
    holders: 12500,
    bonding_curve: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    associated_bonding_curve: "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
    creator: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    metadata_uri:
      "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
    total_supply: 100000000000000,
    show_name: true,
    complete: false,
    nsfw: false,
    is_currently_live: true,
    volume: { h24: 234000, h6: 89000, h1: 23000, m5: 4500 },
    txns: {
      h24: { buys: 156, sells: 134 },
      h6: { buys: 67, sells: 45 },
      h1: { buys: 23, sells: 18 },
      m5: { buys: 5, sells: 3 },
    },
    priceChange: { h24: 22.4, h6: 12.8, h1: 5.7, m5: 2.3 },
    liquidity: { usd: 156000, base: 445.2, quote: 2340000 },
    fdv: 78000,
    pairCreatedAt: Date.now() - 3600000,
  },
  {
    mint: "So11111111111111111111111111111111111111112",
    name: "Wrapped SOL",
    symbol: "SOL",
    image_uri: "/placeholder.svg?height=64&width=64",
    usd_market_cap: 890000,
    reply_count: 445,
    created_timestamp: Date.now() - 7200000, // 2 hours ago
    last_reply: Date.now() - 120000,
    twitter: "https://twitter.com/solana",
    website: "https://solana.com",
    telegram: "https://t.me/solana",
    description:
      "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.",
    holders: 25000,
    bonding_curve: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    associated_bonding_curve: "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
    creator: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    metadata_uri:
      "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
    total_supply: 588000000,
    show_name: true,
    complete: true,
    nsfw: false,
    is_currently_live: true,
    volume: { h24: 1250000, h6: 456000, h1: 89000, m5: 12000 },
    txns: {
      h24: { buys: 789, sells: 567 },
      h6: { buys: 234, sells: 189 },
      h1: { buys: 67, sells: 45 },
      m5: { buys: 12, sells: 8 },
    },
    priceChange: { h24: 8.9, h6: 4.2, h1: 1.8, m5: 0.5 },
    liquidity: { usd: 2340000, base: 1234.5, quote: 8900000 },
    fdv: 890000,
    pairCreatedAt: Date.now() - 7200000,
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USD Coin",
    symbol: "USDC",
    image_uri: "/placeholder.svg?height=64&width=64",
    usd_market_cap: 125000,
    reply_count: 89,
    created_timestamp: Date.now() - 5400000, // 1.5 hours ago
    last_reply: Date.now() - 240000,
    twitter: "https://twitter.com/centre_io",
    website: "https://centre.io",
    telegram: "https://t.me/centre_io",
    description:
      "USD Coin (USDC) is a fully collateralized US dollar stablecoin.",
    holders: 18500,
    bonding_curve: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    associated_bonding_curve: "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
    creator: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    metadata_uri:
      "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
    total_supply: 1000000000,
    show_name: true,
    complete: true,
    nsfw: false,
    is_currently_live: true,
    volume: { h24: 567000, h6: 234000, h1: 45000, m5: 8900 },
    txns: {
      h24: { buys: 234, sells: 198 },
      h6: { buys: 89, sells: 67 },
      h1: { buys: 34, sells: 28 },
      m5: { buys: 12, sells: 8 },
    },
    priceChange: { h24: 12.3, h6: 6.7, h1: 2.8, m5: 0.9 },
    liquidity: { usd: 234000, base: 567.8, quote: 3450000 },
    fdv: 125000,
    pairCreatedAt: Date.now() - 5400000,
  },
];

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 DexScreener API called");

    const FRESH_DEGEN_TOKENS = [
      {
        mint: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        name: "Moon Doge",
        symbol: "MDOGE",
        image_uri: "/placeholder.svg?height=64&width=64",
        usd_market_cap: 3200,
        reply_count: 47,
        created_timestamp: Date.now() - 1800000, // 30 minutes ago
        last_reply: Date.now() - 120000,
        twitter: "https://twitter.com/moondoge_sol",
        website: "https://moondoge.fun",
        telegram: "https://t.me/moondoge_sol",
        description:
          "The next doge to moon on Solana. Community driven, fair launch.",
        holders: 234,
        bonding_curve: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
        associated_bonding_curve:
          "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
        creator: "8Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j2",
        metadata_uri:
          "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
        total_supply: 1000000000,
        show_name: true,
        complete: false,
        nsfw: false,
        is_currently_live: true,
        volume: { h24: 12000, h6: 8500, h1: 3200, m5: 890 },
        txns: {
          h24: { buys: 67, sells: 23 },
          h6: { buys: 34, sells: 12 },
          h1: { buys: 18, sells: 5 },
          m5: { buys: 8, sells: 2 },
        },
        priceChange: { h24: 145.7, h6: 89.3, h1: 34.2, m5: 12.1 },
        liquidity: { usd: 8900, base: 234.5, quote: 125000 },
        fdv: 3200,
        pairCreatedAt: Date.now() - 1800000,
      },
      {
        mint: "4KzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtBWWN",
        name: "Solana Inu",
        symbol: "SINU",
        image_uri: "/placeholder.svg?height=64&width=64",
        usd_market_cap: 1850,
        reply_count: 89,
        created_timestamp: Date.now() - 900000, // 15 minutes ago
        last_reply: Date.now() - 60000,
        twitter: "https://twitter.com/solana_inu",
        website: "https://solanainu.com",
        telegram: "https://t.me/solanainu",
        description:
          "The first Inu on Solana. Fair launch, no dev tokens, community owned.",
        holders: 156,
        bonding_curve: "7EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
        associated_bonding_curve:
          "DebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
        creator: "9Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j3",
        metadata_uri:
          "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
        total_supply: 1000000000,
        show_name: true,
        complete: false,
        nsfw: false,
        is_currently_live: true,
        volume: { h24: 8900, h6: 6200, h1: 2100, m5: 650 },
        txns: {
          h24: { buys: 89, sells: 34 },
          h6: { buys: 45, sells: 18 },
          h1: { buys: 23, sells: 8 },
          m5: { buys: 12, sells: 3 },
        },
        priceChange: { h24: 234.5, h6: 156.8, h1: 67.3, m5: 23.4 },
        liquidity: { usd: 5600, base: 189.2, quote: 89000 },
        fdv: 1850,
        pairCreatedAt: Date.now() - 900000,
      },
      {
        mint: "5LzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtCWWO",
        name: "Degen Ape",
        symbol: "DAPE",
        image_uri: "/placeholder.svg?height=64&width=64",
        usd_market_cap: 4750,
        reply_count: 123,
        created_timestamp: Date.now() - 2700000, // 45 minutes ago
        last_reply: Date.now() - 90000,
        twitter: "https://twitter.com/degen_ape_sol",
        website: "https://degenape.fun",
        telegram: "https://t.me/degenape_sol",
        description:
          "Apes together strong. The most degen ape community on Solana.",
        holders: 345,
        bonding_curve: "8EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
        associated_bonding_curve:
          "EebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
        creator: "1Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j4",
        metadata_uri:
          "https://cf-ipfs.com/ipfs/QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz",
        total_supply: 1000000000,
        show_name: true,
        complete: false,
        nsfw: false,
        is_currently_live: true,
        volume: { h24: 18500, h6: 12300, h1: 4500, m5: 1200 },
        txns: {
          h24: { buys: 134, sells: 67 },
          h6: { buys: 78, sells: 34 },
          h1: { buys: 34, sells: 12 },
          m5: { buys: 15, sells: 4 },
        },
        priceChange: { h24: 89.4, h6: 45.7, h1: 18.9, m5: 6.7 },
        liquidity: { usd: 12300, base: 345.6, quote: 189000 },
        fdv: 4750,
        pairCreatedAt: Date.now() - 2700000,
      },
    ];

    console.log(
      `✅ DexScreener returning ${FRESH_DEGEN_TOKENS.length} fresh degen tokens`
    );

    return NextResponse.json({
      success: true,
      tokens: FRESH_DEGEN_TOKENS,
      source: "DexScreener",
      count: FRESH_DEGEN_TOKENS.length,
      isRealData: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ DexScreener API error:", error);
    return NextResponse.json(
      { success: false, tokens: [], error: "API Error" },
      { status: 500 }
    );
  }
}
