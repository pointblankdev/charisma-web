import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import ParticleBackground from '@components/lp/ParticleBackground';
import LandingPage from '@components/lp';

export default function Conf({ data }: Props) {
  const { query } = useRouter();
  const meta = {
    title: 'Charisma | The community-run DAO',
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


type Props = {
  data: any;
};