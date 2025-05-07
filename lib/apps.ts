export interface AppInfo {
    /** Human-friendly name of the sub-application */
    title: string;
    /** Short description – one or two sentences */
    description: string;
    /** Absolute URL to the app (will open in a new tab) */
    href: string;
    /** Path to a representative image/icon in the public folder – optional. */
    image?: string;
    /** Whether the app is a product or a service */
    isProduct?: boolean;
}

/**
 * Directory of Charisma sub-applications visible on the landing page.
 *
 * To add a new entry simply append to this array. No additional code changes are required.
 */
export const APPS: AppInfo[] = [
    // {
    //     title: 'Blog',
    //     description: 'News, updates and deep-dives from the Charisma ecosystem.',
    //     href: 'https://blog.charisma.rocks',
    // },
    // {
    //     title: 'Admin',
    //     description: 'Internal admin dashboard for managing Charisma services.',
    //     href: 'https://admin.charisma.rocks',
    // },
    {
        title: 'Charisma Invest',
        description: 'Put your capital to work with yield-generating DeFi strategies.',
        href: 'https://invest.charisma.rocks',
        isProduct: true,
    },
    // {
    //     title: 'Meme Roulette',
    //     description: 'A playful on-chain meme roulette experience — spin & win!',
    //     href: 'https://meme-roulette.charisma.rocks',
    // },
    {
        title: 'Metadata Hosting',
        description: 'Host your SIP-10 metadata on Charisma.',
        href: 'https://metadata.charisma.rocks',
        isProduct: true,
    },
    {
        title: 'Token Data API',
        description: 'Explore and manage tokens on Charisma.',
        href: 'https://tokens.charisma.rocks',
    },
    {
        title: 'Blaze Protocol',
        description: 'Test out and explore use cases for the Blaze Protocol.',
        href: 'https://blaze.charisma.rocks',
    },
    {
        title: 'Charisma Swap',
        description: 'Simple and secure SIP-10 token swaps on Charisma.',
        href: 'https://swap.charisma.rocks',
        isProduct: true,
    },
    {
        title: 'Charisma Launchpad',
        description: 'Launch Stacks smart contracts on Charisma.',
        href: 'https://launchpad.charisma.rocks',
        isProduct: true,
    },
    {
        title: 'Contract Search',
        description: 'Search & explore smart contracts deployed on Stacks.',
        href: 'https://charisma-contract-search.vercel.app/',
    },
]; 