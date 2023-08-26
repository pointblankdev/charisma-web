import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { GetStaticProps } from 'next';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';


export default function CreateQuest({ }: Props) {
    const meta = {
        title: 'Charisma | Create a Quest',
        description: META_DESCRIPTION
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:container sm:mx-auto sm:py-10 space-y-4">
                    <section className='space-y-2'>
                        <div>Select Quest Type</div>
                        <Card className='min-h-[200px]'></Card>
                    </section>
                    <section className='space-y-2'>
                        <div>Choose Participants</div>
                        <Card className='min-h-[200px]'></Card>
                    </section>
                    <section className='space-y-2'>
                        <div>Choose & Allocate Reward</div>
                        <Card className='min-h-[200px]'></Card>
                    </section>
                    <section className='space-y-2'>
                        <div>Set Duration</div>
                        <Card className='min-h-[200px]'></Card>
                    </section>
                    <Button>Deploy Quest</Button>
                </div>
            </Layout>
        </Page>
    );
}

type Props = {
    data: any;
};

export const getStaticProps: GetStaticProps<Props> = () => {

    return {
        props: {
            data: {
            }
        },
        revalidate: 60
    };
};
