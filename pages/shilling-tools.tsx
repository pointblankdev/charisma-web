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

export default function ShillingTools({ legends }: { legends: any }) {

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Shilling Tools</h1>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Tweet Builder</h2>
                    <TweetBuilder initialLegends={legends} />
                </div>
            </div>
        </div>
    );
}
