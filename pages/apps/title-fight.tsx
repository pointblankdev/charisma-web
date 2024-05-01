
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import { Card } from '@components/ui/card';
import titleBelt from '@public/wooo-title-belt-nft.gif'
import { Button } from '@components/ui/button';
import { getAccountBalance, getNameFromAddress, getTitleBeltHoldeBalance, getTitleBeltHolder } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { userSession } from '@components/stacks-session/connect';
import millify from 'millify';
import { StacksMainnet } from "@stacks/network";
import { AnchorMode, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import { useConnect } from '@stacks/connect-react';
import Link from 'next/link';

export default function Woooooo({ data }: Props) {
  const meta = {
    title: 'Charisma | WELSH + ROO = WOOO',
    description: META_DESCRIPTION,
    image: '/wooo-title-belt-nft.gif'
  };

  const { doContractCall } = useConnect();

  const titleBeltHolder = data.bns || data.titleBeltHolder

  const [sWelshBalance, setSWelshBalance] = useState(0)
  const [sRooBalance, setSRooBalance] = useState(0)
  const [woooBalance, setWoooBalance] = useState(0)
  const [woooRecord, setWoooRecord] = useState(data.woooRecord)

  function challenge() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme023-wooo-title-belt-nft",
      functionName: "challenge-title-holder",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(data.titleBeltHolder).willSendAsset().nft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme023-wooo-title-belt-nft::wooo-title-belt', uintCV(0))
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  useEffect(() => {
    try {
      const profile = userSession.loadUserData().profile
      getAccountBalance(profile.stxAddress.mainnet).then(balance => {
        setSWelshBalance(balance.fungible_tokens['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh::liquid-staked-welsh'].balance)
        setSRooBalance(balance.fungible_tokens['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo::liquid-staked-roo'].balance)
        setWoooBalance(balance.fungible_tokens['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme021-wooo-token::wooo'].balance)
      })
    } catch (error) {
      console.error(error)
    }

  }, [userSession])

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <Image alt='Title Belt' src={titleBelt} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="self-center font-bold text-md sm:text-2xl">The Wooo! Title Fight</h1>
              </div>
              <div className='flex justify-around space-x-2'>
                <p className="w-full text-xs leading-tight font-md sm:text-sm">
                  Do you have what it takes to be a champion? Whoever claims the title for the most WOOO tokens, can "challenge" the champion. If they win, they claim the Wooo! Champion's Title Belt NFT, which is a mint pass and airdrop target for future rewards.
                </p>
              </div>
              <div className='flex flex-wrap justify-around my-8 space-x-2 space-y-8 sm:space-y-0'>
                <div className='px-2'>
                  <div className='text-xl text-center whitespace-nowrap'>Your Account Balances</div>
                  <div className='flex space-x-2'>
                    <div className='w-36'>
                      <div className='pt-1 mt-1 text-xs leading-snug text-center'>sWELSH</div>
                      <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{millify(sWelshBalance / 1000000)}</div>
                    </div>
                    <div className='w-36'>
                      <div className='pt-1 mt-1 text-xs leading-snug text-center'>sROO</div>
                      <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{millify(sRooBalance / 1000000)}</div>
                    </div>
                  </div>
                  <div className='w-full'>
                    <div className='pt-1 mt-1 text-xs leading-snug text-center'>WOOO</div>
                    <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{woooBalance / 10000}</div>
                  </div>
                </div>
                <div className='px-2'>
                  <Button className='w-full' variant={'secondary'} onClick={challenge}>🥊 Challenge Title Holder</Button>
                  <div className='pt-1 mt-1 text-xs leading-snug text-center'>Current Title Belt Holder</div>
                  <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{titleBeltHolder}</div>
                  <div className='w-full'>
                    <div className='pt-1 mt-1 text-xs leading-snug text-center'>WOOO Record</div>
                    <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{woooRecord / 10000}</div>
                  </div>
                </div>
              </div>
              <div className='flex justify-around space-x-2'>
                <Link href={'/crafting/wooo'}>
                  <p className="w-full text-xs leading-tight font-md sm:text-sm py-2 hover:text-secondary">
                    Need WOOO? You can craft it by combining sWELSH and sROO tokens.
                  </p>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};


export const getStaticProps: GetStaticProps<Props> = async () => {

  try {
    const holder = await getTitleBeltHolder()
    const balance = await getTitleBeltHoldeBalance()
    const bns = await getNameFromAddress(holder.value)

    return {
      props: {
        data: {
          titleBeltHolder: holder.value,
          bns: bns.names[0],
          woooRecord: balance.value
        }
      },
      revalidate: 60
    };

  } catch (error) {
    return {
      props: {
        data: {}
      },
    }
  }
};
