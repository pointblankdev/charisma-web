import { updateExperienceLeaderboard } from '@lib/db-providers/kv';
import { getNameFromAddress, getTokenBalance } from '@lib/stacks-api';
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

                    if (payload.success) {

                        const experienceAmount = await getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', payload.sender)
                        const bns = await getNameFromAddress(payload.sender)
                        // send message to discord
                        const embed = new MessageBuilder()
                            .setTitle('Adventure')
                            .setDescription(`${bns.names?.[0] || 'A player'} has gained experience.`)
                            .setThumbnail('https://charisma.rocks/quests/journey-of-discovery.png')
                            .addField('Address', payload.sender, true)
                            .addField('Total EXP', String(experienceAmount / Math.pow(10, 6)))
                            .addField('Top 1%', '?')
                            .addField('Top 0.1%', '?')
                            .addField('Top 0.01%', '?')
                        await hook.send(embed);

                        // update leaderboard
                        await updateExperienceLeaderboard(payload.sender, experienceAmount)
                    }
                }
            }
        } else if (req.method === 'GET') {
            console.log(req)
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
