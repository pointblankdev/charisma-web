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
import Link from 'next/link';
import { Label } from "@components/ui/label"
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group"



export default function CreateQuest({ }: Props) {
    const meta = {
        title: 'Charisma | Create a Quest',
        description: META_DESCRIPTION
    };

    const form = useForm()
    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="m-2 sm:mx-auto sm:py-10 space-y-4">
                    <Form {...form}>
                        <section className='space-y-2'>
                            <div>Select Quest Type</div>
                            <Card className='min-h-[200px] px-1'>
                                <div className='flex'>
                                    <FormItem className='p-2'>
                                        <FormLabel>Network</FormLabel>
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
                                        {/* <FormDescription>This is your public display name.</FormDescription> */}
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem className='p-2'>
                                        <FormLabel>Project</FormLabel>
                                        <FormControl>
                                            <Select>
                                                <SelectTrigger className="w-[160px]">
                                                    <SelectValue placeholder="Select a project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="charisma">Charisma</SelectItem>
                                                    <SelectItem value="alex-lab" disabled>ALEX Lab</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        {/* <FormDescription>This is your public display name.</FormDescription> */}
                                        <FormMessage />
                                    </FormItem>
                                </div>

                                <FormItem className='p-2'>
                                    <FormLabel>Action</FormLabel>
                                    <FormControl>
                                        <Select>
                                            <SelectTrigger className="w-[336px]">
                                                <SelectValue placeholder="Select an action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="claim">Claim</SelectItem>
                                                <SelectItem value="vote" disabled>Vote</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                <FormDescription className='p-2'>
                                    Don't see your project? Check our docs to get it added.
                                </FormDescription>
                            </Card>
                        </section>
                        <section className='space-y-2'>
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
                        </section>
                        <section className='space-y-2'>
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
                                        {/* <FormDescription>This is your public display name.</FormDescription> */}
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
                        </section>
                        <section className='space-y-2'>
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
                        </section>
                        <Button className='w-full'>Deploy Quest</Button>
                    </Form>
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
