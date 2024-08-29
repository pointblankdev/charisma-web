import Layout from '../layout/layout';
import Hero from './hero';
import styleUtils from '@components/utils.module.css';
import Features from './Features';
import Community from './Community';
import CallToAction from './CallToAction';

export default function LandingPage() {
  return (
    <Layout>
      <div className={styleUtils.container}>
        <>
          <Hero />
          <Features />
          <Community />
          <CallToAction />
        </>
      </div>
    </Layout>
  );
}
