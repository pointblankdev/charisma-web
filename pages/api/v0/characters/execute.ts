import { CharacterTransaction, CharacterTransactionService } from '@lib/data/characters.service';
import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';
import { latestDungeonKeeperContract } from 'pages/admin';

type ScheduledCharacterExecution = {
  characterAddress: string;
  interaction: string;
  action: string;
  rulebook: string;
  lastRun?: number;
  schedule: 'hourly' | 'daily' | 'weekly';
};

const MINIMUM_INTERVALS = {
  hourly: 60 * 60 * 1000, // 1 hour in ms
  daily: 24 * 60 * 60 * 1000, // 24 hours in ms
  weekly: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // const { authorization } = req.headers;
  // if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  // }

  try {
    // Get all active characters from KV
    const [, teams] = await kv.scan(0, {
      match: `owner-wallet:*`,
      count: 100 // Adjust based on needs
    });

    const transactionService = new CharacterTransactionService();
    const results = [];

    for (const teamKey of teams) {
      const team = (await kv.hgetall(teamKey)) as any;

      const enabledCharacters = Object.values(team.characters).filter((c: any) => {
        return c.active && !c.archived;
      });
      for (const character of enabledCharacters as any[]) {
        // Skip if character is not active or no rulebook set
        if (!character.active) continue;

        const result = await transactionService.executeTransaction({
          ownerAddress: team.ownerAddress,
          interaction: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-mine-rc4',
          action: 'MINT',
          rulebook: latestDungeonKeeperContract
        });

        results.push({
          ownerAddress: team.ownerAddress,
          characterAddress: character.characterAddress,
          ...result
        });
      }
    }

    return res.status(200).json({
      executed: results.length,
      skipped: teams.length - results.length,
      results
    });
  } catch (error) {
    console.error('Error executing scheduled transactions:', error);
    return res.status(500).json({
      error: 'Failed to execute scheduled transactions'
      // details: error.message
    });
  }
}
