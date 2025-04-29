import cmc from "@lib/cmc-api";
import { getAllContractTransactions } from '@lib/hiro/stacks-api';
import { hexToCV } from "@stacks/transactions";

/**
 * Get all token prices
 */
async function getAllTokenPrices() {
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const response = await fetch('https://kraxel.io/api/prices', {
        method: 'GET',
        headers: {
          'X-Api-Key': process.env.KRAXEL_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      data['.stx'] = data['STX']
      // data.prices['SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token'] = 0.967;

      return data;
    } catch (error) {
      attempts++;
      console.error(`Error fetching all prices (attempt ${attempts}):`, error);
      if (attempts >= MAX_RETRIES) {
        console.error('Failed to fetch all token prices');
        return {};
      }
    }
  }
}

/**
 * Get transactions data for the Charisma vaults
 * 
 * @returns {Promise<Record<ContractId, any>>}
 */
async function getVaultTransactions() {
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const response = await fetch(`https://kraxel.io/api/v2/transactions/charisma`, {
        method: 'GET',
        headers: {
          'X-Api-Key': process.env.KRAXEL_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      attempts++;
      console.error(`Error fetching pool transactions (attempt ${attempts}):`, error);
      if (attempts >= MAX_RETRIES) {
        console.error('Failed to fetch pool transactions');
        return {};
      }
    }
  }
}

async function getEnergyRate(contractId: string, limit = 100): Promise<number> {
  try {
    const transactions = await getAllContractTransactions(contractId, limit);

    let totalEnergy = 0;
    let totalIntegral = 0;

    for (const tx of transactions) {
      // Look for energy events in transaction events
      const events = tx.events || [];

      for (const event of events) {
        if (event.event_type === 'smart_contract_log' &&
          event.contract_log?.contract_id === contractId) {

          const cvEvent = (hexToCV(event.contract_log?.value.hex) as any).value;

          if (cvEvent.op.value === 'OP_HARVEST_ENERGY') {
            totalEnergy += Number(cvEvent.energy.value);
            totalIntegral += Number(cvEvent.integral.value);
          }
        }
      }
    }

    return totalEnergy / totalIntegral || 0;
  } catch (error) {
    console.error('Error fetching energy events:', error);
    throw error;
  }
}

export const Kraxel = {
  getAllTokenPrices,
  getVaultTransactions,
  getEnergyRate
}
