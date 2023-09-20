import { GetStaticProps, Metadata } from "next"
import Image from "next/image"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@components/ui/tabs"
import Layout from "@components/layout"
import { getQuestById } from "@lib/db-providers/dato"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getAllNetworks } from "@lib/cms-providers/dato"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { updateQuest } from "@lib/user-api"

const questFormSchema = z.object({
  id: z.string(),
  contract_identifier: z.string(),
  method: z.string(),
  activation: z.coerce.number(),
  expiration: z.coerce.number(),
  maxcompletions: z.coerce.number(),
  reward_stx: z.coerce.number(),
  // reward_charisma: z.coerce.number(),
  network: z.string(),
})

type QuestFormValues = z.infer<typeof questFormSchema>

export default function QuestEditor({ quest, networks }: any) {

  // let questDescription;
  // try {
  //   questDescription = JSON.parse(quest.description).join('\n\n')
  // } catch (error) { }

  const defaultValues: Partial<QuestFormValues> = {
    ...quest,
    // description: questDescription,
    reward_stx: quest?.reward_stx || 0,
    maxcompletions: quest?.maxcompletions || 0,
  }


  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const onSubmit = async (data: QuestFormValues) => {
    const response = await updateQuest(data)
    console.log(response)
  };


  return (
    <Layout>
      <div className="my-4 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="Objectives" className="flex-1">
              <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                <div className="flex justify-between w-full">
                  <h2 className="text-lg font-semibold whitespace-nowrap">{quest?.title}</h2>
                  <div className="grid gap-2">
                    <TabsList>
                      <TabsTrigger value="Objectives">
                        <span className="sr-only">Objectives</span>
                        Objectives
                      </TabsTrigger>
                      <TabsTrigger value="Rewards">
                        <span className="sr-only">Rewards</span>
                        Rewards
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
              <Separator />
              <TabsContent value="Objectives" className="mt-0 border-0 p-0">
                <div className="container my-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network</FormLabel>
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            <SelectContent>
                              {networks?.map((network: any) => {
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
                    name="contract_identifier"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Contract Identifier</FormLabel>
                        <FormControl>
                          <Input placeholder={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Method</FormLabel>
                        <FormControl>
                          <Input placeholder={'claim'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activation"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Activation Block</FormLabel>
                        <FormControl>
                          <Input placeholder={'Block height the quest will start'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiration"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Expiration Block</FormLabel>
                        <FormControl>
                          <Input placeholder={'Block height the quest will end'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </TabsContent>
              <TabsContent value="Rewards" className="mt-0 border-0 p-0">
                <div className="container my-4 space-y-4">

                  <FormField
                    control={form.control}
                    name="reward_stx"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Token Rewards (STX)</FormLabel>
                        <FormControl>
                          <Input disabled placeholder={'Amount of STX tokens a user will get for completing the quest'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                control={form.control}
                name="reward_charisma"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Token Rewards (Charisma)</FormLabel>
                    <FormControl>
                      <Input placeholder={'Amount of Charisma tokens a user will get for completing the quest'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

                  <FormField
                    control={form.control}
                    name="maxcompletions"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Maximum Number of Completions</FormLabel>
                        <FormControl>
                          <Input disabled placeholder={'Total amount of times can be completed by all users. Individually, users can only complete the quest once.'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </TabsContent>
            </Tabs>
            <div className="container flex justify-end">
              <Button type="submit" className="my-4">
                Update Quest
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  )
}

type Props = any

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {

  const quest = await getQuestById(params?.id as string)
  const networks = await getAllNetworks()

  return {
    props: {
      quest,
      networks
    },
    revalidate: 60
  };
};

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { id: '169311427' } },
    ],
    fallback: true
  };
}

