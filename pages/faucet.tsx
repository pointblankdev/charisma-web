/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import IconLogo from '@components/icons/icon-logo';
import ClaimFaucetButton from '@components/faucet/claim';
import Image from 'next/image';

export default function Conf() {
  const meta = {
    title: 'Charisma | Faucet',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="mx-auto py-10 max-w-xl justify-center flex-col text-5xl font-thin flex container text-lg">
          <Image alt='Dungeon Scene' src="/dungeon-scene.png" width="1080" height="605" />
          <h1 className="text-2xl font-bold my-4">Charisma Token Faucet </h1>
          <h1 className="text-lg font-bold mb-2">How It Works</h1>

          <p className="mb-8">
            The Charisma Token Faucet is a contract (a piece of blockchain code) that automatically releases ("drips") Charisma tokens over time, a process similar to how a real-world faucet drips water. This process is also known as "token minting". The rate of these drips, i.e., the number of tokens released per Bitcoin block, is called the "drip amount".
          </p>

          <h2 className="text-lg font-bold mb-2">Interacting with the faucet:</h2>

          <ul className="list-disc pl-5 mb-4 text-md space-y-2">
            <li>
              <b>Claim Tokens</b>: As a user, you can claim tokens. The amount you'll receive is determined by multiplying the drip amount by the number of blocks that have passed since the last claim was made. For example, if the drip amount is 2 tokens per block, and 10 blocks have passed since the last claim, you could claim 20 tokens. However, this can only happen if there are enough tokens available in the faucet at that moment.
            </li>
            <li>
              <b>Check Availability</b>: You can check the current drip amount (i.e., how many tokens are released per block) and also see when the last claim was made (this is expressed as a 'block height' - a specific block in the blockchain).
            </li>
          </ul>

          <p className="mb-4">
            Please note that you can't change the drip amount yourself - this is something only the DAO (Decentralized Autonomous Organization) or authorized extensions can do. This measure is in place to ensure that the faucet isn't misused and that the token issuance process remains under control.
          </p>

          <p className="mb-4">
            If you try to claim tokens and there aren't any available, you'll see an error message. No fees are charged when the faucet is empty, and you can always try again the next block.
          </p>

          <p className="mb-4">
            The goal of the Charisma Token Faucet is to maintain a slow, steady and controlled issuance of tokens.
          </p>
          <ClaimFaucetButton />
        </div>
      </Layout>
    </Page>
  );
}
