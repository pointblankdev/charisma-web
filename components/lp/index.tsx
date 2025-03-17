import Layout from '../layout/layout';
import Hero from './hero';
import styleUtils from '@components/utils.module.css';
import ParticleBackground from './ParticleBackground';

export default function LandingPage() {

  return (
    <div className={styleUtils.container}>
      <Hero />
      <ParticleBackground />
    </div>
  );
}
