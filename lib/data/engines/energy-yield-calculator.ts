import { kv } from "@vercel/kv";

interface TapEvent {
  sender: string;
  energy: number;
  integral: number;
  timestamp: number;
}

interface EnergyYieldMetrics {
  // Daily yield metrics
  energyPerDay: number;
  energyPerToken: number;
  energyEfficiency: number;  // Energy generated per token per day

  // Historical performance
  totalEnergy: number;
  totalDays: number;
  averageHoldings: number;

  // Projection metrics
  projectedDailyEnergy: number;
  projectedWeeklyEnergy: number;
  projectedMonthlyEnergy: number;
}

export class EnergyYieldCalculator {
  // Constants
  private static BLOCKS_PER_DAY = 144; // (24 hours * 60 minutes) / 10 minutes per block
  private static MILLISECONDS_PER_BLOCK = 600000; // 10 minutes in milliseconds

  /**
   * Calculates energy yield metrics for a user or the system
   */
  static calculateEnergyYield(taps: TapEvent[]): EnergyYieldMetrics {
    if (taps.length === 0) {
      return this.getEmptyMetrics();
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
    const averageHoldings = totalIntegral / periodBlocks;
    const energyPerDay = totalEnergy / periodDays;

    // Calculate efficiency metrics
    const energyPerToken = averageHoldings > 0 ? totalEnergy / averageHoldings : 0;
    const energyEfficiency = averageHoldings > 0 ? energyPerDay / averageHoldings : 0;

    // Calculate projections based on recent performance
    // Use last 7 days of data if available, otherwise use all data
    const recentPeriod = Math.min(periodDays, 7);
    const recentTaps = this.getRecentTaps(sortedTaps, recentPeriod);
    const recentEnergyPerDay = this.calculateRecentEnergyRate(recentTaps);

    return {
      // Daily metrics
      energyPerDay: energyPerDay,
      energyPerToken: energyPerToken,
      energyEfficiency: energyEfficiency,

      // Historical data
      totalEnergy: totalEnergy,
      totalDays: periodDays,
      averageHoldings: averageHoldings,

      // Projections
      projectedDailyEnergy: recentEnergyPerDay,
      projectedWeeklyEnergy: recentEnergyPerDay * 7,
      projectedMonthlyEnergy: recentEnergyPerDay * 30,
    };
  }

  /**
   * Formats energy numbers for display
   */
  static formatEnergyMetric(value: number, decimals = 2): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(decimals)}M Energy`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(decimals)}K Energy`;
    }
    return `${value.toFixed(decimals)} Energy`;
  }

  /**
   * Creates human-readable yield report
   */
  static createYieldReport(metrics: EnergyYieldMetrics): string {
    return `Energy Generation Report:
    • Daily Generation: ${this.formatEnergyMetric(metrics.energyPerDay)}
    • Energy per Token: ${this.formatEnergyMetric(metrics.energyPerToken)}
    • Efficiency: ${this.formatEnergyMetric(metrics.energyEfficiency)} per token/day
    
    Projected Generation:
    • Daily: ${this.formatEnergyMetric(metrics.projectedDailyEnergy)}
    • Weekly: ${this.formatEnergyMetric(metrics.projectedWeeklyEnergy)}
    • Monthly: ${this.formatEnergyMetric(metrics.projectedMonthlyEnergy)}
    
    Historical Performance:
    • Total Energy Generated: ${this.formatEnergyMetric(metrics.totalEnergy)}
    • Average Token Holdings: ${Math.round(metrics.averageHoldings)}
    • Days Active: ${Math.round(metrics.totalDays)}`;
  }

  private static getEmptyMetrics(): EnergyYieldMetrics {
    return {
      energyPerDay: 0,
      energyPerToken: 0,
      energyEfficiency: 0,
      totalEnergy: 0,
      totalDays: 0,
      averageHoldings: 0,
      projectedDailyEnergy: 0,
      projectedWeeklyEnergy: 0,
      projectedMonthlyEnergy: 0
    };
  }

  private static getRecentTaps(sortedTaps: TapEvent[], days: number): TapEvent[] {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return sortedTaps.filter(tap => tap.timestamp >= cutoffTime);
  }

  private static calculateRecentEnergyRate(recentTaps: TapEvent[]): number {
    if (recentTaps.length === 0) return 0;
    const totalEnergy = recentTaps.reduce((acc, tap) => acc + Number(tap.energy), 0);
    const daysPassed = (recentTaps[recentTaps.length - 1].timestamp - recentTaps[0].timestamp) / (24 * 60 * 60 * 1000);
    return totalEnergy / Math.max(daysPassed, 1);
  }
}

// Example usage with your existing code:
export async function getEnergyYieldData() {
  const taps: TapEvent[] = await kv.lrange('tap-events', 0, 999);
  const metrics = EnergyYieldCalculator.calculateEnergyYield(taps);
  return {
    metrics,
    formattedReport: EnergyYieldCalculator.createYieldReport(metrics)
  };
}

export async function getUserEnergyYield(userAddress: string) {
  const taps: TapEvent[] = await kv.lrange('tap-events', 0, 999);
  console.log(taps)
  const userTaps = taps.filter(tap => tap.sender === userAddress);
  return EnergyYieldCalculator.calculateEnergyYield(userTaps);
}