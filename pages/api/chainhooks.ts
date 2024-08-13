import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook, MessageBuilder } from 'discord-webhook-node'

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

  try {
    for (const a of req.body.apply) {
      for (const tx of a.transactions) {

        // INSPECTION OF ALL TRANSACTIONS
        // if (tx.metadata.kind.data.contract_identifier?.startsWith('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') ||
        //   tx.metadata.kind.data.contract_identifier?.startsWith('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ')) {
        //   // log transaction always
        //   console.log(tx)
        //   // send message to discord if transaction was successful
        //   if (tx.metadata.success) {
        //     const embed = new MessageBuilder()
        //       .setDescription(JSON.stringify(tx))
        //       .setThumbnail('https://charisma.rocks/charisma.png')
        //     await hook.send(embed);
        //   }
        // }
        // log transaction always
        // console.log(Object.keys(tx.metadata))
        // console.log(Object.keys(tx.metadata.kind))
        console.log(tx?.metadata?.kind?.data)

        // REACT TO SPECIFIC TRANSACTIONS
        const payload = {
          ...tx.metadata.kind.data,
          sender: tx.metadata.sender,
          success: tx.metadata.success,
        };

        const messageMapping: { [key: string]: any } = {
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience': {
            title: 'Experience',
            description: `${payload.sender} has gained Experience.`,
            thumbnail: 'https://charisma.rocks/quests/journey-of-discovery.png',
          },
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard-harvest': {
            title: 'Abundant Orchard',
            description: `${payload.sender} has harvested Fuji Apples.`,
            thumbnail: 'https://charisma.rocks/stations/apple-orchard.png',
          },
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.creatures-core-set-creature-power': {
            description: 'Creatures power has been updated.',
          },
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.creatures-core-set-creature-cost': {
            description: 'Creatures cost has been updated.',
          },
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v0': {
            title: 'WANTED: Hogger',
            description: `${payload.sender} is fighting Hogger!`,
            thumbnail: 'https://charisma.rocks/quests/wanted-hogger.png',
          },
        };

        const messageKey = `${payload.contract_identifier}-${payload.method}`;
        const message = messageMapping[messageKey];

        if (message && payload.success) {
          // send message to discord
          const embed = new MessageBuilder().setTitle(payload.title)
          message.description && embed.setDescription(message.description)
          message.thumbnail && embed.setThumbnail(message.thumbnail)
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
