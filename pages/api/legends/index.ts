import { kv } from '@vercel/kv'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const legends = await kv.get('twitter-legends') || []
        return res.status(200).json(legends)
    }

    if (req.method === 'POST') {
        const { handle } = req.body

        if (!handle || !handle.startsWith('@')) {
            return res.status(400).json({ error: 'Invalid handle format' })
        }

        const legends: string[] = await kv.get('twitter-legends') || []

        if (!legends.includes(handle)) {
            await kv.set('twitter-legends', [...legends, handle])
        }

        return res.status(200).json({ message: 'Handle added successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
} 