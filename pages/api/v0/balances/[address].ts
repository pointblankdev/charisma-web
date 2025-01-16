import { getAccountBalance } from '@lib/hiro/stacks-api'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any | { error: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { address } = req.query

    try {
        const balance = await getAccountBalance(address as string)

        return res.status(200).json(balance)
    } catch (error) {
        console.error('Error fetching balance:', error)
        return res.status(500).json({ error: 'Failed to fetch balance' })
    }
}
