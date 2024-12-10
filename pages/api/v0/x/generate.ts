import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';
import cookie from 'cookie';

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

const basicAuth = (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization;

  if (!auth || auth.indexOf('Basic ') === -1) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  const base64Credentials = auth.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const validUsername = process.env.BASIC_AUTH_USERNAME || 'admin';
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'hoothoot';

  if (username !== validUsername || password !== validPassword) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).json({ error: 'Invalid credentials' });
    return false;
  }

  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (!basicAuth(req, res)) {
    return;
  }

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

    // Set the codeVerifier in a cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('codeVerifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      })
    );

    return res.redirect(url);
  } catch (error: any) {
    console.error('Failed to generate auth URL:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate auth URL'
    });
  }
}
