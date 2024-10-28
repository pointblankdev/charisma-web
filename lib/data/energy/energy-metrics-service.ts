import { kv } from "@vercel/kv";

interface StoredTapEvent {
  event: {
    data: {
      contract_identifier: string;
      value: {
        energy: number;
        integral: number;
        sender: string;
        op: string;
      };
    };
  };
}

interface EngineMetrics {
  engineId: string;
  contractId: string;
  averageTokensHeld: number;             // integral / blocks
  energyPerBlock: number;                // energy / blocks
  energyPerBlockPerToken: number;        // energy / integral (this represents energy per block per token held)
  totalEnergy: number;
  totalIntegral: number;
}

export class EnergyMetricsService {
  static async getMetricsByContractId(contractId: string): Promise<EngineMetrics | null> {
    const events: StoredTapEvent[] = await kv.lrange('taps', 0, -1);

    const engineEvents = events.filter(e =>
      e.event.data.contract_identifier === contractId &&
      e.event.data.value.op === "ENERGY_GENERATED" &&
      e.event.data.value.energy > 0 &&
      e.event.data.value.integral > 0
    );

    if (engineEvents.length === 0) {
      return null;
    }

    return this.calculateEngineMetrics(contractId, engineEvents);
  }

  static async getAllMetrics(): Promise<EngineMetrics[]> {
    const events: StoredTapEvent[] = await kv.lrange('taps', 0, -1);

    const validEvents = events.filter(e =>
      e.event.data.value.op === "ENERGY_GENERATED" &&
      e.event.data.value.energy > 0 &&
      e.event.data.value.integral > 0
    );

    const eventsByEngine = this.groupEventsByEngine(validEvents);
    return Object.entries(eventsByEngine).map(([contractId, events]) =>
      this.calculateEngineMetrics(contractId, events)
    );
  }

  private static calculateEngineMetrics(contractId: string, events: StoredTapEvent[]): EngineMetrics {
    const totalEnergy = events.reduce((sum, e) => sum + Number(e.event.data.value.energy), 0);
    const totalIntegral = events.reduce((sum, e) => sum + Number(e.event.data.value.integral), 0);

    // The integral represents (average tokens held * blocks)
    // So if we divide total integral by total energy, we get average tokens held
    const averageTokensHeld = totalEnergy > 0 ? totalIntegral / totalEnergy : 0;

    // Energy per block is total energy divided by blocks
    const energyPerBlock = totalEnergy / averageTokensHeld;

    // Energy per block per token is total energy divided by total integral
    // This naturally accounts for both time (blocks) and token amount
    const energyPerBlockPerToken = totalIntegral > 0 ? totalEnergy / totalIntegral : 0;

    return {
      engineId: this.parseEngineId(contractId),
      contractId,
      averageTokensHeld,
      energyPerBlock,
      energyPerBlockPerToken,
      totalEnergy,
      totalIntegral
    };
  }

  private static groupEventsByEngine(events: StoredTapEvent[]): Record<string, StoredTapEvent[]> {
    return events.reduce((acc, event) => {
      const contractId = event.event.data.contract_identifier;
      acc[contractId] = acc[contractId] || [];
      acc[contractId].push(event);
      return acc;
    }, {} as Record<string, StoredTapEvent[]>);
  }

  private static parseEngineId(contractId: string): string {
    return contractId.split('.').pop() || '';
  }
}