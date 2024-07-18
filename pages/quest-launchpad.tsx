import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import questExample from '@public/quest-example.png'
import Image from 'next/image';
import questHelper from '@public/governance/quest-helper.png'
import Link from 'next/link';


export default function QuestLaunchpad() {
    const meta = {
        title: 'Charisma | Quest Launchpad',
        description: 'Get paid to integrate your project into the Charisma ecosystem.',
        image: '/celebration-2.png'
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="sm:container sm:mx-auto sm:py-10 space-y-6 m-2">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-normal text-secondary">Quest Launchpad</h1>
                        <p className="text-muted-foreground text-base">
                            Get paid to integrate your project into the Charisma ecosystem.
                        </p>
                    </div>

                    <hr />

                    <section className='flex flex-col sm:flex-row w-full justify-around items-center space-y-8 sm:space-y-0'>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-semibold tracking-tight text-secondary">Here's How it Works</h2>
                            <div className="space-y-4">
                                <p className='max-w-prose text-muted/90 font-light text-lg leading-snug'>
                                    Leverage the powerful Charisma protocol to enable users to:
                                </p>
                                <ul className='list-inside list-disc sm:text-md font-fine text-primary-foreground/60 space-y-2'>
                                    <li className='leading-tight'>Mint or buy from your NFT collections</li>
                                    <li className='leading-tight'>Purchase your tokens in a pre-sale</li>
                                    <li className='leading-tight'>Pay the cost to experience a game or event</li>
                                    <li className='leading-tight'>Do something entirely different</li>
                                </ul>
                                <p className='max-w-prose text-muted/90 font-light text-lg leading-snug'>
                                    We'll handle the smart contract stuff, all you need to do is let us know how you want the general user experience to go, and provide all the nessesary details.
                                </p>
                                <div className='py-4'>
                                    <h2 className="text-2xl font-medium tracking-tight text-secondary py-2">Payment Model</h2>
                                    <p className='max-w-prose text-muted/90 font-light text-lg leading-snug'>
                                        Instead of charging users for your product or service, you'll automatically recieve Charisma tokens based on how much creature "energy" is spent.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='max-w-xl flex justify-center w-full flex-col'>
                            <h3 className='m-2 text-muted-foreground text-xs'>Example Quest Card</h3>
                            <Image src={questExample} className='w-full' alt='quest-example' />
                        </div>
                    </section>

                    <hr />

                    <section className='flex sm:flex-row w-full justify-around items-center sm:space-y-0 flex-col-reverse'>
                        <div className='max-w-xl flex justify-center w-full flex-col mt-4 sm:mt-0'>
                            <Image src={questHelper} className='w-full aspect-square object-cover rounded border' alt='quest-helper' />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-semibold tracking-tight text-secondary">How to get Started</h2>
                            <div className="space-y-2">
                                <p className='max-w-prose text-muted font-light text-lg leading-snug'>
                                    Join the Discord at the link below and contact an admin- Let's cook!
                                </p>
                                <div>
                                    <Link href="https://discord.gg/xJbts4PxcR">Charisma Discord Invite Link</Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        </Page >
    );
}