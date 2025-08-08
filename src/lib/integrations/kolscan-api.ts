// KolScan API Integration
const KOLSCAN_BASE = "https://api.kolscan.io";

export interface KolScanToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  marketCap: number;
  volume24h: number;
  priceUsd: number;
  priceChange24h: number;
  holders: number;
  transactions24h: number;
  createdAt: string;
  social?: {
    twitter?: string;
    telegram?: string;
    website?: string;
  };
  metrics: {
    liquidity: number;
    fdv: number;
    buys24h: number;
    sells24h: number;
  };
}

export async function fetchKolScanTrendingTokens(): Promise<KolScanToken[]> {
  try {
    const response = await fetch(
      `${KOLSCAN_BASE}/v1/tokens/trending?limit=50`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; TokenTracker/1.0)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`KolScan API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching from KolScan:", error);
    throw error;
  }
}

export async function fetchKolScanNewTokens(): Promise<KolScanToken[]> {
  try {
    const response = await fetch(`${KOLSCAN_BASE}/v1/tokens/new?limit=50`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`KolScan API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching new tokens from KolScan:", error);
    throw error;
  }
}
