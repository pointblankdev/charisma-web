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

export const SITE_URL = 'https://charisma.rocks';
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(SITE_URL).origin;
export const TWITTER_USER_NAME = 'lordrozar';
export const BRAND_NAME = 'Charisma';
export const SITE_NAME_MULTILINE = ['Charisma'];
export const SITE_NAME = 'Charisma';
export const META_DESCRIPTION =
  'Charisma is a new digital asset in the Stacks DeFi ecosystem, snatching power from the clutches of the centralized few and returning it to the true heroes of our tale - the daring degens. We\'re setting the stage for a new era of economic revolution, and you\'re part of it. Join us.';
export const SITE_DESCRIPTION =
  'The 0% premine, DAO run, number-go-up tokenomics you\'ve been waiting for.';
export const DATE = '31 October 2023';
export const SHORT_DATE = 'Jan 1 - 9:00am PST';
export const FULL_DATE = 'Jan 1st 9am Pacific Time (GMT-7)';
export const TWEET_TEXT = META_DESCRIPTION;
export const COOKIE = 'user-id';

// Remove process.env.NEXT_PUBLIC_... below and replace them with
// strings containing your own privacy policy URL and copyright holder name
export const LEGAL_URL = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;
export const COPYRIGHT_HOLDER = process.env.NEXT_PUBLIC_COPYRIGHT_HOLDER;

export const CODE_OF_CONDUCT = 'https://bitcoin.org/en/';
export const REPO = 'https://stacks.org/';
export const SAMPLE_TICKET_NUMBER = 1234;
export const NAVIGATION = [
  {
    name: 'About',
    route: '/about'
  },
  {
    name: 'Faucet',
    route: '/faucet'
  },
  {
    name: 'Stake',
    route: '/stake'
  },
  {
    name: 'Pool',
    route: '/pool'
  },
  {
    name: 'Farm',
    route: '/farm'
  },
  {
    name: 'Jobs',
    route: '/jobs'
  }
];

export type TicketGenerationState = 'default' | 'loading';
