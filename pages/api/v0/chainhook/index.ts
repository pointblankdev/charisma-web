import { handleContractEvent } from '@lib/events/dispatcher';
import { NextApiRequest, NextApiResponse } from 'next';
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
    success: boolean
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

export default async function chainhookApi(
    req: NextApiRequest,
    res: NextApiResponse<ChainhookResponse | ErrorResponse>
) {
    const chainhookPayload: ChainhookPayload = req.body
    let response, code = 200
    if (req.method === 'POST') {
        for (const a of chainhookPayload.apply) {
            for (const tx of a.transactions) {

                try {

                    if (tx.metadata.success) {
                        let builder = new EmbedBuilder()
                        // send message to discord
                        builder.setAuthor({ name: `Charisma Event`, icon_url: 'https://charisma.rocks/dmg-logo.png', url: 'https://charisma.rocks/players' })
                        builder.setTitle('New Event')
                        builder.setThumbnail({ url: 'https://charisma.rocks/dmg-logo.gif' })

                        for (const event of tx.metadata.receipt.events) {
                            builder = await handleContractEvent(event, builder)
                        }

                        // hook.addEmbed(builder.getEmbed());
                        // await hook.send();
                    }

                } catch (error) {
                    console.error(error)
                }
                response = {}
            }
        }
    } else {
        code = 501
        response = new Object({
            code: 'method_unknown',
            message: 'This endpoint only responds to POST'
        })
    }

    return res.status(code).json(response as ChainhookResponse | ErrorResponse);
}