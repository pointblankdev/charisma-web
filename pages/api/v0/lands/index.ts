import { getExperienceLeaderboard, getMob, setMob, updateExperienceLeaderboard } from '@lib/db-providers/kv';
import { handleContractEvent } from '@lib/events/utils';
import { getNameFromAddress, getTokenBalance, getTotalSupply, hasPercentageBalance } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';
import numeral from 'numeral';
import { Webhook, EmbedBuilder } from '@tycrek/discord-hookr';

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

export default async function landsIndexApi(
    req: NextApiRequest,
    res: NextApiResponse<ChainhookResponse | ErrorResponse>
) {

    const chainhookPayload: ChainhookPayload = req.body


    let response, code = 200
    if (req.method === 'POST') {
        for (const a of chainhookPayload.apply) {
            for (const tx of a.transactions) {
                const builder = new EmbedBuilder()
                try {

                    // send message to discord
                    builder.setAuthor({ name: `Stake-to-Earn Pools`, url: 'https://beta.charisma.rocks/charisma.png', icon_url: 'https://beta.charisma.rocks/staking' })
                    builder.setTitle('New Event')
                    builder.setThumbnail({ url: 'https://beta.charisma.rocks/charisma.png' })

                    for (const event of tx.metadata.receipt.events) {
                        await handleContractEvent(event, builder)
                    }

                    hook.addEmbed(builder.getEmbed());
                    await hook.send();
                    response = {}

                } catch (error: any) {
                    console.error(error)
                    const errorEmbed = new EmbedBuilder()
                    errorEmbed.setTitle('Error Parsing Transaction')

                    for (const event of tx.metadata.receipt.events) {
                        errorEmbed.addField({ name: "⚠️", value: JSON.stringify(event).slice(0, 300) })
                    }
                    hook.addEmbed(errorEmbed.getEmbed());
                    await hook.send();
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