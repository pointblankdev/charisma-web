import { useRouter } from 'next/router';
import Link from 'next/link';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import CharismaRecoveryPlan from '@components/recovery/recovery-plan';
import RecoveryClaim from '@components/recovery/recovery-claim';
import TokenRedemptions from '@components/recovery/token-redemptions';

type Props = {
  data: any;
};

export default function RecoveryClaimPage({ data }: Props) {
  const router = useRouter();
  const { tab } = router.query;

  const meta = {
    title: 'Charisma | Recovery',
    description: "Charisma Recovery",
  };

  const renderContent = () => {
    switch (tab) {
      case 'plan':
        return <CharismaRecoveryPlan />;
      case 'claim':
        return <RecoveryClaim />;
      case 'redemptions':
        return <TokenRedemptions data={data} />;
      default:
        return <CharismaRecoveryPlan />;
    }
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-4 md:max-w-5xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <nav className="flex flex-wrap gap-2 mb-4">
              <Link href="/recovery/plan" className={`px-4 py-2 rounded-md ${tab === 'plan' ? 'bg-primary/70 text-white' : 'bg-[var(--sidebar)]'}`}>
                Recovery Plan
              </Link>
              <Link href="/recovery/claim" className={`px-4 py-2 rounded-md ${tab === 'claim' ? 'bg-primary/70 text-white' : 'bg-[var(--sidebar)]'}`}>
                Recovery Claim
              </Link>
              <Link href="/recovery/redemptions" className={`px-4 py-2 rounded-md ${tab === 'redemptions' ? 'bg-primary/70 text-white' : 'bg-[var(--sidebar)]'}`}>
                Token Redemptions
              </Link>
            </nav>
          </div>
          {renderContent()}
        </div>
      </Layout>
    </Page>
  );
}