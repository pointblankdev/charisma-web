
export const SITE_URL = 'https://charisma.rocks';
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(SITE_URL).origin;
export const TWITTER_USER_NAME = 'CharismaBTC';
export const BRAND_NAME = 'Charisma';
export const SITE_NAME_MULTILINE = ['Charisma'];
export const SITE_NAME = 'Charisma';
export const META_DESCRIPTION =
  'You decide the tokenomics, governance, and future of Charisma. Join the community-run DAO.';
export const SITE_DESCRIPTION =
  'You decide the tokenomics, governance, and future of Charisma. Join the community-run DAO.';
export const DATE = '31 October 2023';
export const SHORT_DATE = 'Jan 1 - 9:00am PST';
export const FULL_DATE = 'Jan 1st 9am Pacific Time (GMT-7)';
export const TWEET_TEXT = META_DESCRIPTION;
export const COOKIE = 'user-id';

export const BITCOIN_LEARN_MORE_URL = 'https://bitcoin.org/en/';
export const STACKS_LEARN_MORE_URL = 'https://stacks.org/';

export const NAVIGATION = [
  // {
  //   name: 'Quests',
  //   route: '/quests'
  // },
  {
    name: 'Apps',
    route: '/apps'
  },
  // {
  //   name: 'Swap',
  //   route: '/swap'
  // },
  {
    name: 'Liquid Staking',
    route: '/liquid-staking'
  },
  {
    name: 'Crafting',
    route: '/crafting'
  },
  // {
  //   name: 'Tokenomics',
  //   route: '/tokenomics'
  // },
  // {
  //   name: 'Governance',
  //   route: '/governance'
  // },
  // {
  //   name: 'Guilds',
  //   route: '/guilds'
  // },
];

export type TicketGenerationState = 'default' | 'loading';
