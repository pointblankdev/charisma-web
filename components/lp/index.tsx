import Layout from '../layout';
import Hero from './hero';
import styleUtils from '@components/utils.module.css';

export default function LandingPage() {

  return (
    <Layout>
      <div className={styleUtils.container}>
        <>
          <Hero />
        </>
      </div>
    </Layout>
  );
}
