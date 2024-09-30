import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import { Card } from '@components/ui/card';
import { useState } from 'react';
import { PostConditionMode } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import { Input } from '@components/ui/input';
import Layout from '@components/layout/layout';
import { useOpenContractCall } from '@micro-stacks/react';
import { contractPrincipalCV, boolCV } from 'micro-stacks/clarity';
import redPill from '@public/sip9/pills/red-pill.gif';
import bluePill from '@public/sip9/pills/blue-pill.gif';
import redPillFloating from '@public/sip9/pills/red-pill-floating.gif';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import useWallet from '@lib/hooks/wallet-balance-provider';
import { GetStaticProps } from 'next';
import { getTotalSupply } from '@lib/stacks-api';

export const getStaticProps: GetStaticProps<Props> = () => {

  const syntheticWelshIssued = 100
  const syntheticRooIssued = 100

  const syntheticWelshRemainingSupply = 100//await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh');
  const syntheticRooRemainingSupply = 100//await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo');

  const syntheticWelshRedemptionsAvailable = 0//await getAvailableRedemptions('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh');
  const syntheticRooRedemptionsAvailable = 0//await getAvailableRedemptions('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo');

  return {
    props: {
      data: {
        syntheticWelsh: {
          issued: syntheticWelshIssued,
          burned: syntheticWelshIssued - syntheticWelshRemainingSupply,
          remaining: syntheticWelshRemainingSupply,
          available: syntheticWelshRedemptionsAvailable
        },
        syntheticRoo: {
          issued: syntheticRooIssued,
          burned: syntheticRooIssued - syntheticRooRemainingSupply,
          remaining: syntheticRooRemainingSupply,
          available: syntheticRooRedemptionsAvailable
        }
      }
    },
    revalidate: 60
  };
};

type Props = {
  data: any;
};


export default function RecoveryClaimPage({ data }: Props) {
  const meta = {
    title: 'Charisma | Recovery Claim',
    description: "Charisma Recovery Plan",
  };

  console.log(data)

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-4 md:max-w-5xl">
          <Tabs defaultValue="plan" className="">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <TabsList className="flex flex-wrap gap-2 mb-4">
                <TabsTrigger value="plan" className="flex-grow sm:flex-grow-0">
                  Recovery Plan
                </TabsTrigger>
                <TabsTrigger value="select" className="flex-grow sm:flex-grow-0">
                  Recovery Selection
                </TabsTrigger>
                <TabsTrigger value="redemptions" className="flex-grow sm:flex-grow-0">
                  Token Redemptions
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="plan">
              <CharismaRecoveryPlan />
            </TabsContent>
            <TabsContent value="select">
              <RecoveryClaim />
            </TabsContent>
            <TabsContent value="redemptions">
              <TokenRedemptions data={data} />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </Page>
  );
}

const TokenRedemptions = ({ data }: any) => {

  const { balances } = useWallet();

  const iouWelsh: any = balances?.fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh'];
  const iouRoo: any = balances?.fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo'];

  return (
    <div className="max-w-5xl p-6 mx-auto space-y-8 rounded-lg shadow-lg bg-gray-900/80">
      <div className='grid grid-cols-3'>
        <div></div>
        <div>Synthetic Welsh (iouWELSH)</div>
        <div>Synthetic Roo (iouROO)</div>

        <div>Total Issued</div>
        <div>{data.syntheticWelsh.issued}</div>
        <div>{data.syntheticRoo.issued}</div>

        <div>Total Redeemed</div>
        <div>{data.syntheticWelsh.burned}</div>
        <div>{data.syntheticRoo.burned}</div>

        <div>Redemptions Remaining</div>
        <div>{data.syntheticWelsh.remaining}</div>
        <div>{data.syntheticRoo.remaining}</div>

        <div className='mt-4'>Your Balances</div>
        <div className='mt-4'>{iouWelsh?.count || 0}</div>
        <div className='mt-4'>{iouRoo?.count || 0}</div>

        <div>Redemptions Available</div>
        <div>{data.syntheticWelsh.available}</div>
        <div>{data.syntheticRoo.available}</div>

        <div className='mt-4'>Redeem Tokens</div>
        <div className='mt-4'><Button disabled={data.syntheticWelsh.available === 0} className='h-6' >Redeem iouWELSH</Button></div>
        <div className='mt-4'><Button disabled={data.syntheticRoo.available === 0} className='h-6' >Redeem iouROO</Button></div>
      </div>
    </div>
  )
}

const RecoveryClaim = () => {

  const { openContractCall } = useOpenContractCall();

  function makeChoice(choice: boolean) {
    openContractCall({
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'recovery-claim',
      functionName: "claim",
      functionArgs: [boolCV(choice)],
      postConditionMode: PostConditionMode.Allow,
      postConditions: [],
    });
  }

  return (
    <div className='space-y-8'>
      <div className='text-xl text-center'>Select your recovery choice...</div>
      <div className='flex w-full p-24 rounded-full bg-gray-900/50'>
        <div className='flex flex-col items-center w-full space-y-4'>
          <Image src={redPillFloating} alt='Red Pill' width={250} height={250} className='transition-all cursor-pointer hover:scale-125 hover:-translate-y-4' />
          {/* <Button disabled onClick={() => makeChoice(true)} size={'sm'} className='text-sm w-36 hover:bg-[#ffffffee] hover:text-primary'>Select Red Pill</Button> */}
        </div>
        <div className='flex flex-col items-center w-full space-y-4'>
          <Image src={bluePillFloating} alt='Blue Pill' width={250} height={250} className='transition-all cursor-pointer hover:scale-125 hover:-translate-y-4' />
          {/* <Button disabled onClick={() => makeChoice(false)} size={'sm'} className='text-sm w-36 hover:bg-[#ffffffee] hover:text-blue-800 bg-blue-800'>Select Blue Pill</Button> */}
        </div>
      </div>
    </div>
  );
};

const CharismaRecoveryPlan = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index: any) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: 'What is this recovery plan?',
      answer:
        `The Charisma Recovery Plan is a two-pronged approach to address the recent governance attack on Charisma. There are many steps in the restoration plan that will be the same for everyone. Additionally, the plan offers two options for personalization: the Red Pill and the Blue Pill.`,
    },
    {
      question: 'What caused the need for a recovery plan?',
      answer:
        'During an governance attack on Charisma, key pools such as WELSH, ROO, and sCHA, along with the Charisma treasury containing STX, were compromised. The attackers minted 20 billion CHA tokens and used them to drain the STX-sCHA and STX-wCHA Velar Liquidity Pools, effectively stealing all STX, sCHA, and wCHA added by the Charisma team and others.',
    },
    {
      question: 'What are my options for recovery?',
      answer:
        `To address this, Charisma is offering two options: the Red Pill and the Blue Pill. While our goal is for all users will be fully restored, this option let's us personalize your recovery experience.`,
    },
  ];

  return (
    <div className="max-w-5xl p-6 mx-auto space-y-8 rounded-lg shadow-lg bg-gray-900/80">
      {/* Introduction */}
      <section className="mb-8">
        <h1 className="mb-8 text-4xl font-bold">
          Charisma Recovery Plan
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="pb-4 border-b border-gray-800">
              <button
                className="w-full text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {faq.question}
                  </h3>
                  <span className="">
                    {openFAQ === index ? '-' : '+'}
                  </span>
                </div>
              </button>
              {openFAQ === index && (
                <p className="mt-2 text-gray-300">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Token Redemptions */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Token Burns, Airdrops and Redemptions </h2>
        <p className="leading-relaxed">
          All CHA balances will be revert to their state on block 166688, and a new tradeable Charisma token will be created with swapping LP.
          Additionally, synthetic tokens will be airdropped to users who lost WELSH and ROO tokens.
          This will happen regardless of the recovery option chosen.
          <strong>These synthetic tokens will be redeemable for the original tokens at a 1:1 ratio.</strong>
        </p>
        <ul className="mt-4 ml-6 leading-relaxed list-disc">
          <li>
            <strong>New Charisma Token:</strong> A new Charisma token will be listed on a DEX, with $40k total initial liquidity provided.
          </li>
          <li>
            <strong>Synthetic WELSH:</strong> A synthetic WELSH token will be listed on a DEX, with $10k total initial liquidity provided.
          </li>
          <li>
            <strong>Synthetic ROO:</strong> A synthetic ROO token will be listed on a DEX, with $10k total initial liquidity provided.
          </li>
        </ul>
      </section>

      <hr className="border-t border-gray-800" />

      {/* New Charisma Token */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-100">New Charisma Token and Liquidity Pool</h2>
        <p className="leading-relaxed text-gray-300">
          A new wrapped Charisma token will be created and listed on a DEX to restore liquidity and bring value back to CHA holders.
          Only Red Pill holders can wrap their CHA tokens into this new token, helping maintain price stability.
          Wrapping and unwrapping will use controls similar to iQC to limit the flow of existing CHA tokens into it to keep the CHA token price stable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-100">Synthetic WELSH Token and Liquidity Pool</h2>
        <p className="leading-relaxed text-gray-300">
          A synthetic WELSH token will be created and listed on a DEX to restore value for users who lost WELSH tokens. This token will be backed by an initial liquidity pool funded with $10k total value, ensuring stable swap prices. Blue Pill holders will have priority access to redeem synthetic WELSH for original tokens at a 1:1 ratio, while maintaining a fair system that allows all holders to eventually recover their value.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-100">Synthetic ROO Token and Liquidity Pool</h2>
        <p className="leading-relaxed text-gray-300">
          A synthetic ROO token will be created and listed on a DEX to compensate users who lost ROO tokens. The liquidity pool will be funded with $10k total value to provide price stability for swaps. Blue Pill holders will receive priority when redeeming synthetic ROO for original tokens at a 1:1 ratio, while the process will also ensure that other holders have fair access to recover their tokens over time.
        </p>
      </section>

      <hr className="border-t border-gray-800" />

      {/* Red Pill vs Blue Pill */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">The Recovery Choices</h2>

        {/* Red Pill */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-bold text-red-500">🔴 The Red Pill</h3>
          <p className="leading-relaxed text-gray-200">
            The Red Pill allows holders to wrap their CHA tokens, offering a constant stream of value and helping stabilize the token's price.
            Wrapping tokens follows a custom vesting schedule after supply normalization, allowing gradual trading at stable prices.
            Without the Red Pill, users cannot unlock with the value of their held CHA governance tokens.
          </p>
        </div>

        {/* Blue Pill */}
        <div>
          <h3 className="mb-2 text-lg font-bold text-blue-500">🔵 The Blue Pill</h3>
          <p className="mt-4 leading-relaxed text-gray-200">
            The Blue Pill provides holders with priority access to token redemptions, specifically the synthetic tokens being airdropped to users who lost WELSH and ROO tokens.
            These synthetic tokens will be redeemable for the original tokens at a 1:1 ratio, with Blue Pill holders getting first in line for redemptions.
            This priority access for Blue Pill holders aims to help restore user balances efficiently, while still allowing Red Pill holders eventual access to recover their tokens.
          </p>
        </div>
      </section>

      <hr className="border-t border-gray-800" />

      {/* Recovery Timeline */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Recovery Timeline</h2>
        <ul className="ml-6 leading-relaxed text-gray-200 list-disc">
          <li>
            <strong>Immediate Token Airdrop:</strong> Existing CHA governance and synthetic tokens will be issued first.
          </li>
          <li>
            <strong>Tokens Listings:</strong> The new CHA token and synthetic tokens will be listed and LP added for swapping.
          </li>
          <li>
            <strong>Synthetic Redemptions:</strong> A smart contract will allow users to redeem synthetic tokens for original tokens at a 1:1 ratio.
          </li>
          <li>
            <strong>Contract Priority Controls:</strong> The contract will enforce a check to verify that the Blue Pill NFT is held for priority redemptions. This check will be lifted once either 20 million WELSH and 500,000 ROO tokens are redeemed, or 50% of all synthetic WELSH and ROO tokens are burned through redemptions.
          </li>
          <li>
            <strong>Redemption Funding:</strong> Redemptions will be supported by community donations and all Charisma-generated revenue until full collateralization is achieved.
          </li>
        </ul>
      </section>

      <hr className="border-t border-gray-800" />

      {/* Final Thoughts */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Final Thoughts</h2>
        <p className="leading-relaxed text-gray-200">
          The <strong>Red Pill</strong> offers greater rewards and exclusive access to the new Charisma token, positioning you for long-term growth while supporting Charisma's recovery.
          On the other hand, the <strong>Blue Pill</strong> provides priority on redemptions if you prefer a simpler recovery path.
          Both plans fully restore your lost tokens, but the Red Pill offers more value and control over your recovery, while the Blue Pill provides higher priority restitution.
        </p>
      </section>
    </div>
  );
};
