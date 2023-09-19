import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { GetStaticProps } from 'next';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { useForm } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select"
import { Label } from "@components/ui/label"
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group"
import Image from 'next/image';
import { getAllGuilds, getAllNetworks } from '@lib/cms-providers/dato';
import { Textarea } from "@components/ui/textarea"
import { createQuestDraft } from '@lib/user-api';
import { useToast } from "@components/ui/use-toast"
import SettingsLayout from '../layout';

type Props = {
    guilds: any[];
    networks: any[];
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {

    console.log(params)

    const guilds = await getAllGuilds()
    const networks = await getAllNetworks()

    return {
        props: {
            guilds,
            networks
        },
        revalidate: 60
    };
};

export default function CreateQuest({ guilds, networks }: Props) {
    const meta = {
        title: 'Charisma | Create a Quest',
        description: META_DESCRIPTION
    };

    const form = useForm()
    const { toast } = useToast()

    const submitQuest = async () => {
        const quest = form.getValues()
        quest.objectives = JSON.stringify([
            {
                "text": quest.objectives,
                "metric": "0/1"
            }
        ])
        quest.description = JSON.stringify(quest.description?.split('\n'))
        const resp = await createQuestDraft(quest)
        console.log(resp)

        let title = 'Quest Submitted'
        let description = 'Your quest has been submitted for review. You will be notified when it is approved.'
        let variant = 'default' as any
        if (resp.status !== 200) {
            title = 'Error Submitting Quest'
            description = 'There was an error submitting your quest. Please check your quest details and try again.'
            variant = 'destructive'
        }
        toast({ title, description, variant })
    }

    return (
        <SettingsLayout>

            <Form {...form}>
                <div className="m-2 sm:mx-auto sm:py-10 gap-4 grid grid-cols-1 md:grid-cols-2">
                    <section className='space-y-2'>
                        <div>Select Quest Mechanics</div>
                        <Card className='min-h-[200px] px-1'>
                            <div className='flex'>
                                <FormField
                                    control={form.control}
                                    name="network"
                                    render={({ field }) => (
                                        <FormItem className='p-2'>
                                            <FormLabel>Network</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-[160px]">
                                                        <SelectValue placeholder="Select a network" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {networks.map((network: any) => {
                                                            return (
                                                                <SelectItem value={network.id} key={network.id}>
                                                                    <div className='flex space-x-2'>
                                                                        <Image src={network.icon.url} width={24} height={24} alt={'Network logo'} className="rounded-full" />
                                                                        <div>{network.name}</div>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guild"
                                    render={({ field }) => (
                                        <FormItem className='p-2'>
                                            <FormLabel>Guild</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-[160px]">
                                                        <SelectValue placeholder="Select a guild" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {guilds.map((guild: any) => {
                                                            return (
                                                                <SelectItem value={guild.id} key={guild.id}>
                                                                    <div className='flex space-x-2'>
                                                                        <Image src={guild.logo.url} width={24} height={24} alt={'Guild logo'} className="rounded-full" />
                                                                        <div>{guild.name}</div>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='flex'>
                                <FormField
                                    control={form.control}
                                    name="contract_identifier"
                                    render={({ field }) => (
                                        <FormItem className='p-2 w-[180px]'>
                                            <FormLabel>Contract Identifier</FormLabel>
                                            <FormControl>
                                                <Input placeholder="SP2Z...Z55KS.faucet" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem className='p-2 w-[170px]'>
                                            <FormLabel>Method</FormLabel>
                                            <FormControl>
                                                <Input placeholder="claim, mint, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="objectives"
                                render={({ field }) => (
                                    <FormItem className='p-2'>
                                        <FormLabel>Objective</FormLabel>
                                        <FormControl>
                                            <Input placeholder="What's the quest goal? (e.g. Claim from the faucet)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormDescription className='p-2'>
                                Don't see your project? Check our docs for getting listed.
                            </FormDescription>
                        </Card>
                    </section>
                    <section className='space-y-2'>
                        <div>Create Quest Lore</div>
                        <Card className='min-h-[200px] px-1'>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className='p-2'>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter a title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subtitle"
                                render={({ field }) => (
                                    <FormItem className='p-2'>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl>
                                            <Input placeholder="One sentence description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className='p-2'>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Design the questline' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Card>
                    </section>
                    {/* <section className='space-y-2'>
                            <div>Choose Participants</div>
                            <Card className='px-1'>
                            <FormItem className='p-2'>
                            <RadioGroup defaultValue="everyone">
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="everyone" id="everyone" />
                            <Label htmlFor="everyone">Everyone</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="charisma-holders" id="charisma-holders" />
                                            <Label htmlFor="charisma-holders">Charisma Holders</Label>
                                            </div>
                                            </RadioGroup>
                                            </FormItem>
                                            </Card>
                                        </section> */}
                    {/* <section className='space-y-2'>
                            <div>Choose & Allocate Reward</div>
                            <Card className='px-1'>
                            <div className='flex'>
                            <FormItem className='p-2'>
                            <FormLabel>Reward Network</FormLabel>
                            <FormControl>
                            <Select>
                            <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="stacks">Stacks</SelectItem>
                            <SelectItem value="bitcoin" disabled>Bitcoin</SelectItem>
                            </SelectContent>
                            </Select>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                            <FormItem className='p-2'>
                            <FormLabel>Reward Type</FormLabel>
                            <RadioGroup defaultValue="option-one">
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="option-one" id="option-one" />
                            <Label htmlFor="option-one">Token (SIP-10)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="option-two" id="option-two" />
                            <Label htmlFor="option-two">NFT (SIP-9)</Label>
                            </div>
                            </RadioGroup>
                            </FormItem>
                                </div>
                                <div className='flex'>
                                <FormItem className='p-2'>
                                <FormLabel>Max Completions</FormLabel>
                                <Input placeholder="Select an amount" className='w-[160px]' />
                                </FormItem>
                                <FormItem className='p-2'>
                                <FormLabel>Reward Amount</FormLabel>
                                <Input placeholder="Custom amount" className='w-[160px]' />
                                </FormItem>
                                </div>
                                
                                <FormDescription className='p-2'>
                                Total Cost of Quest: 0.000000 STX
                                </FormDescription>
                                </Card>
                            </section> */}
                    {/* <section className='space-y-2'>
                            <div>Set Duration</div>
                            <Card className='px-1'>
                            <div className='flex'>
                            <FormItem className='p-2'>
                            <FormLabel>Start Block</FormLabel>
                            <Input placeholder="Select a block" className='w-[160px]' />
                            </FormItem>
                            <FormItem className='p-2'>
                            <FormLabel>End Block</FormLabel>
                            <Input placeholder="Select a block" className='w-[160px]' />
                            </FormItem>
                            </div>
                            
                            <FormDescription className='p-2'>
                                    Quest will start Friday 9 AM UTC and last 72 hours.
                                    </FormDescription>
                                    
                                    </Card>
                                </section> */}
                </div>
                <Button className='m-2 self-center' onClick={submitQuest}>Submit Quest for Preview ✨</Button>
            </Form>
        </SettingsLayout>
    );
}

export const getStaticPaths = () => {
    return {
        paths: [
            { params: { id: "123" } },
        ],
        fallback: true
    };
}