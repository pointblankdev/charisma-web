// pages/debug/twitter.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Send, Search, User, Heart, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function TwitterDebug() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [tweetText, setTweetText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('');
  const [tweetId, setTweetId] = useState('');
  const [likeUserId, setLikeUserId] = useState('');
  const [likeTweetId, setLikeTweetId] = useState('');

  // Results
  const [results, setResults] = useState<any>(null);

  const callApi = async (endpoint: string, action: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    setStatus('');
    setResults(null);

    try {
      const queryParams = new URLSearchParams({ endpoint, action });
      if (method === 'GET' && body) {
        Object.entries(body).forEach(([key, value]) => {
          queryParams.append(key, value as string);
        });
      }

      const response = await fetch(`/api/v0/x?${queryParams}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API call failed');
      }

      setResults(data.data);
      setStatus('Success!');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Twitter API Debug Dashboard</h1>

      {/* Token Display */}
      <div className="p-4 mb-8 rounded-lg">
        <h2 className="mb-2 text-sm font-semibold">Access Token:</h2>
        <div className="text-xs break-all">{accessToken}</div>
      </div>

      {/* API Actions */}
      <div className="space-y-8">
        {/* Post Tweet */}
        <div className="p-4 border rounded-lg">
          <h3 className="flex items-center mb-3 font-semibold">
            <Send className="w-4 h-4 mr-2" />
            Post Tweet
          </h3>
          <div className="space-y-3">
            <textarea
              value={tweetText}
              onChange={e => setTweetText(e.target.value)}
              className="w-full p-2 border rounded bg-accent-foreground"
              rows={3}
              placeholder="Tweet text..."
            />
            <button
              onClick={() => callApi('TWEETS', 'POST', 'POST', { text: tweetText })}
              className="px-4 py-2 text-white rounded cursor-pointer bg-primary hover:brightness-105"
              disabled={!tweetText || loading}
            >
              Post Tweet
            </button>
          </div>
        </div>

        {/* Search Tweets */}
        <div className="p-4 border rounded-lg">
          <h3 className="flex items-center mb-3 font-semibold">
            <Search className="w-4 h-4 mr-2" />
            Search Tweets
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded bg-accent-foreground"
              placeholder="Search query..."
            />
            <button
              onClick={() => callApi('TWEETS', 'SEARCH', 'GET', { query: searchQuery })}
              className="px-4 py-2 text-white rounded cursor-pointer bg-primary hover:brightness-105"
              disabled={!searchQuery || loading}
            >
              Search
            </button>
          </div>
        </div>

        {/* Get User */}
        <div className="p-4 border rounded-lg">
          <h3 className="flex items-center mb-3 font-semibold">
            <User className="w-4 h-4 mr-2" />
            Get User
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 border rounded bg-accent-foreground"
              placeholder="Username..."
            />
            <button
              onClick={() => callApi('USERS', 'GET', 'GET', { username })}
              className="px-4 py-2 text-white rounded cursor-pointer bg-primary hover:brightness-105"
              disabled={!username || loading}
            >
              Get User
            </button>
          </div>
        </div>

        {/* Get Tweet */}
        <div className="p-4 border rounded-lg">
          <h3 className="flex items-center mb-3 font-semibold">
            <Search className="w-4 h-4 mr-2" />
            Get Tweet
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={tweetId}
              onChange={e => setTweetId(e.target.value)}
              className="w-full p-2 border rounded bg-accent-foreground"
              placeholder="Tweet ID..."
            />
            <button
              onClick={() => callApi('TWEETS', 'GET', 'GET', { id: tweetId })}
              className="px-4 py-2 text-white rounded cursor-pointer bg-primary hover:brightness-105"
              disabled={!tweetId || loading}
            >
              Get Tweet
            </button>
          </div>
        </div>

        {/* Like Tweet */}
        <div className="p-4 border rounded-lg">
          <h3 className="flex items-center mb-3 font-semibold">
            <Heart className="w-4 h-4 mr-2" />
            Like Tweet
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={likeUserId}
              onChange={e => setLikeUserId(e.target.value)}
              className="w-full p-2 border rounded bg-accent-foreground"
              placeholder="User ID..."
            />
            <input
              type="text"
              value={likeTweetId}
              onChange={e => setLikeTweetId(e.target.value)}
              className="w-full p-2 border rounded bg-accent-foreground"
              placeholder="Tweet ID to like..."
            />
            <button
              onClick={() =>
                callApi('LIKES', 'POST', 'POST', { userId: likeUserId, tweetId: likeTweetId })
              }
              className="px-4 py-2 text-white rounded cursor-pointer bg-primary hover:brightness-105"
              disabled={!likeUserId || !likeTweetId || loading}
            >
              Like Tweet
            </button>
          </div>
        </div>

        {/* Status and Results */}
        {(status || loading || results) && (
          <div className="p-4 space-y-4 border rounded-lg">
            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center text-blue-500">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </div>
            )}

            {/* Status Message */}
            {status && (
              <div
                className={`flex items-center ${
                  status.includes('Error') ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {status.includes('Error') ? (
                  <AlertCircle className="w-4 h-4 mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {status}
              </div>
            )}

            {/* Results */}
            {results && (
              <div>
                <h4 className="mb-2 font-semibold">Results:</h4>
                <pre className="p-4 overflow-auto text-sm rounded">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
