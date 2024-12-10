import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

type ResponseData = {
  url?: string;
  state?: string;
  codeVerifier?: string;
  error?: string;
};

const client = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID || '',
  clientSecret: process.env.TWITTER_CLIENT_SECRET || ''
});

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, state, codeVerifier } = client.generateOAuth2AuthLink(
      'https://charisma.rocks/api/v0/x/auth',
      {
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
      }
    );

    return res.status(200).json({
      url,
      state,
      codeVerifier
    });
  } catch (error: any) {
    console.error('Failed to generate auth URL:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate auth URL'
    });
  }
}
