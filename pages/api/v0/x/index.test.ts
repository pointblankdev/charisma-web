import { describe, it } from 'vitest';

describe('Twitter API Endpoint Tests', () => {
  const API_BASE = 'http://localhost:3000/api/v0/x';

  describe('GET User', () => {
    it('should fetch a user', async () => {
      const username = 'elonmusk';
      const res = await fetch(`${API_BASE}?endpoint=USERS&action=GET&username=${username}`);
      const data = await res.json();
      console.log(data);

      expect(res.status).toBe(200);
      expect(data.data).toBeDefined();
    });

    it('should handle missing username', async () => {
      const res = await fetch(`${API_BASE}?endpoint=USERS&action=GET`);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Username required');
    });
  });

  describe('POST Tweet', () => {
    it('should post a tweet', async () => {
      const tweetText = `Hoot!`;
      const res = await fetch(`${API_BASE}?endpoint=TWEETS&action=POST`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: tweetText })
      });
      const data = await res.json();
      console.log(data);

      expect(res.status).toBe(201);
      expect(data.data).toBeDefined();
    });

    it('should handle empty tweet text', async () => {
      const res = await fetch(`${API_BASE}?endpoint=TWEETS&action=POST`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: '' })
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Tweet text required');
    });
  });

  describe('Search Tweets', () => {
    it('should search tweets', async () => {
      const query = 'javascript';
      const res = await fetch(
        `${API_BASE}?endpoint=TWEETS&action=SEARCH&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toBeDefined();
    });

    it('should handle empty search query', async () => {
      const res = await fetch(`${API_BASE}?endpoint=TWEETS&action=SEARCH`);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Search query required');
    });
  });

  describe('Like Tweet', () => {
    it('should like a tweet', async () => {
      // Replace with actual user and tweet IDs
      const userId = '123';
      const tweetId = '456';

      const res = await fetch(`${API_BASE}?endpoint=LIKES&action=POST`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, tweetId })
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data).toBeDefined();
    });

    it('should handle missing tweet ID', async () => {
      const userId = '123';

      const res = await fetch(`${API_BASE}?endpoint=LIKES&action=POST`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('User ID and Tweet ID required');
    });
  });
});
