// pages/api/twitter.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

// Types
type ResponseData = {
  data?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    // // Get the access token from Authorization header
    // const bearerToken = req.headers.authorization?.split('Bearer ')[1];
    // if (!bearerToken) {
    //   return res.status(401).json({ error: 'No access token provided' });
    // }

    // Initialize client with the bearer token
    // const client = new TwitterApi(bearerToken);

    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.DM_API_KEY || '', // API Key
      appSecret: process.env.DM_API_SECRET || '', // API Secret
      accessToken: process.env.DM_ACCESS_TOKEN || '', // Access Token
      accessSecret: process.env.DM_ACCESS_SECRET || '' // Access Secret
    });
    const rwClient = client.readWrite;

    const { endpoint = 'TWEETS', action = 'GET' } = req.query;

    // Handle different endpoints
    switch (`${endpoint}_${action}`) {
      case 'TWEETS_GET': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Tweet ID required' });
        }
        const tweet = await rwClient.v2.get(id as string);
        return res.status(200).json({ data: tweet });
      }

      case 'TWEETS_POST': {
        const { text } = req.body;
        if (!text) {
          return res.status(400).json({ error: 'Tweet text required' });
        }
        const { data: createdTweet } = await rwClient.v2.tweet(req.body.text);
        return res.status(201).json({ data: createdTweet });
      }

      case 'TWEETS_SEARCH': {
        const { query } = req.query;
        if (!query) {
          return res.status(400).json({ error: 'Search query required' });
        }
        const tweets = await client.v2.search(query as string);
        return res.status(200).json({ data: tweets });
      }

      case 'USERS_GET': {
        const { username } = req.query;
        if (!username) {
          return res.status(400).json({ error: 'Username required' });
        }
        const user = await rwClient.v2.userByUsername(username as string);
        return res.status(200).json({ data: user });
      }

      case 'LIKES_POST': {
        const { userId, tweetId } = req.body;
        if (!userId || !tweetId) {
          return res.status(400).json({ error: 'User ID and Tweet ID required' });
        }
        const like = await client.v2.like(userId, tweetId);
        return res.status(201).json({ data: like });
      }

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error: any) {
    console.error('Twitter API Error:', error);

    // Handle specific Twitter API errors
    if (error.code === 429) {
      return res.status(429).json({ error: 'Twitter API rate limit exceeded' });
    }

    if (error.code === 401) {
      return res.status(401).json({
        error: 'Authentication error',
        data: error.data?.detail || 'Invalid credentials'
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        error: 'Authorization error',
        data: error.data?.detail || 'Unable to perform this action'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      data: error.message
    });
  }
}
