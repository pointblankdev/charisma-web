import Navbar from '@components/layout/navbar';
import HeroSection from './hero-section';
import FeaturesSection from './features-section';
import ProductsSection from './products-section';
import Footer from './footer';
import ParticleBackground from './ParticleBackground';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background/10">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ProductsSection />
      </main>

      <Footer />

      {/* Background particles (now positioned behind all content) */}
      <ParticleBackground />
    </div>
  );
}
