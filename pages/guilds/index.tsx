import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { DataTable } from '@components/guilds-table/data-table';
import { columns } from '@components/guilds-table/columns';
import { getAllGuilds } from '@lib/cms-providers/dato';

type Props = {
    data: any[];
};

export default function Governance({ data }: Props) {
    const meta = {
        title: 'Charisma | Guilds',
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

export const getStaticProps: GetStaticProps<Props> = async () => {

    const guilds = await getAllGuilds()

    return {
        props: {
            data: guilds
        },
        revalidate: 600
    };
};