import { kv } from "@vercel/kv";

interface TapEvent {
  sender: string;
  energy: number;
  integral: number;
  timestamp: number;
}

interface TapAnalytics {
  totalEnergy: number;
  totalIntegral: number;
  averageEnergyPerIntegral: number;
  apy: number;
  periodDays: number;
  averageHoldings: number;
}

interface UserAnalytics {
  totalEnergy: number;
  totalIntegral: number;
  averageHoldings: number;
  apy: number;
  lastTap: number;
  firstTap: number;
}

export class TapAnalyticsCalculator {
  // Constants
  private static BLOCKS_PER_DAY = 144; // (24 hours * 60 minutes) / 10 minutes per block
  private static BLOCKS_PER_YEAR = 52560; // 365 * BLOCKS_PER_DAY
  private static MILLISECONDS_PER_BLOCK = 600000; // 10 minutes in milliseconds

  /**
   * Calculates time-based metrics from tap events
   * @param taps Array of tap events
   * @returns Analytics including APY
   */
  static calculateAnalytics(taps: TapEvent[], energyValue: number): TapAnalytics {
    if (taps.length === 0) {
      return {
        totalEnergy: 0,
        totalIntegral: 0,
        averageEnergyPerIntegral: 0,
        apy: 0,
        periodDays: 0,
        averageHoldings: 0
      };
    }

    // Sort taps by timestamp
    const sortedTaps = [...taps].sort((a, b) => a.timestamp - b.timestamp);
    const firstTap = sortedTaps[0];
    const lastTap = sortedTaps[sortedTaps.length - 1];

    // Calculate period metrics
    const periodMilliseconds = lastTap.timestamp - firstTap.timestamp;
    const periodDays = periodMilliseconds / (24 * 60 * 60 * 1000);
    const periodBlocks = Math.max(periodMilliseconds / this.MILLISECONDS_PER_BLOCK, 1);

    // Calculate totals
    const totalEnergy = taps.reduce((acc, tap) => acc + Number(tap.energy), 0);
    const totalIntegral = taps.reduce((acc, tap) => acc + Number(tap.integral), 0);

    // Calculate averages
    const averageEnergyPerIntegral = totalIntegral > 0 ? totalEnergy / totalIntegral : 0;
    const averageHoldings = totalIntegral / periodBlocks;

    // Calculate APY
    const annualEnergy = (totalEnergy / periodBlocks) * this.BLOCKS_PER_YEAR;
    const annualValue = annualEnergy * energyValue;
    const apy = averageHoldings > 0 ? (annualValue / averageHoldings) * 100 : 0;

    return {
      totalEnergy,
      totalIntegral,
      averageEnergyPerIntegral,
      apy,
      periodDays,
      averageHoldings
    };
  }

  /**
   * Calculates analytics for a specific user
   * @param taps Array of tap events
   * @param userAddress User's blockchain address
   * @returns User-specific analytics
   */
  static calculateUserAnalytics(
    taps: TapEvent[],
    userAddress: string,
    energyValue: number
  ): UserAnalytics | null {
    const userTaps = taps.filter(tap => tap.sender === userAddress);

    if (userTaps.length === 0) {
      return null;
    }

    // Sort user's taps by timestamp
    const sortedTaps = [...userTaps].sort((a, b) => a.timestamp - b.timestamp);
    const firstTap = sortedTaps[0];
    const lastTap = sortedTaps[sortedTaps.length - 1];

    // Calculate period in blocks
    const periodMilliseconds = lastTap.timestamp - firstTap.timestamp;
    const periodBlocks = Math.max(periodMilliseconds / this.MILLISECONDS_PER_BLOCK, 1);

    // Calculate totals
    const totalEnergy = userTaps.reduce((acc, tap) => acc + Number(tap.energy), 0);
    const totalIntegral = userTaps.reduce((acc, tap) => acc + Number(tap.integral), 0);

    // Calculate averages
    const averageHoldings = totalIntegral / periodBlocks;

    // Calculate APY
    const annualEnergy = (totalEnergy / periodBlocks) * this.BLOCKS_PER_YEAR;
    const annualValue = annualEnergy * energyValue;
    const apy = averageHoldings > 0 ? (annualValue / averageHoldings) * 100 : 0;

    return {
      totalEnergy,
      totalIntegral,
      averageHoldings,
      apy,
      firstTap: firstTap.timestamp,
      lastTap: lastTap.timestamp
    };
  }

  /**
   * Enhanced version of your getTapData function with additional metrics
   */
  static async getEnhancedTapData(kv: any, energyValue: number) {
    const taps: TapEvent[] = await kv.lrange('tap-events', 0, 999);
    const analytics = this.calculateAnalytics(taps, energyValue);

    // Get unique users
    const uniqueUsers = new Set(taps.map(tap => tap.sender));

    // Additional metrics
    const totalTaps = taps.length;
    const averageTapsPerUser = totalTaps / uniqueUsers.size;

    return {
      ...analytics,
      totalTaps,
      uniqueUsers: uniqueUsers.size,
      averageTapsPerUser,
      recentTaps: taps.slice(0, 10) // Last 10 taps
    };
  }

  /**
   * Projects future earnings based on current holdings and rates
   */
  static projectEarnings(
    currentHoldings: number,
    averageEnergyPerIntegral: number,
    energyValue: number,
    days = 365
  ) {
    const projectedBlocks = days * this.BLOCKS_PER_DAY;
    const projectedIntegral = currentHoldings * projectedBlocks;
    const projectedEnergy = projectedIntegral * averageEnergyPerIntegral;
    const projectedValue = projectedEnergy * energyValue;

    return {
      projectedEnergy,
      projectedValue,
      dailyEnergy: projectedEnergy / days,
      dailyValue: projectedValue / days,
      projectedAPY: (projectedValue / currentHoldings) * 100
    };
  }
}

// Example usage with your existing code:
export async function getEnhancedTapData() {
  const energyValue = 1; // Set this to your actual energy-to-token conversion rate
  return await TapAnalyticsCalculator.getEnhancedTapData(kv, energyValue);
}

export async function getUserAnalytics(userAddress: string) {
  const taps: TapEvent[] = await kv.lrange('tap-events', 0, 999);
  const energyValue = 1; // Set this to your actual energy-to-token conversion rate
  return TapAnalyticsCalculator.calculateUserAnalytics(taps, userAddress, energyValue);
}