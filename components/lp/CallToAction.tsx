export default function CallToAction() {
  return (
    <section className="py-20 bg-black text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white">Ready to Unlock Your Full Potential?</h2>
        <p className="text-lightGrey mt-4">
          Join the Charisma community and start your journey today.
        </p>
        <div className="mt-8">
          <a
            href="#get-started"
            className="px-8 py-4 bg-primary rounded-full text-white font-semibold hover:bg-primary-dark transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
