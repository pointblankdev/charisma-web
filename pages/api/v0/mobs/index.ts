import { getExperienceLeaderboard, updateExperienceLeaderboard } from '@lib/db-providers/kv';
import { getNameFromAddress, getTokenBalance, getTotalSupply, hasPercentageBalance } from '@lib/stacks-api';
import { Webhook, MessageBuilder } from 'discord-webhook-node'
import { NextApiRequest, NextApiResponse } from 'next';
import numeral from 'numeral';

const hook = new Webhook('https://discord.com/api/webhooks/1144890336594907146/BtXYwXDuHsWt6IFMOylwowcmCUWjOoIM6MiqdIBqIdrbT5w_ui3xdxSP2OSc2DhlkDhn');


// Main payload structure
interface ChainhookPayload {
    apply: ApplyEvent[];
}

interface ApplyEvent {
    transactions: Transaction[];
}

interface Transaction {
    metadata: TransactionMetadata;
}

interface TransactionMetadata {
    description: string;
    execution_cost: any;
    fee: number;
    kind: TransactionKind;
    nonce: number;
    position: { index: number };
    raw_tx: string;
    receipt: ReceiptData
}

interface ReceiptData {
    contract_calls_stacks: any[]
    events: ContractEvent[]
}

interface ContractEvent {
    data: {
        contract_identifier: string
        topic: string
        value?: ContractPrintEvent
    }
    position: any
    type: string
}

type ContractPrintEvent = {
    event: string; // This will always be present
    [key: string]: any; // Other properties are unknown and can vary
};

interface TransactionKind {
    data: {
        args: any[]
        contract_identifier: string
        method: string
    }
    type: string
}

// Helper type for the response
type ChainhookResponse = Record<string, any>;


type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function getMetadata(
    req: NextApiRequest,
    res: NextApiResponse<ChainhookResponse | ErrorResponse>
) {

    const chainhookPayload: ChainhookPayload = req.body

    let response, code = 200
    try {
        if (req.method === 'POST') {
            for (const a of chainhookPayload.apply) {
                for (const tx of a.transactions) {

                    // send message to discord
                    const embed = new MessageBuilder()
                        .setTitle(tx.metadata.kind.data.contract_identifier)
                        .setDescription(tx.metadata.kind.data.method)
                        .setThumbnail('https://beta.charisma.rocks/quests/wanted-hogger/hogger-icon.png')

                    tx.metadata.receipt.events.forEach((event: ContractEvent) => {
                        embed.addField(event.type, JSON.stringify(event.data))
                    })

                    console.log(embed)

                    await hook.send(embed);

                    // if (payload.success) {

                    //     const experienceAmount = await getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', payload.sender)
                    //     const experienceSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience')

                    //     const bns = await getNameFromAddress(payload.sender)
                    //     const data = { address: payload.sender } as any
                    //     if (bns.names?.[0]) data.bns = bns.names?.[0]
                    //     const jsonData = JSON.stringify(data);

                    //     // update leaderboard
                    //     await updateExperienceLeaderboard(experienceAmount, jsonData)
                    //     // send message to discord
                    //     const embed = new MessageBuilder()
                    //         .setTitle('Adventure')
                    //         .setDescription(`${bns.names?.[0] || 'A player'} has gained experience`)
                    //         .setThumbnail('https://charisma.rocks/quests/journey-of-discovery.png')
                    //         .addField('\\> 10% TS', experienceAmount / experienceSupply >= 0.1 ? "🌞" : "✖️", true)
                    //         .addField('\\> 1% TS', experienceAmount / experienceSupply >= 0.01 ? "🌟" : "✖️", true)
                    //         .addField('\\> 0.1% TS', experienceAmount / experienceSupply >= 0.001 ? "✨" : "✖️", true)
                    //         .addField('Total Experience', Math.round(experienceAmount / Math.pow(10, 6)).toString() + ' EXP', true)
                    //         .addField('% of Total Supply', numeral(experienceAmount / experienceSupply).format('0.0%'), true)
                    //         .addField('Wallet Address', payload.sender)
                    //     await hook.send(embed);
                    // }
                    response = {}
                }
            }
        } else if (req.method === 'GET') {
            response = {}
        } else {
            code = 501
            response = new Object({
                code: 'method_unknown',
                message: 'This endpoint only responds to GET'
            })
        }
    } catch (error: any) {
        console.error(error)
        response = {}
    }

    return res.status(code).json(response as ChainhookResponse | ErrorResponse);
}
