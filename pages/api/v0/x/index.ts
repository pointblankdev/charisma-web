// pages/api/v0/x.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

type ResponseData = {
  data?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.DM_API_KEY || '',
      appSecret: process.env.DM_API_SECRET || '',
      accessToken: process.env.DM_ACCESS_TOKEN || '',
      accessSecret: process.env.DM_ACCESS_SECRET || ''
    });
    const rwClient = client.readWrite;

    const { endpoint = 'TWEETS', action = 'GET' } = req.query;

    switch (`${endpoint}_${action}`) {
      case 'TWEETS_POST': {
        // Validate required fields
        const { text } = req.body;
        if (!text) {
          return res.status(400).json({ error: 'Tweet text required' });
        }

        // Build tweet parameters
        const tweetParams: any = {
          text: req.body.text
        };

        // Add reply parameters if present
        if (req.body.reply?.in_reply_to_tweet_id) {
          tweetParams.reply = {
            in_reply_to_tweet_id: req.body.reply.in_reply_to_tweet_id
          };

          if (req.body.reply.exclude_reply_user_ids) {
            tweetParams.reply.exclude_reply_user_ids = req.body.reply.exclude_reply_user_ids;
          }
        }

        // Add quote tweet if present
        if (req.body.quote_tweet_id) {
          tweetParams.quote_tweet_id = req.body.quote_tweet_id;
        }

        // Add direct message deep link if present
        if (req.body.direct_message_deep_link) {
          tweetParams.direct_message_deep_link = req.body.direct_message_deep_link;
        }

        // Add super followers only setting if present
        if (req.body.for_super_followers_only) {
          tweetParams.for_super_followers_only = true;
        }

        // Add geo location if present
        if (req.body.geo?.place_id) {
          tweetParams.geo = {
            place_id: req.body.geo.place_id
          };
        }

        // Add media if present
        if (req.body.media?.media_ids) {
          tweetParams.media = {
            media_ids: req.body.media.media_ids
          };

          if (req.body.media.tagged_user_ids) {
            tweetParams.media.tagged_user_ids = req.body.media.tagged_user_ids;
          }
        }

        // Add poll if present
        if (req.body.poll?.options && req.body.poll.duration_minutes) {
          tweetParams.poll = {
            options: req.body.poll.options,
            duration_minutes: req.body.poll.duration_minutes
          };
        }

        // Add reply settings if present
        if (req.body.reply_settings) {
          tweetParams.reply_settings = req.body.reply_settings;
        }

        // Post the tweet with all parameters
        const { data: createdTweet } = await rwClient.v2.tweet(tweetParams);
        return res.status(201).json({ data: createdTweet });
      }

      case 'TWEETS_GET': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Tweet ID required' });
        }
        const tweet = await rwClient.v2.tweet(
          id as string,
          {
            expansions: ['attachments.media_ids', 'author_id', 'referenced_tweets.id'],
            'media.fields': ['url', 'preview_image_url', 'type'],
            'tweet.fields': ['created_at', 'public_metrics', 'entities', 'context_annotations']
          } as any
        );
        return res.status(200).json({ data: tweet });
      }

      case 'TWEETS_SEARCH': {
        const { query } = req.query;
        if (!query) {
          return res.status(400).json({ error: 'Search query required' });
        }
        const tweets = await rwClient.v2.search(query as string, {
          expansions: [
            'author_id',
            'referenced_tweets.id',
            'referenced_tweets.id.author_id',
            'entities.mentions.username',
            'attachments.poll_ids',
            'attachments.media_keys',
            'in_reply_to_user_id',
            'geo.place_id',
            'edit_history_tweet_ids'
          ],
          'media.fields': ['url', 'preview_image_url', 'type'],
          'tweet.fields': ['created_at', 'public_metrics']
        });
        return res.status(200).json({ data: tweets });
      }

      case 'USERS_GET': {
        const { username } = req.query;
        if (!username) {
          return res.status(400).json({ error: 'Username required' });
        }
        const user = await rwClient.v2.userByUsername(username as string, {
          'user.fields': ['created_at', 'description', 'public_metrics', 'verified']
        });
        return res.status(200).json({ data: user });
      }

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error: any) {
    console.error('Twitter API Error:', error);

    // Handle rate limiting
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000).toISOString()
        : 'unknown';
      return res.status(429).json({
        error: 'Rate limit exceeded',
        data: {
          reset_at: resetTime,
          limit: error.rateLimit?.limit,
          remaining: error.rateLimit?.remaining
        }
      });
    }

    // Handle authentication errors
    if (error.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        data: error.data?.detail || 'Invalid credentials'
      });
    }

    // Handle authorization errors
    if (error.code === 403) {
      return res.status(403).json({
        error: 'Authorization failed',
        data: error.data?.detail || 'You are not authorized to perform this action'
      });
    }

    // Handle validation errors
    if (error.code === 400) {
      return res.status(400).json({
        error: 'Invalid request',
        data: error.data?.detail || error.message
      });
    }

    // Handle all other errors
    return res.status(500).json({
      error: 'Internal server error',
      data: error.message
    });
  }
}
