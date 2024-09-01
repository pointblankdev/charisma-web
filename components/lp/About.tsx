export default function About() {
  return (
    <section className="py-24 bg-[#111016] text-center -mx-4">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white">About Charisma</h2>
        <p className="mt-6 text-lg md:text-xl text-lightGrey">
          Charisma is dedicated to revolutionizing the management of digital assets, offering a
          user-centric and community-driven platform that empowers individuals to take control of
          their digital future. Our mission is to foster a decentralized ecosystem where every
          member has a voice and the tools to thrive.
        </p>
        <div className="mt-12">
          <a
            href="#learn-more"
            className="inline-block px-8 py-4 bg-primary rounded-full text-white font-semibold hover:bg-primaryDark transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
