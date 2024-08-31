export default function CommunityShowcase() {
  return (
    <section className="py-20 bg-gradient-to-r from-steelGrey to-darkGrey">
      <div className="max-w-7xl mx-auto text-center border-t border-lightGrey pt-12">
        <h2 className="text-5xl font-bold text-white">A Global Movement, Built by You</h2>
        <p className="text-lightGrey mt-8 max-w-2xl mx-auto">
          Join a network of innovators, creators, and changemakers from across the globe.
        </p>
        <div className="mt-12 flex justify-center space-x-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-28 h-28 bg-gradient-to-b from-charcoalGrey to-steelGrey border border-steelGrey rounded-full transform hover:scale-110 transition-transform"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
