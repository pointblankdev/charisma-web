// components/Features.tsx
import { FaShieldAlt, FaUsers, FaChartLine } from 'react-icons/fa';

export default function Features() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
          Our Features
        </h2>
        <p className="text-lightGrey mt-4 text-center max-w-2xl mx-auto">
          Discover the powerful features that make Charisma the preferred platform for decentralized governance.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<FaShieldAlt className="text-primary text-4xl" />}
            title="Decentralized Governance"
            description="Experience a new era of transparent and democratic decision-making."
          />
          <FeatureCard
            icon={<FaUsers className="text-primary text-4xl" />}
            title="Community First"
            description="Empower yourself in a collective that values every voice."
          />
          <FeatureCard
            icon={<FaChartLine className="text-primary text-4xl" />}
            title="Secure & Scalable"
            description="A robust foundation built to evolve with the community."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#0D0C12] p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="text-lightGrey mt-4">{description}</p>
    </div>
  );
}
