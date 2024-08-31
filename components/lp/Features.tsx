export default function Features() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} title={feature.title} description={feature.description} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-darkGrey border border-charcoalGrey rounded-lg transform hover:scale-105 transition-transform">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="text-lightGrey mt-4">{description}</p>
    </div>
  );
}

const features = [
  {
    title: 'Decentralized Governance',
    description: 'Experience a new era of transparent and democratic decision-making.'
  },
  {
    title: 'Community First',
    description: 'Empower yourself in a collective that values every voice.'
  },
  {
    title: 'Secure & Scalable',
    description: 'A robust foundation built to evolve with the community.'
  }
];
