import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { GetStaticProps } from 'next';
import { getQuest, getQuests } from '@lib/db-providers/kv';
import Image from 'next/image';
import energyIcon from '@public/creatures/img/energy.png';
import Link from 'next/link';
import { Button } from '@components/ui/button';

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all quests from db
  const questContractAddresses = await getQuests()

  const quests = []
  for (const ca of questContractAddresses) {
    const metadata = await getQuest(ca)
    quests.push(metadata)
  }

  return {
    props: {
      quests
    },
    revalidate: 60000
  };
};

type Props = {
  quests: any[];
};


export default function RewardsIndex({ quests }: Props) {
  const meta = {
    title: 'Charisma | Rewards',
    description: META_DESCRIPTION,
    // image: '/creatures/img/farmers.png'
  };


  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
          <div className='flex justify-between'>
            <div className="space-y-1">
              <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary"><>Quests</><Image alt='energy-icon' src={energyIcon} className='mx-2 rounded-full w-9 h-9' /></h2>
              <p className="flex items-center text-base text-muted-foreground">
                Spend your accumulated energy on quests to claim unique token and NFT rewards.
              </p>
            </div>
            <Link passHref href={'/quest-deployer'}>
              <Button className='bg-primary-foreground/5'>Create New Quest</Button>
            </Link>
          </div>
          <div className='grid gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            Coming soon...
          </div>
        </div>
      </Layout>
    </Page>
  );
}
