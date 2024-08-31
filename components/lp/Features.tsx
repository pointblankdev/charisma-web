export default function Features() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-darkGrey border border-charcoalGrey rounded-lg transform hover:scale-105 transition-transform">
          <h3 className="text-2xl font-semibold text-white">Decentralized Governance</h3>
          <p className="text-lightGrey mt-4">
            Experience a new era of transparent and democratic decision-making.
          </p>
        </div>
        <div className="p-6 bg-darkGrey border border-charcoalGrey rounded-lg transform hover:scale-105 transition-transform">
          <h3 className="text-2xl font-semibold text-white">Community First</h3>
          <p className="text-lightGrey mt-4">
            Empower yourself in a collective that values every voice.
          </p>
        </div>
        <div className="p-6 bg-darkGrey border border-charcoalGrey rounded-lg transform hover:scale-105 transition-transform">
          <h3 className="text-2xl font-semibold text-white">Secure & Scalable</h3>
          <p className="text-lightGrey mt-4">
            A robust foundation built to evolve with the community.
          </p>
        </div>
      </div>
    </section>
  );
}
