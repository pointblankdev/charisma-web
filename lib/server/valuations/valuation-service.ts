import { PoolService } from '../pools/pool-service';

export class ValuationService {
  private static readonly STX_CHA_POOL_ID = 4;

  /**
   * Gets the current CHA per STX ratio from the STX-CHA pool
   * Returns tokens per STX (e.g., 2.5 means 1 STX = 2.5 CHA)
   */
  public static async getChaPerStx(): Promise<number> {
    try {
      const pool = await PoolService.getPool(this.STX_CHA_POOL_ID);
      const stxReserve = Number(pool.reserve0);
      const chaReserve = Number(pool.reserve1);

      // Both tokens have 6 decimals, so ratio is straightforward
      return chaReserve / stxReserve;
    } catch (error) {
      console.error('Error getting CHA/STX ratio:', error);
      return 0;
    }
  }
}