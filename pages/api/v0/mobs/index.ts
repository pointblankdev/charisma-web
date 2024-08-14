import { getExperienceLeaderboard, getMob, setMob, updateExperienceLeaderboard } from '@lib/db-providers/kv';
import { getNameFromAddress, getTokenBalance, getTotalSupply, hasPercentageBalance } from '@lib/stacks-api';
import { Webhook, MessageBuilder } from 'discord-webhook-node'
import { NextApiRequest, NextApiResponse } from 'next';
import numeral from 'numeral';
import safeJsonStringify from 'safe-json-stringify';

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
    data: SmartContractEvent | FTBurnEvent
    position: any
    type: string
}

type SmartContractEvent = {

    contract_identifier: string
    topic: string
    value: ContractPrintEvent
}

type ContractPrintEvent = {
    event: string; // This should always be present
    [key: string]: any; // Other properties are unknown and can vary}
}

type FTBurnEvent = {
    sender: string
    amount: number
    asset_identifier: string
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

    const hoggerEvents = []

    let response, code = 200
    try {
        if (req.method === 'POST') {
            await hook.send(new MessageBuilder().setText(`Processing ${chainhookPayload.apply.length} apply events`));
            for (const a of chainhookPayload.apply) {
                await hook.send(new MessageBuilder().setText(`Processing ${a.transactions.length} transactions`));
                for (const tx of a.transactions) {
                    await hook.send(new MessageBuilder().setText(`Processing transaction ${tx.metadata.description}`));
                    const contractMetadata: Record<string, any> = {
                        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1::tap': {
                            author: 'WANTED: "Hogger"',
                            title: 'A player is fighting Hogger!'
                        },

                    }

                    const contractIdentifier = tx.metadata.kind.data.contract_identifier
                    const contractMethod = tx.metadata.kind.data.method
                    const contractKey = `${contractIdentifier}::${contractMethod}`

                    const metadata = contractMetadata[contractKey]

                    // send message to discord
                    const embed = new MessageBuilder()
                        .setAuthor(metadata?.author, 'https://beta.charisma.rocks/quests/wanted-hogger/hogger-icon.png', 'https://beta.charisma.rocks/quests/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1')
                        .setTitle(metadata?.title || 'Unknown Title')
                        .setDescription(tx.metadata.description)
                        .setThumbnail('https://beta.charisma.rocks/quests/wanted-hogger/hogger.png')

                    for (const event of tx.metadata.receipt.events) {
                        try {
                            if (event.type === 'SmartContractEvent' && 'topic' in event.data) {
                                if (event.data.value.event === 'attack-result') {
                                    // critical hogger event, add to hogger events
                                    hoggerEvents.push(event.data.value)
                                    const newHealth = event.data.value['new-hogger-health']
                                    const hogger = await getMob('hogger')
                                    if (hogger.maxHealth < newHealth) { hogger.maxHealth = newHealth }
                                    hogger.health = newHealth
                                    await setMob('hogger', hogger)
                                }
                                // loop through all values in the value object
                                if (typeof event.data.value === 'object' && event.data.value !== null) {
                                    embed.addField(`🔻 ${event.data.value.event ? event.data.value.event : 'event'}`, ' ');
                                    Object.entries(event.data.value).forEach(([key, value]) => {
                                        // Convert the value to a string, handling potential nested objects
                                        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                                        embed.addField(key, stringValue, true);
                                    });
                                } else {
                                    // If value is not an object, add it as a single field
                                    embed.addField(event.data.topic, JSON.stringify(event.data.value));
                                }
                            } else if (event.type === 'FTBurnEvent' && 'sender' in event.data) {
                                embed.addField('Protocol Fee', `Burned ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1]} tokens.`);
                            } else {
                                embed.addField(event.type, JSON.stringify(event.data));
                            }
                        } catch (error) {
                            embed.addField('Error Parsing Event', JSON.stringify(event.data));
                        }
                    }

                    await hook.send(embed);
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

        const embed = new MessageBuilder()
            .setTitle('Error Parsing Transaction')
            .setDescription(safeJsonStringify(error))
        await hook.send(embed);
    }

    return res.status(code).json(response as ChainhookResponse | ErrorResponse);
}
