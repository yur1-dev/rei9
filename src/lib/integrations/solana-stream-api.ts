// SolanaStream API Integration
const SOLANA_STREAM_BASE = "https://api.solanastream.xyz";
const JWT_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJPVlRVUldFV1pWSUI1QlpQVTZQR0RQU1hTVENMTVpKVkdWSDRBWFlUSE9RUDRYSVNET1VRIiwiaWF0IjoxNzUzODc3NDkxLCJpc3MiOiJBQUNJUTNHNlNBQ00ySUtaVDVLRTdWM1pPWllBNldXNlhMWUVDTkRKUkdYRldFTzdJV1JDRkpWWCIsIm5hbWUiOiJkYjlhYjEwMy0xMWJiLTRhZGQtOTZkMy0wMjIzOTBjODcxYmEiLCJzdWIiOiJVQTNRQ1M1UFdDUlpIVkJRVFFZUEhITkNDT041NzZSSUhZQVhOVFJXSDNHUDcyT0dJV1VOVkRLMyIsIm5hdHMiOnsicHViIjp7ImRlbnkiOlsiJEpTLkFQSS5QVUJMSVNILlx1MDAzZSIsIlx1MDAzZSJdfSwic3ViIjp7ImFsbG93IjpbImJhc2ljLlx1MDAzZSJdfSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.qD-q4wCE4Q_yS1iVxDKB7qNxj_yaBotKjyUgd4WmLSft3pSJ5qKjQUtExcXz6v90ujlcIY9n2d8F5DprVKNKCwNKEY";

export interface SolanaStreamToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  createdAt: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  liquidity: number;
  fdv: number;
}

export async function fetchSolanaStreamTokens(): Promise<SolanaStreamToken[]> {
  try {
    const response = await fetch(`${SOLANA_STREAM_BASE}/v1/tokens/trending`, {
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SolanaStream API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching from SolanaStream:", error);
    throw error;
  }
}

export async function fetchSolanaStreamNewTokens(): Promise<
  SolanaStreamToken[]
> {
  try {
    const response = await fetch(`${SOLANA_STREAM_BASE}/v1/tokens/new`, {
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SolanaStream API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching new tokens from SolanaStream:", error);
    throw error;
  }
}
