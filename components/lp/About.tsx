export default function About() {
  return (
    <section className="py-24 bg-steelGrey text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white">About Charisma</h2>
        <p className="mt-8 text-lightGrey text-lg">
          Charisma is dedicated to revolutionizing the way digital assets are managed, offering a
          platform that is both user-centric and community-driven.
        </p>
        <div className="mt-12 flex justify-center space-x-6">
          <a
            href="#learn-more"
            className="px-8 py-4 bg-primary rounded-full text-white font-semibold hover:bg-primary-dark transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
