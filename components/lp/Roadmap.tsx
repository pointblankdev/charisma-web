import { motion } from 'framer-motion';

export default function Roadmap() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0f0e14] to-[#121117] -mx-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8a00] to-[#e52e71]">
          Roadmap
        </h2>
        <p className="text-lightGrey mt-6 text-lg md:text-xl max-w-2xl mx-auto">
          Discover the milestones we aim to achieve as we continue to innovate and grow.
        </p>
        <div className="mt-16 relative">
          <div className="border-2 absolute border-opacity-20 border-lightGrey h-full left-1/2 transform -translate-x-1/2"></div>
          {roadmapItems.map((item, index) => (
            <RoadmapItem
              key={index}
              title={item.title}
              description={item.description}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoadmapItem({ title, description, isLeft }) {
  return (
    <motion.div
      className={`mb-8 flex justify-${isLeft ? 'end' : 'start'} relative roadmap-item`}
      initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      viewport={{ once: true }}
    >
      <div className="w-5/12">
        <div className="bg-gradient-to-r from-[#232228] to-[#2a292e] p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-lightGrey mt-3 text-base leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-2 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
    </motion.div>
  );
}

const roadmapItems = [
  {
    title: 'Q3 2024',
    description: 'Launch of governance token and staking platform.'
  },
  {
    title: 'Q4 2024',
    description: 'Introduction of community-driven features and decentralized voting.'
  },
  {
    title: 'Q1 2025',
    description: 'Expansion of partnerships and integrations with major platforms.'
  },
  {
    title: 'Q2 2025',
    description: 'Implementation of advanced security protocols and scalability solutions.'
  }
  // Add more roadmap items as needed
];
