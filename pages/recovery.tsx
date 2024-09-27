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
          <p className='p-8 mx-auto my-[100vh] text-2xl font-light text-center max-w-prose'>"You take the blue pill - the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill - you stay in Wonderland and I show you how deep the rabbit hole goes."</p>
          <RecoveryClaim />
          <FAQSection />
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
    <div className='flex w-full p-24 my-[100vh]'>
      <div className='flex flex-col items-center w-full space-y-4'>
        <Image src={redPill} alt='Red Pill' width={250} height={250} />
        <Button disabled onClick={() => makeChoice(true)} size={'sm'} className='text-sm w-36 hover:bg-[#ffffffee] hover:text-primary'>Select Red Pill</Button>
      </div>
      <div className='flex flex-col items-center w-full space-y-4'>
        <Image src={bluePill} alt='Blue Pill' width={250} height={250} />
        <Button disabled onClick={() => makeChoice(false)} size={'sm'} className='text-sm w-36 hover:bg-[#ffffffee] hover:text-blue-800 bg-blue-800'>Select Blue Pill</Button>
      </div>
    </div>
  );
};

const CharismaRecoveryPlan = () => {
  return (
    <div className="p-8">
      <div className="max-w-5xl p-6 mx-auto space-y-8 rounded-lg shadow-lg bg-white/90">
        {/* Introduction */}
        <section className="mb-8">
          <h1 className="mb-8 text-4xl font-bold text-gray-800">
            Charisma Recovery Plan: Decision Guide
          </h1>
          <p className="leading-relaxed text-gray-700">
            During an governance attack on Charisma, key pools such as <strong>WELSH</strong>, <strong>ROO</strong>, and <strong>sCHA</strong>, along with the <strong>Charisma treasury containing STX</strong>, were compromised. The attackers minted 20 billion CHA tokens and used them to drain the <strong>STX-sCHA</strong> and <strong>STX-wCHA</strong> Velar Liquidity Pools, effectively stealing all <strong>STX</strong>, <strong>sCHA</strong>, and <strong>wCHA</strong> added by the Charisma team and others.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            To address this, Charisma is offering two recovery options: the <strong>Red Pill</strong> and the <strong>Blue Pill</strong>. These options determine how users will be compensated for their lost tokens and provide different paths forward depending on each user's choice. After the token burn and supply normalization, as well as 90% of users having made their recovery choice, the recovery process will begin.
          </p>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Red Pill vs Blue Pill */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Red Pill vs. Blue Pill: The Recovery Choices</h2>

          {/* Red Pill */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-bold text-red-500">🔴 Red Pill: Support Charisma's Ecosystem Recovery</h3>
            <ul className="ml-6 leading-relaxed text-gray-700 list-disc">
              <li>
                <strong>150% Repayment:</strong> Red Pill holders will receive <strong>150% of their lost tokens' USD value</strong>, repaid in CHA tokens.
              </li>
              <li>
                <strong>Vesting Wrapping:</strong> Tokens will be received after CHA supply normalization, with a <strong>custom vesting schedule</strong> that will allowing you to wrap tokens over the next 12 weeks for trading.
              </li>
              <li>
                <strong>Restored Liquidity:</strong> Only Red Pill holders will be able to wrap their CHA and swap tokens, offering a stabilized swap price. All available STX liquidity will be added to LP for this token to ensure all Red Pill holders have access to swap into or out of the token at stable prices.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-700">
              Red Pill holders will receive CHA tokens immediately. Wrapping into the new Charisma token will follow a custom block-based vesting schedule, after which you can swap them for other tokens whenever desired.
            </p>
          </div>

          {/* Blue Pill */}
          <div>
            <h3 className="mb-2 text-lg font-bold text-blue-500">🔵 Blue Pill: Immediate Restitution</h3>
            <ul className="ml-6 leading-relaxed text-gray-700 list-disc">
              <li>
                <strong>Full Token Return:</strong> Receive <strong>the amount of tokens lost</strong> during the attack, in the form of WELSH, ROO, and CHA.
              </li>
              <li>
                <strong>No Vesting Period:</strong> Blue Pill holders will also receive their tokens after CHA supply normalization.
              </li>
              <li>
                <strong>No Access to Swaps:</strong> Although Blue Pill holders will receive CHA tokens back, they will not have access to wrap them into the new Charisma token, which means they will <strong>not be able to sell</strong> their CHA tokens in the new liquidity pools.
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-gray-700">
              Blue Pill holders will be repaid in the same tokens they lost, such as WELSH, ROO, and all CHA-related tokens. However, without access to the Charisma token liquidity pool, CHA-related tokens will not be able to be sold.
            </p>
          </div>
        </section>

        <hr className="border-t border-gray-300" />

        {/* New Charisma Token */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">New Charisma Token and Listing Strategy</h2>
          <p className="leading-relaxed text-gray-700">
            A critical part of the <strong>Red Pill option</strong> is the creation and listing of a <strong>new Charisma token</strong>, exclusive to Red Pill holders, designed to restore liquidity and stabilize the market.
          </p>

          <ul className="mt-4 ml-6 leading-relaxed text-gray-700 list-disc">
            <li>
              <strong>Red Pill Exclusive:</strong> Only Red Pill holders can wrap their CHA tokens into the new token, ensuring token price stability.
            </li>
            <li>
              <strong>Vesting Schedule:</strong> A <strong>block-based vesting schedule</strong> will control liquidity flow. Post-Nakamoto, <strong>blocks-per-tx</strong> will increase to <strong>100 blocks</strong>, releasing tokens approximately every <strong>8-17 minutes</strong>.
            </li>
            <li>
              <strong>Liquidity Management:</strong> The new token will use iQC-like liquidity controls to prevent large sell-offs and maintain stability.
            </li>
          </ul>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Recovery Timeline */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Recovery Timeline</h2>
          <ul className="ml-6 leading-relaxed text-gray-700 list-disc">
            <li>
              <strong>Immediate Token Dispensation:</strong> CHA tokens will be provided immediately after the burn and normalization.
            </li>
            <li>
              <strong>Planned Adjustment:</strong> After the Nakamoto upgrade, blocks-per-tx will increase from <strong>10 to 100</strong> blocks to account for faster block times.
            </li>
            <li>
              <strong>Daily Liquidity Flow:</strong>
              <ul className="ml-6 list-disc">
                <li><strong>Pre-Nakamoto:</strong> ~$216/day at 10 blocks-per-tx</li>
                <li><strong>Post-Nakamoto:</strong> ~$1,260-$2,520/day with 100 blocks-per-tx</li>
              </ul>
            </li>
          </ul>
          <p className="mt-4 leading-relaxed text-gray-700">
            At this vesting rate, it should take around 6 to 12 weeks for liquidity pool TVL to return to previous levels.
          </p>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Final Thoughts */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Final Thoughts</h2>
          <p className="leading-relaxed text-gray-700">
            The <strong>Red Pill</strong> offers greater rewards and exclusive access to the new Charisma token, positioning you for long-term growth while supporting Charisma's recovery. On the other hand, the <strong>Blue Pill</strong> provides immediate restitution if you prefer a simpler recovery path, while sacrificing your ability to swap Charisma tokens until liquidity is restored to all pools.
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
    <div className="p-8">
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