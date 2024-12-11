import type { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

type ResponseData = {
  data?: any;
  error?: string;
};

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ error: 'Method not allowed' });
  // }

  try {
    // Get chat response from Charisma API
    const charismaResponse = await fetch('https://explore.charisma.rocks/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: '1a46771c-834f-4a97-9b40-15f674c485ef',
        messages: [
          {
            role: 'user',
            content:
              'Look at recent mempool transactions, and then respond to the activity as if you were Hogger, a Gnoll Chieftain. No nerdy DnD/fantasy references, please. Be brutally honest, and keep your answer short in paragraph format under 250 characters maximum. Do not state your are looking at the mempool.'
          }
        ],
        modelId: 'claude-3-sonnet'
      })
    });

    if (!charismaResponse.ok) {
      throw new Error(`Charisma API error: ${charismaResponse.statusText}`);
    }

    // Read and process the streaming response
    const reader = charismaResponse.body?.getReader();
    if (!reader) {
      throw new Error('No response body from Charisma API');
    }

    let fullResponse = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert the Uint8Array to string
      const chunk = new TextDecoder().decode(value);
      // Parse the chunk and extract the actual text content
      // Note: You might need to adjust this based on the exact format of the streaming response
      const lines = chunk.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.startsWith('0:')) {
          try {
            const data = JSON.parse(line.slice(2));
            fullResponse += data;
          } catch (e) {
            // Skip unparseable lines
            continue;
          }
        }
      }
    }

    // Initialize Twitter client
    const twitterClient = new TwitterApi({
      appKey: process.env.DM_API_KEY || '',
      appSecret: process.env.DM_API_SECRET || '',
      accessToken: process.env.DM_ACCESS_TOKEN || '',
      accessSecret: process.env.DM_ACCESS_SECRET || ''
    });
    const rwClient = twitterClient.readWrite;

    // Format and post tweet
    const tweetText = formatTweetText(fullResponse);
    const tweet = await rwClient.v2.tweet({
      text: tweetText
    });

    return res.status(200).json({
      data: tweet.data
    });
  } catch (error: any) {
    console.error('API Error:', error);

    if (error.code === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        data: {
          reset_at: error.rateLimit?.reset
            ? new Date(error.rateLimit.reset * 1000).toISOString()
            : 'unknown'
        }
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      data: error.message
    });
  }
}

function formatTweetText(text: string): string {
  // Remove markdown formatting if present
  text = text.replace(/[*_`#]/g, '');

  // Truncate to Twitter's max length (280 chars)
  if (text.length > 280) {
    text = text.substring(0, 277) + '...';
  }

  return text;
}
