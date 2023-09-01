import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { DataTable } from '@components/guilds-table/data-table';
import { columns } from '@components/guilds-table/columns';
import charismaGuildLogo from '@public/charisma.png'
import alexlabGuildLogo from '@public/ALEX_Token.webp'
import uwuLogo from '@public/uwuLogo.png'
import nomeLogo from '@public/nomeLogo.jpg'
import xverseLogo from '@public/xverseLogo.png'
import liquidiumLogo from '@public/liquidiumLogo.jpeg'
import unisatLogo from '@public/unisatLogo.jpg'

type Props = {
    data: any[];
};

export default function Governance({ data }: Props) {
    const meta = {
        title: 'Charisma | Platform Governance',
        description: META_DESCRIPTION
    };
    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10">
                    <div className='flex justify-between items-end'>
                        <h1 className='text-xl text-left mt-8 mb-2 text-gray-200'>Guilds</h1>
                        <Link href='https://docs.charisma.rocks/for-project-teams/submitting-projects' target='_blank'><Button variant={'link'} className='my-2 px-0'>Want to list your project?</Button></Link>
                    </div>
                    <DataTable columns={columns} data={data} />
                </div>
            </Layout>
        </Page>
    );
}

export const getStaticProps: GetStaticProps<Props> = () => {

    const guilds = [
        {
            id: 0,
            url: "https://charisma.rocks",
            logo: charismaGuildLogo,
            alt: 'Charisma Guild Logo',
            name: 'Charisma',
            description: 'Charisma is a decentralized autonomous organization (DAO) that governs the Charisma Quest-to-Earn protocol.',
            quests: 1,
        },
        {
            id: 1,
            url: "https://alexlab.co",
            logo: alexlabGuildLogo,
            alt: 'ALEX Guild Logo',
            name: 'ALEX Lab',
            description: 'ALEX Labis a non-profit organization supporting the governance and growth of the ALEX DeFi protocol.',
            quests: 2,
        },
        {
            id: 2,
            url: "https://uwu.cash",
            logo: uwuLogo,
            alt: 'UWU Guild Logo',
            name: 'UWU',
            description: 'A decentralized, zero-interest loan platform on Stacks, secured by Bitcoin, using STX-collateralized stablecoin UWU Cash.',
            quests: 1,
        },
        {
            id: 3,
            url: "https://nome.wtf",
            logo: nomeLogo,
            alt: 'NōME Guild Logo',
            name: 'NōME',
            description: 'NōME, established in 2016 in Stockholm, merges sustainable luxury design with pioneering crypto art inspired by Bitcoin Ordinals.',
            quests: 1,
        },
        {
            id: 4,
            url: "https://xverse.app",
            logo: xverseLogo,
            alt: 'Xverse Guild Logo',
            name: 'Xverse',
            description: 'A multi-platform Bitcoin and Stacks wallet with Web3 integration, NFT support, and Lightning transactions.',
            quests: 1,
        },
        {
            id: 5,
            url: "https://liquidium.fi",
            logo: liquidiumLogo,
            alt: 'Liquiduim Guild Logo',
            name: 'Liquiduim',
            description: 'Liquidium offers decentralized, trustless P2P lending, letting users borrow native BTC using any Ordinal as collateral.',
            quests: 1,
        },
        {
            id: 6,
            url: "https://unisat.io",
            logo: unisatLogo,
            alt: 'Unisat Guild Logo',
            name: 'Unisat',
            description: 'UniSat Wallet is an open-source Chrome extension for Bitcoin Ordinals & BRC-20 decentralized finance.',
            quests: 1,
        },
    ];

    return {
        props: {
            data: guilds
        },
        revalidate: 60
    };
};