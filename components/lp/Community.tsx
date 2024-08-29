export default function CommunityShowcase() {
  return (
    <section className="py-16 bg-charcoalGrey">
      <div className="max-w-7xl mx-auto text-center border-t border-steelGrey">
        <h2 className="text-4xl font-bold text-white">A Global Movement, Built by You</h2>
        <p className="text-lightGrey mt-4">
          Join a network of innovators, creators, and changemakers from across the globe.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <div className="w-24 h-24 bg-darkGrey border border-steelGrey rounded-full"></div>
          <div className="w-24 h-24 bg-darkGrey border border-steelGrey rounded-full"></div>
          <div className="w-24 h-24 bg-darkGrey border border-steelGrey rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
