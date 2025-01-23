import Page from '@components/page';
import { TweetBuilder } from '@components/shilling/TweetBuilder';
import { kv } from '@vercel/kv';

export async function getStaticProps() {
    const handles: string[] = await kv.get('twitter-legends') || [];

    const legends = handles.map((handle: string) => ({
        handle,
    }));

    return {
        props: {
            legends
        },
        revalidate: 60 // Revalidate every minute
    };
}

export default function MemeTools({ legends }: { legends: any }) {
    const meta = {
        title: 'Charisma | Meme Tools',
        description: 'Meme tools for the community.',
        image: 'https://charisma.rocks/governance/gorge1.png'
    };

    return (
        <Page meta={meta} fullViewport>
            <div className="container mx-auto p-6 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Meme Tools</h1>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Tweet Builder</h2>
                        <TweetBuilder initialLegends={legends} />
                    </div>
                </div>
            </div>
        </Page>
    );
}
