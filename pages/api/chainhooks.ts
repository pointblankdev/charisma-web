import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook, MessageBuilder } from 'discord-webhook-node'

const hook = new Webhook('https://discord.com/api/webhooks/1144890336594907146/BtXYwXDuHsWt6IFMOylwowcmCUWjOoIM6MiqdIBqIdrbT5w_ui3xdxSP2OSc2DhlkDhn');

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default function chainhooks(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      error: {
        code: 'method_unknown',
        message: 'This endpoint only responds to POST'
      }
    });
  }

  console.log('chainhooks called');

  try {
    for (const a of req.body.apply) {
      for (const tx of a.transactions) {
        const payload = {
          ...tx.metadata.kind.data,
          sender: tx.metadata.sender,
          success: tx.metadata.success,
        };

        console.log(payload)
        // {
        //   args: [ 'u1' ],
        //   contract_identifier: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard',
        //   method: 'harvest',
        //   sender: 'SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q',
        //   success: true
        // }

        const embed = new MessageBuilder()
          .setTitle('Harvest')
          .setAuthor(payload.sender)
          .setDescription('Creatures have havested FUJI tokens')
          .setTimestamp();

        payload.success === true && hook.send(embed);
      }
    }
  } catch (error: any) {
    console.error(error.message);
  }

  return res.status(200).json({});
}
