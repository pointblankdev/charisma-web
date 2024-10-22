
export const SITE_URL = 'https://charisma.rocks';
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(SITE_URL).origin;
export const TWITTER_USER_NAME = 'CharismaBTC';
export const BRAND_NAME = 'Charisma';
export const SITE_NAME_MULTILINE = ['Charisma'];
export const SITE_NAME = 'Charisma';
export const META_DESCRIPTION =
  'The next-generation DeFi protocol on Stacks.';
export const FUNNY_QUOTE = `"Spellbinding" — The New York Times`;
export const DATE = '31 October 2023';
export const SHORT_DATE = 'Jan 1 - 9:00am PST';
export const FULL_DATE = 'Jan 1st 9am Pacific Time (GMT-7)';
export const TWEET_TEXT = META_DESCRIPTION;
export const COOKIE = 'user-id';

export const BITCOIN_LEARN_MORE_URL = 'https://bitcoin.org/en/';
export const STACKS_LEARN_MORE_URL = 'https://stacks.org/';

const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const API_URL = VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3000';

export const NAVIGATION = [
  {
    name: 'Swap',
    route: '/swap'
  },
  {
    name: 'Pools',
    route: '/pools'
  },
  {
    name: 'Explore',
    route: '/explore'
  },
  {
    name: 'Recovery',
    route: '/recovery'
  },
];

export type TicketGenerationState = 'default' | 'loading';
