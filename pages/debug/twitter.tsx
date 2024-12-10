import React, { useState, useEffect } from 'react';
import { TwitterApi } from 'twitter-api-v2';
import { MessageSquare, Send, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const TwitterDashboard = () => {
  const [tweet, setTweet] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState(null as any);
  const [recentTweets, setRecentTweets] = useState([]);

  // Get token from URL params or localStorage
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('accessToken');
      if (urlToken) {
        localStorage.setItem('twitter_token', urlToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return urlToken;
      }
      return localStorage.getItem('twitter_token');
    }
    return null;
  }) as any;

  // Fetch user info and recent tweets on load
  useEffect(() => {
    if (token) {
      fetchUserInfo();
      fetchRecentTweets();
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const client = new TwitterApi(token);
      const me = (await client.v2.me()) as any;
      setUserInfo(me.data);
    } catch (err) {
      setError('Failed to fetch user info');
      console.error(err);
    }
  };

  const fetchRecentTweets = async () => {
    try {
      const client = new TwitterApi(token);
      if (userInfo?.id) {
        const tweets: any = await client.v2.userTimeline(userInfo.id, {
          max_results: 5,
          'tweet.fields': ['created_at']
        });
        setRecentTweets(tweets.data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch recent tweets');
      console.error(err);
    }
  };

  const handleTweet = async () => {
    if (!tweet.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const client = new TwitterApi(token);
      await client.v2.tweet(tweet);

      setSuccess('Tweet posted successfully!');
      setTweet('');
      // Refresh recent tweets
      fetchRecentTweets();
    } catch (err: any) {
      setError(err.message || 'Failed to post tweet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-2xl p-6 mx-auto mt-10 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="mb-4 text-2xl font-bold">No Access Token Found</h2>
        <p className="text-gray-600">Please authenticate with Twitter first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl p-6 mx-auto">
      {/* User Info */}
      {userInfo && (
        <div className="p-4 mb-6 rounded-lg bg-blue-50">
          <h2 className="mb-2 text-xl font-bold">Welcome, @{userInfo.username}!</h2>
          <p className="text-gray-600">{userInfo.name}</p>
        </div>
      )}

      {/* Tweet Composer */}
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          <textarea
            value={tweet}
            onChange={e => setTweet(e.target.value)}
            placeholder="What's happening?"
            className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={280}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{tweet.length}/280 characters</span>
            <button
              onClick={handleTweet}
              disabled={loading || !tweet.trim()}
              className="flex items-center px-6 py-2 space-x-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>Tweet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center p-4 mb-4 space-x-2 text-red-700 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center p-4 mb-4 space-x-2 text-green-700 rounded-lg bg-green-50">
          <CheckCircle2 className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Recent Tweets */}
      <div className="mt-8">
        <div className="flex items-center mb-4 space-x-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="text-xl font-bold">Recent Tweets</h2>
          <button
            onClick={fetchRecentTweets}
            className="p-2 ml-auto rounded-full hover:bg-gray-100"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {recentTweets.map((tweet: any) => (
            <div key={tweet.id} className="p-4 border rounded-lg">
              <p>{tweet.text}</p>
              <span className="text-sm text-gray-500">
                {new Date(tweet.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TwitterDashboard;
