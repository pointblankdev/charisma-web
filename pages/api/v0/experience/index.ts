import { updateExperienceLeaderboard } from '@lib/db-providers/kv';
import { Webhook, MessageBuilder } from 'discord-webhook-node'
import { NextApiRequest, NextApiResponse } from 'next';

const hook = new Webhook('https://discord.com/api/webhooks/1144890336594907146/BtXYwXDuHsWt6IFMOylwowcmCUWjOoIM6MiqdIBqIdrbT5w_ui3xdxSP2OSc2DhlkDhn');

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function getMetadata(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {

    let response, code = 200
    try {
        if (req.method === 'POST') {
            for (const a of req.body.apply) {
                for (const tx of a.transactions) {

                    const payload = {
                        ...tx.metadata.kind.data,
                        sender: tx.metadata.sender,
                        success: tx.metadata.success,
                    };

                    console.log(payload)
                    if (payload.success) {
                        // send message to discord
                        const embed = new MessageBuilder().setTitle('Experience')
                        embed.setDescription(`${payload.sender} has gained Experience.`)
                        embed.setText(JSON.stringify(payload))
                        embed.setThumbnail('https://charisma.rocks/quests/journey-of-discovery.png')
                        await hook.send(embed);

                        // updateExperienceLeaderboard
                    }
                }
            }
        } else {
            code = 501
            response = new Object({
                code: 'method_unknown',
                message: 'This endpoint only responds to GET'
            })
        }
    } catch (error: any) {
        console.error(error)
        response = new Object(error)
        code = error.response.status
    }

    return res.status(code).json(response);
}
