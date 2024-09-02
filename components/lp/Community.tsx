import { TwitterTweetEmbed } from 'react-twitter-embed';
import { motion } from 'framer-motion';

export default function CommunityShowcase() {
  return (
    <section className="-mx-4 py-20 bg-gradient-to-b from-[#0e0d19] to-[#1a1a2e]">
      <div className="max-w-7xl mx-auto text-center px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8a00] to-[#e52e71]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          A Global Movement, Built by You
        </motion.h2>
        <motion.p
          className="text-lightGrey mt-6 text-lg md:text-xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Join a network of innovators, creators, and changemakers from across the globe.
        </motion.p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tweetIds.map((tweetId, index) => (
            <motion.div
              key={index}
              className="bg-[#1a1a2e] rounded-2xl shadow-lg p-4 transition-transform transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 * index }}
            >
              <TwitterTweetEmbed tweetId={tweetId} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const tweetIds = ['1829311227635392829', '1828235720240382456', '1828350818648515051'];
