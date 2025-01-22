import { kv } from '@vercel/kv'
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

const DEFAULT_LEGENDS = [
    '@Welsh_Community',
    '@aibtcdev',
    '@ALEXLabBTC',
    '@aphillyatd420',
    '@ArkadikoFinance',
    '@binxbtc',
    '@bitcoin',
    '@Bitflow_Finance',
    '@BowhunterBtc',
    '@btc_el34',
    '@CharismaBTC',
    '@dogbtc_',
    '@DrySockSTX',
    '@enjoywithouthey',
    '@FredCat2024',
    '@GavSledge',
    '@GusTheStacks',
    '@honeybadgerstx',
    '@irmisssima',
    '@realkaraban',
    '@KillerOfSupply',
    '@LeatherBTC',
    '@LeoCoinSTX',
    '@LongCoinCrypto',
    '@lordrozar',
    '@magoo_btc',
    '@memecoinstx',
    '@MoistSockSTX',
    '@mooneebstx',
    '@mrwagmibtc',
    '@PepeCoinSTX',
    '@playpenguinstx',
    '@pocowelsh',
    '@PombooSTX',
    '@roocoinbtc',
    '@StackingDao',
    '@Stacks',
    '@stackwealth21',
    '@StaxxoBTC',
    '@VelarBTC',
    '@vinzomniac',
    '@WailordBtc',
    '@WealthyWelsh',
    '@wrappednothing',
    '@XverseApp',
    '@ZestProtocol'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await kv.set('twitter-legends', DEFAULT_LEGENDS);
        return res.status(200).json({
            message: 'Database seeded successfully',
            count: DEFAULT_LEGENDS.length
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        return res.status(500).json({ error: 'Failed to seed database' });
    }
} 