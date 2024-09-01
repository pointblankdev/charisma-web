import Layout from '../layout/layout';
import Hero from './hero';
import styleUtils from '@components/utils.module.css';
import Features from './Features';
import Community from './Community';
import CallToAction from './CallToAction';
import About from './About';
import FAQ from './FAQ';
import Roadmap from './Roadmap';

export default function LandingPage() {
  return (
    <Layout>
      <div className={styleUtils.container}>
        <>
          <Hero />
          <Features />
          <About />
          <Community />
          <Roadmap />
          <CallToAction />
          <FAQ />ARC
        </>
      </div>
    </Layout>
  );
}
