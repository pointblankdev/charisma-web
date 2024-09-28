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




export default function RecoveryClaimPage() {
  const meta = {
    title: 'Charisma | Recovery Claim',
    description: "Charisma Recovery Plan: Decision Guide",
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-5xl">
          <CharismaRecoveryPlan />
          {/* <p className='sm:p-8 mx-auto my-[100vh] text-lg sm:text-2xl font-light text-center max-w-prose'>"You take the blue pill - the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill - you stay in Wonderland and I show you how deep the rabbit hole goes."</p> */}
          <RecoveryClaim />
          {/* <FAQSection /> */}
        </div>
      </Layout>
    </Page>
  );
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
    <div className='my-[100vh] space-y-8'>
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
        `The Charisma Recovery Plan is a two-pronged approach to address the recent governance attack on Charisma. The plan offers two recovery options: the Red Pill and the Blue Pill. These options determine how users will be compensated for their lost tokens and provide different paths forward depending on each user's choice.`,
    },
    {
      question: 'What caused the need for a recovery plan?',
      answer:
        'During an governance attack on Charisma, key pools such as WELSH, ROO, and sCHA, along with the Charisma treasury containing STX, were compromised. The attackers minted 20 billion CHA tokens and used them to drain the STX-sCHA and STX-wCHA Velar Liquidity Pools, effectively stealing all STX, sCHA, and wCHA added by the Charisma team and others.',
    },
    {
      question: 'What are my options for recovery?',
      answer:
        `To address this, Charisma is offering two recovery options: the Red Pill and the Blue Pill. These options determine how users will be compensated for their lost tokens and provide different paths forward depending on each user's choice. After the token burn and supply normalization, as well as 90% of users having made their recovery choice, the recovery process will begin.`,
    },
  ];

  return (
    <div className="sm:p-8">
      <div className="max-w-5xl p-6 mx-auto space-y-8 rounded-lg shadow-lg bg-white/90">
        {/* Introduction */}
        <section className="mb-8">
          <h1 className="mb-8 text-4xl font-bold text-gray-800">
            Charisma Recovery Plan
          </h1>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b border-gray-300">
                <button
                  className="w-full text-left focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-700">
                      {faq.question}
                    </h3>
                    <span className="text-gray-500">
                      {openFAQ === index ? '-' : '+'}
                    </span>
                  </div>
                </button>
                {openFAQ === index && (
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Token Redemptions */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Token Burns, Airdrops and Redemptions </h2>
          <p className="leading-relaxed text-gray-700">
            All CHA balances will be revert to their state on block 166688, and a new tradeable Charisma token will be created with swapping LP.
            Additionally, synthetic tokens will be airdropped to users who lost WELSH and ROO tokens.
            This will happen regardless of the recovery option chosen.
            <strong>These synthetic tokens will be redeemable for the original tokens at a 1:1 ratio.</strong>
          </p>
          <ul className="mt-4 ml-6 leading-relaxed text-gray-700 list-disc">
            <li>
              <strong>New Charisma Token:</strong> A new Charisma token will be listed on a DEX, with $40k total initial liquidity provided.
            </li>
            <li>
              <strong>Synthetic WELSH:</strong> A synthetic WELSH token will be listed on a DEX, with $20k total initial liquidity provided.
            </li>
            <li>
              <strong>Synthetic ROO:</strong> A synthetic ROO token will be listed on a DEX, with $10k total initial liquidity provided.
            </li>
          </ul>
        </section>

        <hr className="border-t border-gray-300" />

        {/* New Charisma Token */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">New Charisma Token and Liquidity Pool</h2>
          <p className="leading-relaxed text-gray-700">
            A new wrapped Charisma token will be created and listed on a DEX to restore liquidity and bring value back to CHA holders.
            Only Red Pill holders can wrap their CHA tokens into this new token, helping maintain price stability.
            Wrapping and unwrapping will use controls similar to iQC to limit the flow of existing CHA tokens into it to keep the CHA token price stable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Synthetic WELSH Token and Liquidity Pool</h2>
          <p className="leading-relaxed text-gray-700">
            A synthetic WELSH token will be created and listed on a DEX to restore value for users who lost WELSH tokens. This token will be backed by an initial liquidity pool funded with $20k STX, ensuring stable swap prices. Blue Pill holders will have priority access to redeem synthetic WELSH for original tokens at a 1:1 ratio, while maintaining a fair system that allows all holders to eventually recover their value.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Synthetic ROO Token and Liquidity Pool</h2>
          <p className="leading-relaxed text-gray-700">
            A synthetic ROO token will be created and listed on a DEX to compensate users who lost ROO tokens. The liquidity pool for this token will be funded with $10k STX to provide price stability for swaps. Blue Pill holders will receive priority when redeeming synthetic ROO for original tokens at a 1:1 ratio, while the process will also ensure that other holders have fair access to recover their tokens over time.
          </p>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Red Pill vs Blue Pill */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">The Recovery Choices</h2>

          {/* Red Pill */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-bold text-red-500">🔴 The Red Pill</h3>
            <p className="leading-relaxed text-gray-700">
              The Red Pill allows holders to wrap their CHA tokens, offering a constant stream of value and helping stabilize the token's price.
              Wrapping tokens follows a custom vesting schedule after supply normalization, allowing gradual trading at stable prices.
              Without the Red Pill, users cannot unlock with the value of their held CHA governance tokens.
            </p>
          </div>

          {/* Blue Pill */}
          <div>
            <h3 className="mb-2 text-lg font-bold text-blue-500">🔵 The Blue Pill</h3>
            <p className="mt-4 leading-relaxed text-gray-700">
              The Blue Pill provides holders with priority access to token redemptions, specifically the synthetic tokens being airdropped to users who lost WELSH and ROO tokens.
              These synthetic tokens will be redeemable for the original tokens at a 1:1 ratio, with Blue Pill holders getting first in line for redemptions.
              This priority access for Blue Pill holders aims to help restore user balances efficiently, while still allowing Red Pill holders eventual access to recover their tokens.
            </p>
          </div>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Recovery Timeline */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Recovery Timeline</h2>
          <ul className="ml-6 leading-relaxed text-gray-700 list-disc">
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
              <strong>Contract Priority Controls:</strong> The contract will enforce a check to verify that the Blue Pill NFT is held for priority redemptions. This check will be lifted once either 10 million WELSH and 500,000 ROO tokens are redeemed, or 90% of all Blue Pill holder redemptions are fulfilled.
            </li>
            <li>
              <strong>Redemption Funding:</strong> Redemptions will be supported by community donations and all Charisma-generated revenue until full collateralization is achieved.
            </li>
          </ul>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Final Thoughts */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Final Thoughts</h2>
          <p className="leading-relaxed text-gray-700">
            The <strong>Red Pill</strong> offers greater rewards and exclusive access to the new Charisma token, positioning you for long-term growth while supporting Charisma's recovery.
            On the other hand, the <strong>Blue Pill</strong> provides priority on redemptions if you prefer a simpler recovery path.
            Both plans fully restore your lost tokens, but the Red Pill offers more value and control over your recovery, while the Blue Pill provides higher priority restitution.
          </p>
        </section>
      </div>
    </div >
  );
};

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index: any) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: 'What is the Red Pill option?',
      answer:
        `The Red Pill option allows users to support Charisma's long-term recovery and receive 150% of their lost tokens' USD value in CHA tokens. Red Pill holders will also have exclusive access to wrap into the new Charisma token, giving their existing CHA tokens trade value. The more users choose the Red Pill, the faster Charisma will recover.`,
    },
    {
      question: 'What is the Blue Pill option?',
      answer:
        'The Blue Pill option is for users seeking immediate restitution. It provides the exact amount of tokens lost in the attack. Blue Pill holders will not have access to the new Charisma token, giving their existing CHA tokens no trade value until liquidity is restored for the STX-sCHA and STX-wCHA Velar pools. The more users choose the Blue Pill, the longer it will take for Charisma to recover.',
    },
    {
      question: 'How does the vesting schedule work?',
      answer:
        'The vesting schedule for the Red Pill option follows a block-based release model. Initially, tokens can be wrapped into the new Charisma token every 10 blocks, but after the Nakamoto upgrade, blocks-per-tx will be adjusted to 100, meaning you can wrap tokens every 8-17 minutes depending on block times. Like iQC, it is first-come first-serve, so the earlier you wrap your tokens, the earlier you can swap them for other tokens. If CHA price has stabilized, the community can vote to reduce blocks-per-tx to speed up the release of tokens.',
    },
    {
      question: 'What is the new Charisma token?',
      answer:
        'The new Charisma token will be exclusively available to Red Pill holders and is designed to restore liquidity while preventing large sell-offs. It will be immediately listed on a DEX and funded with liquidity to ensure all Red Pill holders have access to trading liquidity for their Charisma tokens. It will follow a vesting schedule and iQC-like liquidity controls to ensure fair access and market stability. This will serve as the single primary trading token for Charisma moving forward.',
    },
    {
      question: 'How is the recovery timeline structured?',
      answer:
        'Tokens will be dispensed immediately after the burn and normalization. Red Pill holders will follow the vesting schedule, with liquidity flowing gradually into the market over the next few months. Blue Pill holders will have immediate access to their WELSH and ROO tokens, but lose the ability to swap their CHA tokens until there is more STX liquidity available to supply to STX-sCHA or STX-wCHA LPs.',
    },
    {
      question: 'Are there min and max values for blocks-per-tx and max-liquidity-flow?',
      answer:
        'Yes, there are min and max values for both blocks-per-tx and max-liquidity-flow. The min value for blocks-per-tx is 1 block, and the max is 1,000,000 blocks. For max-liquidity-flow, the min value is 1 token, and the max is 10,000 tokens. These parameters ensure controlled liquidity flow and prevent scenarios where a large amount of CHA tokens and dumped on the market. By enforcing these liquidity controls, the system prevents sudden sell-offs and market instability. This doubles as a security measure to protect the ecosystem from future attacks.',
    },
  ];

  return (
    <div className="sm:p-8">
      <div className="max-w-4xl p-6 mx-auto rounded-lg shadow-lg bg-white/90">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="pb-4 border-b border-gray-300">
              <button
                className="w-full text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700">
                    {faq.question}
                  </h3>
                  <span className="text-gray-500">
                    {openFAQ === index ? '-' : '+'}
                  </span>
                </div>
              </button>
              {openFAQ === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};