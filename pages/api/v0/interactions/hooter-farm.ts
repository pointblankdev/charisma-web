import { PostConditionMode } from '@stacks/transactions';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default function InteractionAPI(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  return res.status(200).json({
    url:
      'https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
    image: 'https://charisma.rocks/interactions/hooter-farm.png',
    name: 'Hooter Farm',
    subtitle: 'Burn energy to collect Hooter tokens.',
    description: ["Hooter farm burns energy to get Hooter memecoin tokens. It's that simple."],
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
    category: 'Rewards',
    actions: ['CLAIM_TOKENS'],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [
      {
        principal: 'tx-sender',
        contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.energy',
        tokenName: 'energy'
      },
      {
        principal: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-farm',
        contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-the-owl',
        tokenName: 'hooter'
      }
    ]
  });
}
