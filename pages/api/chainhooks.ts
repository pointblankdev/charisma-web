import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { checkQuestComplete, setQuestComplete } from '@lib/stacks-api';
import { getAllQuests } from '@lib/cms-providers/dato';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function chainhooks(
  req: NextApiRequest,
  res: NextApiResponse<ConfUser | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      error: {
        code: 'method_unknown',
        message: 'This endpoint only responds to POST'
      }
    });
  }

  const quests = await getAllQuests();

  try {
    for (const a of req.body.apply) {
      for (const tx of a.transactions) {
        const payload = {
          ...tx.metadata.kind.data,
          sender: tx.metadata.sender,
          success: tx.metadata.success,
        };
        console.log(payload);

        const matchingQuest = quests.find(q => q.contract_identifier === payload.contract_identifier && q.method === payload.method);

        if (matchingQuest) {
          console.log('Matching quest found:', matchingQuest);

          const response = await checkQuestComplete(payload.sender, matchingQuest.id);
          console.log(response);
          if (Number(response.value) === 2001) {
            console.log('marking quest as complete');
            await setQuestComplete(payload.sender, matchingQuest.id, true);
          }
        }
      }
    }
  } catch (error: any) {
    console.error(error.message);
  }

  return res.status(200).json({});
}
