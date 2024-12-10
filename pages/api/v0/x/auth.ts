import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';
import cookie from 'cookie';

type ResponseData = {
  accessToken?: string;
  refreshToken?: string;
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

  const { state, code } = req.query;
  const cookies = cookie.parse(req.headers.cookie || '');
  const codeVerifier = cookies.codeVerifier;

  if (!state || !code || !codeVerifier) {
    return res.status(400).json({
      error: 'Missing required parameters. Need: state, code, and codeVerifier'
    });
  }

  try {
    // Exchange the code for tokens
    const { accessToken, refreshToken } = await client.loginWithOAuth2({
      code: code as string,
      codeVerifier: codeVerifier,
      redirectUri: 'https://charisma.rocks/api/v0/x/auth'
    });

    // Here you should store these tokens securely
    // Example: Save to your database
    // await saveTokensToDatabase(accessToken, refreshToken)

    return res.status(200).json({
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Failed to exchange code for tokens:', error);
    return res.status(500).json({
      error: error.message || 'Failed to exchange code for tokens'
    });
  }
}
