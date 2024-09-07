import { useState, useEffect } from 'react';

export default function About() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="-mx-4 relative py-32 bg-gradient-to-b from-[#111016] to-[#0e0d13] text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/images/background-pattern.svg')" }}
      ></div>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <h2
          className={`text-5xl md:text-6xl font-extrabold text-white leading-tight transition-transform duration-700 ${
            scrollY > 100 ? 'transform scale-110' : ''
          }`}
        >
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-text">
            Discover Charisma
          </span>
        </h2>
        <p className="mt-8 text-xl md:text-2xl text-lightGrey max-w-3xl mx-auto leading-relaxed">
          Charisma is redefining digital asset management with a user-centric, community-driven
          platform that empowers individuals to control their digital future. We focus on creating a
          decentralized ecosystem where everyone has the tools to succeed.
        </p>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-50 blur-sm group-hover:opacity-80 transition duration-500"></div>
            <div className="relative z-10 p-8 bg-[#1a1924] rounded-lg shadow-xl group-hover:bg-[#252435] transition duration-500">
              <h3 className="text-3xl font-bold text-white">Our Mission</h3>
              <p className="mt-4 text-lg text-lightGrey leading-relaxed">
                To create a decentralized and inclusive ecosystem where everyone can manage their
                digital assets with transparency, security, and autonomy.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-50 blur-sm group-hover:opacity-80 transition duration-500"></div>
            <div className="relative z-10 p-8 bg-[#1a1924] rounded-lg shadow-lg group-hover:bg-[#252435] transition duration-500">
              <h3 className="text-3xl font-bold text-white">Our Vision</h3>
              <p className="mt-4 text-lg text-lightGrey leading-relaxed">
                A future where digital assets are democratized, accessible to everyone, and governed
                by transparent and decentralized principles.
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-50 blur-sm group-hover:opacity-80 transition duration-500"></div>
            <div className="relative z-10 p-8 bg-[#1a1924] rounded-lg shadow-lg group-hover:bg-[#252435] transition duration-500">
              <h3 className="text-3xl font-bold text-white">Our Values</h3>
              <p className="mt-4 text-lg text-lightGrey leading-relaxed">
                Transparency, decentralization, and community-driven development are the core values
                guiding everything we do at Charisma.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-20">
          <a
            href="/https://docs.charisma.rocks/"
            className="relative inline-block px-10 py-2 bg-primary rounded-full text-white font-semibold hover:bg-primaryDark transition duration-500 transform hover:-translate-y-2 shadow-lg hover:shadow-xl"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-0 hover:opacity-20 transition duration-500"></span>
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
