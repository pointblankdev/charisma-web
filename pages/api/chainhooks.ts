import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { checkQuestComplete, setQuestComplete } from '@lib/stacks-api';

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

  try {
    for (const a of req.body.apply) {
      for (const tx of a.transactions) {
        const payload = {
          ...tx.metadata.kind.data,
          sender: tx.metadata.sender,
          success: tx.metadata.success,
        }
        console.log(payload)
        // if payload looks like...
        // {
        //   args: [],
        //   contract_identifier: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0',
        //   method: 'claim',
        //   sender: 'SP18QG8A8943KY9S15M08AMAWWF58W9X1M90BRCSJ',
        //   success: true
        // }
        if (payload.contract_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0' && payload.method === 'claim') {
          console.log('token faucet claim transaction detected')
          // and the sender has not completed the quest
          const charismaTokenFaucetQuestId = 0
          const response = await checkQuestComplete(payload.sender, charismaTokenFaucetQuestId)
          console.log(response)
          if (response.value === 'false') {
            // mark the quest as complete
            console.log('marking quest as complete')
            // setQuestComplete(payload.sender, charismaTokenFaucetQuestId, true)
          }
        }
      }
    }
  } catch (error: any) {
    console.error(error.message)
  }

  return res.status(200).json({});
}
