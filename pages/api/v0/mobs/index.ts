import { getExperienceLeaderboard, getMob, setMob, updateExperienceLeaderboard } from '@lib/db-providers/kv';
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
    data: any
    position: any
    type: string
}

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
    if (req.method === 'POST') {
        for (const a of chainhookPayload.apply) {
            for (const tx of a.transactions) {
                try {
                    console.log(Object.keys(tx.metadata))
                    // send message to discord
                    const embed = new MessageBuilder()
                        .setAuthor(`WANTED: "Hogger"`, 'https://beta.charisma.rocks/quests/wanted-hogger/hogger-icon.png', 'https://beta.charisma.rocks/quests/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1')
                        .setTitle('Hogger Event!')
                        .setThumbnail('https://beta.charisma.rocks/quests/wanted-hogger/hogger.png')

                    for (const event of tx.metadata.receipt.events) {
                        await handleContractPrintEvent(event, embed)
                    }

                    await hook.send(embed);
                    response = {}

                } catch (error: any) {
                    console.log(error)
                    const embed = new MessageBuilder()
                        .setTitle('Error Parsing Transaction')
                        .setDescription(JSON.stringify(tx.metadata.receipt).slice(0, 300))
                    await hook.send(embed);
                }
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

    return res.status(code).json(response as ChainhookResponse | ErrorResponse);
}

const handleContractPrintEvent = async (event: ContractEvent, embed: any) => {

    let symbol;
    if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hogger-v0") {
        symbol = '👻'
    } else if (event?.data?.value?.event === 'attack-result') {
        symbol = '⚔️'
    } else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1") {
        symbol = '📜'
    } else if (event.type === 'FTBurnEvent') {
        symbol = '🔥'
    } else if (event.type === 'FTMintEvent') {
        symbol = '💰'
    } else {
        symbol = '❓'
    }

    try {

        // reset-complete: cache data for new hogger repawn
        if (event?.data?.value?.event === 'reset-complete') {
            const newLevel = Number(event.data.value['new-epoch'])
            const newMaxHp = Number(event.data.value['new-max-health'])
            const newRegen = Number(event.data.value['new-regen-rate'])
            const hogger = await getMob('hogger')
            hogger.level = newLevel
            hogger.maxHealth = newMaxHp
            hogger.regenRate = newRegen
            await setMob('hogger', hogger)
            embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300));
        }

        // attack-result: cache data for hogger health
        else if (event?.data?.value?.event === 'attack-result') {
            const newHealth = Number(event.data.value['new-hogger-health'])
            const hogger = await getMob('hogger')
            hogger.health = newHealth
            await setMob('hogger', hogger)
            embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300));
        }

        // burn event
        else if (event.type === 'FTBurnEvent') {
            embed.addField(`${symbol} protocol-burn`, `Burned ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} tokens.`);
        }

        // mint event
        else if (event.type === 'FTMintEvent') {
            embed.addField(`${symbol} quest-reward`, JSON.stringify(event.data).slice(0, 300));
        }

        // unknown event
        else {
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300));
        }

    } catch (error) {
        console.log('handlePrintEvent error:', error)
    }
}