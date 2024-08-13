import { getExperienceLeaderboard, updateExperienceLeaderboard } from '@lib/db-providers/kv';
import { getNameFromAddress, getTokenBalance, hasPercentageBalance } from '@lib/stacks-api';
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
                        const top1p = await hasPercentageBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', payload.sender, 1)
                        const top01p = await hasPercentageBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', payload.sender, 0.1)
                        const top001p = await hasPercentageBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', payload.sender, 0.01)
                        // send message to discord
                        const embed = new MessageBuilder()
                            .setTitle('Adventure')
                            .setDescription(`${bns.names?.[0] || 'A player'} has gained experience`)
                            .setThumbnail('https://charisma.rocks/quests/journey-of-discovery.png')
                            .addField('Top 0.01%', top001p ? "🥇" : "❌", true)
                            .addField('Top 0.1%', top01p ? "🥈" : "❌", true)
                            .addField('Top 1%', top1p ? "🥉" : "❌", true)
                            .addField('Total Experience', Math.round(experienceAmount / Math.pow(10, 6)).toString() + ' EXP')
                            .addField('Wallet Address', payload.sender)
                        await hook.send(embed);

                        // update leaderboard
                        await updateExperienceLeaderboard(payload.sender, experienceAmount)
                    }
                    response = {}
                }
            }
        } else if (req.method === 'GET') {
            response = await getExperienceLeaderboard(0, -1)
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
