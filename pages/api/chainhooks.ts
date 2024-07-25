import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook, MessageBuilder } from 'discord-webhook-node'
import { cacheGlobalState, cacheUserState } from '@lib/db-providers/kv';

const hook = new Webhook('https://discord.com/api/webhooks/1144890336594907146/BtXYwXDuHsWt6IFMOylwowcmCUWjOoIM6MiqdIBqIdrbT5w_ui3xdxSP2OSc2DhlkDhn');

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export default async function chainhooks(
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

        const messageMapping: { [key: string]: any } = {
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard-harvest': {
            description: 'Creatures have harvested FUJI tokens',
            image: 'https://charisma.rocks/stations/apple-orchard.png',
          },
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.creatures-kit-get-untapped-amount': {
            cacheUserState,
          },

          // Add more mappings here for other contract_identifier - method combinations
        };

        const messageKey = `${payload.contract_identifier}-${payload.method}`;
        const message = messageMapping[messageKey];
        const success = payload.success === true

        if (message && success) {
          // send message to discord
          const embed = new MessageBuilder()
            .setTitle(payload.method)
            .setAuthor(payload.sender)
          message.description && embed.setDescription(message.description)
          message.image && embed.setImage(message.image)
          await hook.send(embed);

          // cache user state in KV
          if (message.cacheUserState) {
            await message.cacheUserState(payload.sender, messageKey, payload);
          }
        }
      }
    }
  } catch (error: any) {
    console.error(error.message);
  }

  return res.status(200).json({});
}
