import React, { useState } from 'react';
import {
  Send,
  Search,
  User,
  Heart,
  AlertCircle,
  CheckCircle,
  Loader,
  MapPin,
  PlusCircle,
  MessageCircle,
  Settings,
  Vote,
  Filter,
  Image,
  Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';

// Tweet Card Component for displaying search results
const TweetCard = ({ tweet, expansions }: { tweet: any; expansions: any }) => {
  // Find referenced author if available
  const getReferencedAuthor = (refTweetId: string) => {
    if (!expansions?.users) return null;
    const refTweet = expansions.tweets?.find((t: any) => t.id === refTweetId);
    if (!refTweet) return null;
    return expansions.users.find((u: any) => u.id === refTweet.author_id);
  };

  const author = expansions?.users?.find((u: any) => u.id === tweet.author_id);
  const place = expansions?.places?.find((p: any) => p.id === tweet.geo?.place_id);

  return (
    <div className="p-4 border rounded-lg">
      <div className="space-y-2">
        {/* Author info if available */}
        {author && (
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            <span className="font-medium">@{author.username}</span>
          </div>
        )}

        {/* Tweet text */}
        <p className="text-sm">{tweet.text}</p>

        {/* Referenced tweet info */}
        {tweet.referenced_tweets?.map((ref: any) => {
          const refAuthor = getReferencedAuthor(ref.id);
          return (
            <div key={ref.id} className="pl-4 mt-2 text-sm border-l-2">
              <span className="text-gray-500">
                {ref.type === 'replied_to' && 'Replying to'}
                {ref.type === 'quoted' && 'Quoting'}
                {ref.type === 'retweeted' && 'Retweeted'}
              </span>
              {refAuthor && <span className="ml-1">@{refAuthor.username}</span>}
            </div>
          );
        })}

        {/* Location if available */}
        {place && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Map className="w-4 h-4" />
            <span>{place.full_name}</span>
          </div>
        )}

        {/* Media indicators */}
        {tweet.attachments?.media_keys && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Image className="w-4 h-4" />
            <span>{tweet.attachments.media_keys.length} media items</span>
          </div>
        )}

        {/* Metrics */}
        <div className="flex gap-4 text-sm text-gray-500">
          {tweet.created_at && <span>{new Date(tweet.created_at).toLocaleDateString()}</span>}
          {tweet.public_metrics && (
            <>
              <span>♥ {tweet.public_metrics.like_count}</span>
              <span>↺ {tweet.public_metrics.retweet_count}</span>
              <span>↩ {tweet.public_metrics.reply_count}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Search Panel Component
const SearchPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  // Expansion options state
  const [expansions, setExpansions] = useState({
    authorInfo: true,
    referencedTweets: true,
    mentions: true,
    polls: true,
    media: true,
    replyInfo: true,
    geoInfo: true,
    editHistory: true
  });

  // Results filters state
  const [filters, setFilters] = useState({
    hasMedia: false,
    hasGeo: false,
    hasLinks: false,
    isReply: false,
    isQuote: false,
    minLikes: '',
    maxResults: '10'
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    // Build expansion parameters
    const activeExpansions = [];
    if (expansions.authorInfo) activeExpansions.push('author_id');
    if (expansions.referencedTweets) {
      activeExpansions.push('referenced_tweets.id', 'referenced_tweets.id.author_id');
    }
    if (expansions.mentions) activeExpansions.push('entities.mentions.username');
    if (expansions.polls) activeExpansions.push('attachments.poll_ids');
    if (expansions.media) activeExpansions.push('attachments.media_keys');
    if (expansions.replyInfo) activeExpansions.push('in_reply_to_user_id');
    if (expansions.geoInfo) activeExpansions.push('geo.place_id');
    if (expansions.editHistory) activeExpansions.push('edit_history_tweet_ids');

    try {
      const queryParams = new URLSearchParams({
        endpoint: 'TWEETS',
        action: 'SEARCH',
        query: searchQuery,
        expansions: activeExpansions.join(',')
      });

      const response = await fetch(`/api/v0/x?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Apply filters to results
      let filteredData = data.data.data || [];

      if (filters.hasMedia) {
        filteredData = filteredData.filter(
          (tweet: any) => tweet.attachments?.media_keys?.length > 0
        );
      }

      if (filters.hasGeo) {
        filteredData = filteredData.filter((tweet: any) => tweet.geo);
      }

      if (filters.hasLinks) {
        filteredData = filteredData.filter((tweet: any) => tweet.entities?.urls?.length > 0);
      }

      if (filters.isReply) {
        filteredData = filteredData.filter((tweet: any) =>
          tweet.referenced_tweets?.some((ref: any) => ref.type === 'replied_to')
        );
      }

      if (filters.isQuote) {
        filteredData = filteredData.filter((tweet: any) =>
          tweet.referenced_tweets?.some((ref: any) => ref.type === 'quoted')
        );
      }

      if (filters.minLikes) {
        filteredData = filteredData.filter(
          (tweet: any) => tweet.public_metrics?.like_count >= parseInt(filters.minLikes)
        );
      }

      // Limit results
      filteredData = filteredData.slice(0, parseInt(filters.maxResults));

      setResults({
        ...data.data,
        data: filteredData
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tweets..."
            className="w-full p-2 border rounded bg-accent-foreground"
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      <Accordion type="multiple" className="w-full">
        {/* Expansion Options */}
        <AccordionItem value="expansions">
          <AccordionTrigger className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Search Options
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="authorInfo"
                        checked={expansions.authorInfo}
                        onChange={e =>
                          setExpansions({ ...expansions, authorInfo: e.target.checked })
                        }
                      />
                      <label htmlFor="authorInfo">Author Info</label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Include detailed author information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Add similar tooltips for other options */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="referencedTweets"
                  checked={expansions.referencedTweets}
                  onChange={e =>
                    setExpansions({ ...expansions, referencedTweets: e.target.checked })
                  }
                />
                <label htmlFor="referencedTweets">Referenced Tweets</label>
              </div>
              {/* Add other expansion options */}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Result Filters */}
        <AccordionItem value="filters">
          <AccordionTrigger className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Result Filters
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Existing filters */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasMedia"
                  checked={filters.hasMedia}
                  onChange={e => setFilters({ ...filters, hasMedia: e.target.checked })}
                />
                <label htmlFor="hasMedia">Has Media</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasGeo"
                  checked={filters.hasGeo}
                  onChange={e => setFilters({ ...filters, hasGeo: e.target.checked })}
                />
                <label htmlFor="hasGeo">Has Location</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isReply"
                  checked={filters.isReply}
                  onChange={e => setFilters({ ...filters, isReply: e.target.checked })}
                />
                <label htmlFor="isReply">Is Reply</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isQuote"
                  checked={filters.isQuote}
                  onChange={e => setFilters({ ...filters, isQuote: e.target.checked })}
                />
                <label htmlFor="isQuote">Is Quote Tweet</label>
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Minimum Likes"
                  value={filters.minLikes}
                  onChange={e => setFilters({ ...filters, minLikes: e.target.value })}
                  className="w-full p-2 border rounded bg-accent-foreground"
                />
              </div>

              <div className="col-span-2">
                <select
                  value={filters.maxResults}
                  onChange={e => setFilters({ ...filters, maxResults: e.target.value })}
                  className="w-full p-2 border rounded bg-accent-foreground"
                >
                  <option value="10">10 results</option>
                  <option value="25">25 results</option>
                  <option value="50">50 results</option>
                  <option value="100">100 results</option>
                </select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {error && (
        <div className="flex items-center text-red-500">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500">Found {results.data.length} results</div>
          {results.data.map((tweet: any) => (
            <TweetCard key={tweet.id} tweet={tweet} expansions={results.includes} />
          ))}
        </div>
      )}
    </div>
  );
};

function TwitterCompose() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);

  // Basic tweet state
  const [tweetText, setTweetText] = useState('');

  // Advanced parameters
  const [replyToTweetId, setReplyToTweetId] = useState('');
  const [excludeReplyUserIds, setExcludeReplyUserIds] = useState('');
  const [quoteTweetId, setQuoteTweetId] = useState('');
  const [directMessageLink, setDirectMessageLink] = useState('');
  const [superFollowersOnly, setSuperFollowersOnly] = useState(false);
  const [placeId, setPlaceId] = useState('');
  const [mediaIds, setMediaIds] = useState('');
  const [taggedUserIds, setTaggedUserIds] = useState('');
  const [replySettings, setReplySettings] = useState('everyone');

  // Poll state
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState(1440); // 24 hours default

  const handleSubmit = async () => {
    setLoading(true);
    setStatus('');
    setResults(null);

    try {
      // Construct the tweet payload
      const payload: any = { text: tweetText };

      // Add reply parameters if specified
      if (replyToTweetId) {
        payload.reply = {
          in_reply_to_tweet_id: replyToTweetId
        };
        if (excludeReplyUserIds) {
          payload.reply.exclude_reply_user_ids = excludeReplyUserIds
            .split(',')
            .map(id => id.trim());
        }
      }

      // Add quote tweet
      if (quoteTweetId) {
        payload.quote_tweet_id = quoteTweetId;
      }

      // Add DM link
      if (directMessageLink) {
        payload.direct_message_deep_link = directMessageLink;
      }

      // Add super followers setting
      if (superFollowersOnly) {
        payload.for_super_followers_only = true;
      }

      // Add geo location
      if (placeId) {
        payload.geo = { place_id: placeId };
      }

      // Add media
      if (mediaIds) {
        payload.media = {
          media_ids: mediaIds.split(',').map(id => id.trim())
        };
        if (taggedUserIds) {
          payload.media.tagged_user_ids = taggedUserIds.split(',').map(id => id.trim());
        }
      }

      // Add poll
      if (isPollEnabled && pollOptions.filter(Boolean).length >= 2) {
        payload.poll = {
          options: pollOptions.filter(Boolean),
          duration_minutes: pollDuration
        };
      }

      // Add reply settings
      if (replySettings !== 'everyone') {
        payload.reply_settings = replySettings;
      }

      const response = await fetch('/api/v0/x?endpoint=TWEETS&action=POST', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setResults(data.data);
      setStatus('Tweet posted successfully!');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl p-8 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Advanced Tweet Composer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Basic Tweet Text */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tweet Text</label>
              <textarea
                value={tweetText}
                onChange={e => setTweetText(e.target.value)}
                className="w-full p-2 border rounded bg-accent-foreground min-h-[100px]"
                placeholder="What's happening?"
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              {/* Reply Settings */}
              <AccordionItem value="reply">
                <AccordionTrigger className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Reply Settings
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={replyToTweetId}
                      onChange={e => setReplyToTweetId(e.target.value)}
                      placeholder="Reply to Tweet ID"
                      className="w-full p-2 border rounded bg-accent-foreground"
                    />
                    <input
                      type="text"
                      value={excludeReplyUserIds}
                      onChange={e => setExcludeReplyUserIds(e.target.value)}
                      placeholder="Exclude Reply User IDs (comma-separated)"
                      className="w-full p-2 border rounded bg-accent-foreground"
                    />
                    <select
                      value={replySettings}
                      onChange={e => setReplySettings(e.target.value)}
                      className="w-full p-2 border rounded bg-accent-foreground"
                    >
                      <option value="everyone">Everyone can reply</option>
                      <option value="mentionedUsers">Only mentioned users</option>
                      <option value="following">Only people you follow</option>
                    </select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Media Settings */}
              <AccordionItem value="media">
                <AccordionTrigger className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Media
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <input
                    type="text"
                    value={mediaIds}
                    onChange={e => setMediaIds(e.target.value)}
                    placeholder="Media IDs (comma-separated)"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={taggedUserIds}
                    onChange={e => setTaggedUserIds(e.target.value)}
                    placeholder="Tagged User IDs (comma-separated)"
                    className="w-full p-2 border rounded"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Poll Settings */}
              <AccordionItem value="poll">
                <AccordionTrigger className="flex items-center gap-2">
                  <Vote className="w-4 h-4" />
                  Poll
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPollEnabled}
                      onChange={e => setIsPollEnabled(e.target.checked)}
                      id="poll-toggle"
                    />
                    <label htmlFor="poll-toggle">Add Poll</label>
                  </div>
                  {isPollEnabled && (
                    <div className="space-y-2">
                      {pollOptions.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          value={option}
                          onChange={e => {
                            const newOptions = [...pollOptions];
                            newOptions[index] = e.target.value;
                            setPollOptions(newOptions);
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="w-full p-2 border rounded"
                        />
                      ))}
                      <button
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-sm text-red-500"
                        disabled={pollOptions.length >= 4}
                      >
                        Add Option
                      </button>
                      <select
                        value={pollDuration}
                        onChange={e => setPollDuration(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="60">1 hour</option>
                        <option value="180">3 hours</option>
                        <option value="1440">24 hours</option>
                        <option value="10080">7 days</option>
                      </select>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Additional Settings */}
              <AccordionItem value="additional">
                <AccordionTrigger className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Additional Settings
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <input
                    type="text"
                    value={quoteTweetId}
                    onChange={e => setQuoteTweetId(e.target.value)}
                    placeholder="Quote Tweet ID"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={directMessageLink}
                    onChange={e => setDirectMessageLink(e.target.value)}
                    placeholder="Direct Message Link"
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={superFollowersOnly}
                      onChange={e => setSuperFollowersOnly(e.target.checked)}
                      id="super-followers"
                    />
                    <label htmlFor="super-followers">Super Followers Only</label>
                  </div>
                  <input
                    type="text"
                    value={placeId}
                    onChange={e => setPlaceId(e.target.value)}
                    placeholder="Place ID for Geo-location"
                    className="w-full p-2 border rounded"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <button
              onClick={handleSubmit}
              disabled={loading || !tweetText}
              className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Posting...
                </span>
              ) : (
                'Post Tweet'
              )}
            </button>

            {/* Status and Results */}
            {(status || results) && (
              <div className="p-4 mt-4 border rounded-lg">
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
                {results && (
                  <pre className="p-4 mt-4 overflow-auto rounded">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TwitterDebug() {
  return (
    <div className="max-w-3xl p-8 mx-auto">
      <Tabs defaultValue="compose">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <TwitterCompose />
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tweet Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
