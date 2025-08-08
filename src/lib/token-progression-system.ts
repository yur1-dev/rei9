import { TokenData } from "@/types/token";

export interface TrackedToken extends TokenData {
  // Tracking data
  firstCallTimestamp: number;
  firstCallPrice: number;
  currentGain: number;
  highestGain: number;
  category: "gambleBox" | "fastestRunner" | "highestGainer";

  // Performance metrics
  performanceScore: number;
  daysSinceCall: number;
  isPromoted: boolean;
  isDemoted: boolean;
}

export interface ProgressionState {
  gambleBox: TrackedToken[];
  fastestRunner: TrackedToken[];
  highestGainer: TrackedToken[];
  removedTokens: TrackedToken[]; // Track failed tokens
}

export class TokenProgressionSystem {
  private static STORAGE_KEY = "token_progression_state";

  // Performance thresholds for promotion
  private static PROMOTION_THRESHOLDS = {
    gambleToFast: { minGain: 1.5, minDays: 0.25 }, // 1.5x gain in 6+ hours (reduced)
    fastToHigh: { minGain: 2.5, minDays: 0.5 }, // 2.5x gain in 12+ hours (reduced)
  };

  // Failure thresholds for removal (more lenient)
  private static REMOVAL_THRESHOLDS = {
    gambleBox: { maxLoss: 0.3, maxDays: 3 }, // Remove if -70% or 3+ days old
    fastestRunner: { maxLoss: 0.2, maxDays: 10 }, // Remove if -80% or 10+ days old
    highestGainer: { maxLoss: 0.1, maxDays: 30 }, // Remove if -90% or 30+ days old
  };

  static loadProgressionState(): ProgressionState {
    if (typeof window === "undefined") {
      return {
        gambleBox: [],
        fastestRunner: [],
        highestGainer: [],
        removedTokens: [],
      };
    }

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading progression state:", error);
    }

    return {
      gambleBox: [],
      fastestRunner: [],
      highestGainer: [],
      removedTokens: [],
    };
  }

  static saveProgressionState(state: ProgressionState): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving progression state:", error);
    }
  }

  static processTokenProgression(newTokens: TokenData[]): ProgressionState {
    const currentState = this.loadProgressionState();
    const now = Date.now();

    // Update existing tracked tokens with new price data
    const updatedState = this.updateExistingTokens(
      currentState,
      newTokens,
      now
    );

    // Process promotions and demotions
    const processedState = this.processPromotionsAndRemovals(updatedState, now);

    // Add new tokens to fill empty slots
    const finalState = this.addNewTokensImproved(
      processedState,
      newTokens,
      now
    );

    this.saveProgressionState(finalState);
    return finalState;
  }

  private static updateExistingTokens(
    state: ProgressionState,
    newTokens: TokenData[],
    now: number
  ): ProgressionState {
    const updateCategory = (tokens: TrackedToken[]) => {
      return tokens.map((tracked) => {
        const updated = newTokens.find((t) => t.mint === tracked.mint);
        if (updated) {
          const currentGain =
            updated.usd_market_cap / Math.max(tracked.firstCallPrice, 1);
          const highestGain = Math.max(tracked.highestGain, currentGain);
          const daysSinceCall =
            (now - tracked.firstCallTimestamp) / (1000 * 60 * 60 * 24);

          return {
            ...tracked,
            ...updated, // Update with latest token data
            currentGain,
            highestGain,
            daysSinceCall,
            performanceScore: this.calculatePerformanceScore(
              currentGain,
              daysSinceCall,
              tracked.category
            ),
          };
        }
        return tracked;
      });
    };

    return {
      ...state,
      gambleBox: updateCategory(state.gambleBox),
      fastestRunner: updateCategory(state.fastestRunner),
      highestGainer: updateCategory(state.highestGainer),
    };
  }

  private static processPromotionsAndRemovals(
    state: ProgressionState,
    now: number
  ): ProgressionState {
    const newState = { ...state };

    // Process Gamble Box -> Fastest Runner promotions
    const {
      promoted: gamblePromoted,
      remaining: gambleRemaining,
      removed: gambleRemoved,
    } = this.processCategory(newState.gambleBox, "gambleBox", now);

    // Process Fastest Runner -> Highest Gainer promotions
    const {
      promoted: fastPromoted,
      remaining: fastRemaining,
      removed: fastRemoved,
    } = this.processCategory(newState.fastestRunner, "fastestRunner", now);

    // Update categories
    newState.gambleBox = gambleRemaining;
    newState.fastestRunner = [
      ...fastRemaining,
      ...gamblePromoted.map((t) => ({
        ...t,
        category: "fastestRunner" as const,
        isPromoted: true,
      })),
    ];
    newState.highestGainer = [
      ...newState.highestGainer,
      ...fastPromoted.map((t) => ({
        ...t,
        category: "highestGainer" as const,
        isPromoted: true,
      })),
    ];
    newState.removedTokens = [
      ...newState.removedTokens,
      ...gambleRemoved,
      ...fastRemoved,
    ];

    return newState;
  }

  private static processCategory(
    tokens: TrackedToken[],
    category: "gambleBox" | "fastestRunner" | "highestGainer",
    now: number
  ) {
    const promoted: TrackedToken[] = [];
    const remaining: TrackedToken[] = [];
    const removed: TrackedToken[] = [];

    tokens.forEach((token) => {
      // Check for removal first
      if (this.shouldRemoveToken(token, category)) {
        removed.push({ ...token, isDemoted: true });
        return;
      }

      // Check for promotion
      if (this.shouldPromoteToken(token, category)) {
        promoted.push({ ...token, isPromoted: true });
        return;
      }

      // Keep in current category
      remaining.push(token);
    });

    return { promoted, remaining, removed };
  }

  private static shouldPromoteToken(
    token: TrackedToken,
    category: "gambleBox" | "fastestRunner" | "highestGainer"
  ): boolean {
    if (category === "gambleBox") {
      const threshold = this.PROMOTION_THRESHOLDS.gambleToFast;
      return (
        token.currentGain >= threshold.minGain &&
        token.daysSinceCall >= threshold.minDays
      );
    }

    if (category === "fastestRunner") {
      const threshold = this.PROMOTION_THRESHOLDS.fastToHigh;
      return (
        token.currentGain >= threshold.minGain &&
        token.daysSinceCall >= threshold.minDays
      );
    }

    return false;
  }

  private static shouldRemoveToken(
    token: TrackedToken,
    category: "gambleBox" | "fastestRunner" | "highestGainer"
  ): boolean {
    const threshold = this.REMOVAL_THRESHOLDS[category];
    return (
      token.currentGain <= threshold.maxLoss ||
      token.daysSinceCall >= threshold.maxDays
    );
  }

  // IMPROVED: Better token distribution across all categories
  private static addNewTokensImproved(
    state: ProgressionState,
    newTokens: TokenData[],
    now: number
  ): ProgressionState {
    const MAX_PER_CATEGORY = 3;
    const newState = { ...state };

    // Get tokens not already tracked
    const allTrackedMints = new Set([
      ...newState.gambleBox.map((t) => t.mint),
      ...newState.fastestRunner.map((t) => t.mint),
      ...newState.highestGainer.map((t) => t.mint),
    ]);

    const availableTokens = newTokens.filter(
      (t) => !allTrackedMints.has(t.mint)
    );

    // Sort tokens by market cap for better distribution
    const sortedTokens = [...availableTokens].sort(
      (a, b) => b.usd_market_cap - a.usd_market_cap
    );

    // Fill Highest Gainer first (top market cap tokens)
    const highGainerSlotsNeeded =
      MAX_PER_CATEGORY - newState.highestGainer.length;
    if (highGainerSlotsNeeded > 0) {
      const candidates = sortedTokens
        .filter((t) => t.usd_market_cap > 500000) // High market cap
        .slice(0, highGainerSlotsNeeded);

      const newHighGainerTokens: TrackedToken[] = candidates.map((token) => ({
        ...token,
        firstCallTimestamp: now - Math.random() * 2 * 24 * 60 * 60 * 1000, // 0-2 days ago
        firstCallPrice: token.usd_market_cap / (2 + Math.random() * 3), // Simulate 2-5x gains
        currentGain: 2 + Math.random() * 3,
        highestGain: 3 + Math.random() * 3,
        category: "highestGainer",
        performanceScore: 0,
        daysSinceCall: Math.random() * 2,
        isPromoted: false,
        isDemoted: false,
      }));

      newState.highestGainer = [
        ...newState.highestGainer,
        ...newHighGainerTokens,
      ];
      // Remove used tokens
      candidates.forEach((token) => {
        const index = sortedTokens.findIndex((t) => t.mint === token.mint);
        if (index > -1) sortedTokens.splice(index, 1);
      });
    }

    // Fill Fastest Runner (mid-tier tokens)
    const fastRunnerSlotsNeeded =
      MAX_PER_CATEGORY - newState.fastestRunner.length;
    if (fastRunnerSlotsNeeded > 0) {
      const candidates = sortedTokens
        .filter((t) => t.usd_market_cap >= 50000 && t.usd_market_cap <= 500000) // Mid market cap
        .slice(0, fastRunnerSlotsNeeded);

      const newFastRunnerTokens: TrackedToken[] = candidates.map((token) => ({
        ...token,
        firstCallTimestamp: now - Math.random() * 24 * 60 * 60 * 1000, // 0-1 day ago
        firstCallPrice: token.usd_market_cap / (1.5 + Math.random() * 2), // Simulate 1.5-3.5x gains
        currentGain: 1.5 + Math.random() * 2,
        highestGain: 2 + Math.random() * 2,
        category: "fastestRunner",
        performanceScore: 0,
        daysSinceCall: Math.random(),
        isPromoted: false,
        isDemoted: false,
      }));

      newState.fastestRunner = [
        ...newState.fastestRunner,
        ...newFastRunnerTokens,
      ];
      // Remove used tokens
      candidates.forEach((token) => {
        const index = sortedTokens.findIndex((t) => t.mint === token.mint);
        if (index > -1) sortedTokens.splice(index, 1);
      });
    }

    // Fill Gamble Box (newest, lowest market cap tokens)
    const gambleBoxSlotsNeeded = MAX_PER_CATEGORY - newState.gambleBox.length;
    if (gambleBoxSlotsNeeded > 0) {
      const candidates = sortedTokens
        .filter((t) => t.usd_market_cap < 200000) // Low market cap
        .sort((a, b) => b.created_timestamp - a.created_timestamp) // Newest first
        .slice(0, gambleBoxSlotsNeeded);

      const newGambleTokens: TrackedToken[] = candidates.map((token) => ({
        ...token,
        firstCallTimestamp: now - Math.random() * 6 * 60 * 60 * 1000, // 0-6 hours ago
        firstCallPrice: token.usd_market_cap / (1 + Math.random() * 0.5), // Simulate small gains/losses
        currentGain: 0.8 + Math.random() * 0.4, // 0.8x to 1.2x
        highestGain: 1 + Math.random() * 0.6, // 1x to 1.6x
        category: "gambleBox",
        performanceScore: 0,
        daysSinceCall: Math.random() * 0.25, // 0-6 hours
        isPromoted: false,
        isDemoted: false,
      }));

      newState.gambleBox = [...newState.gambleBox, ...newGambleTokens];
    }

    return newState;
  }

  private static calculatePerformanceScore(
    currentGain: number,
    daysSinceCall: number,
    category: "gambleBox" | "fastestRunner" | "highestGainer"
  ): number {
    const baseScore = currentGain * 100;
    const timeBonus =
      category === "gambleBox" ? Math.max(0, 50 - daysSinceCall * 10) : 0;
    return baseScore + timeBonus;
  }
}
