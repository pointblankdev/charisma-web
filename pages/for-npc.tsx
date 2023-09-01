
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import ParticleBackground from '@components/lp/ParticleBackground';
import Layout from '@components/layout';
import Hero from '@components/npc/hero';
import LearnMore from '@components/npc/learn-more';
import styleUtils from '@components/utils.module.css';

export default function ForNpcPage() {
  const meta = {
    title: 'Charisma | Attract and Reward Your Community',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <ParticleBackground />
      <SkipNavContent />
      <Layout>
        <div className={styleUtils.container}>
          <Hero />
          <LearnMore />
        </div>
      </Layout>
    </Page>
  );
}
