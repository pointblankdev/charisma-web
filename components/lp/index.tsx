import Layout from '../layout/layout';
import Hero from './hero';
import styleUtils from '@components/utils.module.css';

export default function LandingPage() {

  return (
    <div className={styleUtils.container}>
      <Hero />
    </div>
  );
}
