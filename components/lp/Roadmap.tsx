export default function Roadmap() {
  return (
    <section className="py-24 bg-[#121117] -mx-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white">Roadmap</h2>
        <p className="text-lightGrey mt-6 text-lg md:text-xl max-w-2xl mx-auto">
          Discover the milestones we aim to achieve as we continue to innovate and grow.
        </p>
        <div className="mt-16">
          <div className="relative wrap overflow-hidden p-10 h-full">
            <div className="border-2-2 absolute border-opacity-20 border-lightGrey h-full border left-1/2"></div>
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
      </div>
    </section>
  );
}

function RoadmapItem({
  title,
  description,
  isLeft
}: {
  title: string;
  description: string;
  isLeft: boolean;
}) {
  return (
    <div className={`mb-8 flex justify-${isLeft ? 'end' : 'start'} relative`}>
      <div className="w-5/12">
        <div className="bg-[#232228] p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="text-lightGrey mt-2">{description}</p>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -mt-2 w-4 h-4 bg-primary rounded-full border border-white"></div>
    </div>
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
