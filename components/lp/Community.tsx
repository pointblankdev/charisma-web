import { TwitterTweetEmbed } from 'react-twitter-embed';

export default function CommunityShowcase() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto text-center px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          A Global Movement, Built by You
        </h2>
        <p className="text-lightGrey mt-6 text-lg md:text-xl max-w-2xl mx-auto">
          Join a network of innovators, creators, and changemakers from across the globe.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <TwitterTweetEmbed tweetId={'1829311227635392829'} />
          <TwitterTweetEmbed tweetId={'1828235720240382456'} />
          <TwitterTweetEmbed tweetId={'1828350818648515051'} />
        </div>
      </div>
    </section>
  );
}
