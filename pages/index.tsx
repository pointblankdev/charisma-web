import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import ParticleBackground from '@components/lp/ParticleBackground';
import LandingPage from '@components/lp';


export default function IndexPage() {
  const meta = {
    title: 'Charisma | Next-Generation DeFi',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <ParticleBackground />
      <SkipNavContent />
      <LandingPage />
    </Page>
  );
}
