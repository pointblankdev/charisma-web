import { Button } from "@components/ui/button"
import Layout from "@components/layout"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useConnect } from "@stacks/connect-react"
import { StacksMainnet } from "@stacks/network";
import { PostConditionMode, principalCV, uintCV } from "@stacks/transactions"
import { userSession } from "@components/stacks-session/connect"
import { GetStaticProps } from "next"
import { blocksApi } from "@lib/stacks-api"

const questFormSchema = z.object({
    amount: z.coerce.number(),
    reasoning: z.string(),
})

type QuestFormValues = z.infer<typeof questFormSchema>

export default function ContractEditor({ data }: any) {


    const { doContractDeploy, doContractCall } = useConnect();

    const deployContract = ({
        amount,
        reasoning
    }: any) => {
        const sender = userSession.loadUserData().profile.stxAddress.mainnet
        const safeName = `reward-stakers-${Date.now().toString().slice(0, 7)}`
        doContractDeploy({
            contractName: safeName,
            codeBody: `;; Title: Reward Stakers
;; Author: ${sender}
;; Created By Charisma
;; 
;; Synopsis: Mint Charisma tokens directly to the staking pool, evenly distributing them among all stakers.
;;
;; Reasoning: ${reasoning}

(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.proposal-trait)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token dmg-mint u${amount} 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma))
		(ok true)
	)
)`,
            network: new StacksMainnet(),
            onFinish: (resp) => {
                console.log("onFinish:", resp);
                const ca = `${sender}.${safeName}`
                doContractCall({
                    network: new StacksMainnet(),
                    contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
                    contractName: "dme002-proposal-submission",
                    functionName: "propose",
                    functionArgs: [
                        principalCV(ca),
                        uintCV(Number(data.latestBlock) + 200),
                    ],
                    postConditionMode: PostConditionMode.Allow,
                    postConditions: [],
                })
            },
            onCancel: () => {
                console.log("onCancel:", "Transaction was canceled");
            },
        });
    }

    const defaultValues: Partial<QuestFormValues> = {}

    const form = useForm<QuestFormValues>({
        resolver: zodResolver(questFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const onSubmit = (data: QuestFormValues) => {
        console.log(data)
        deployContract(data)
    };

    return (
        <Layout>
            <div className="my-4 space-y-4 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">
                <h1 className="text-2xl font-bold mx-8">Create a DAO Governance Proposal</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="container my-4 space-y-4">

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Number of tokens to mint and distribute to the staking pool</FormLabel>
                                        <FormControl>
                                            <Input defaultValue={10000} type="number" min={1} max={100000} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reasoning"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Reasoning for this disbursement</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'...'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="my-4 w-full h-14">
                                Submit Governance Proposal To Voting
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </Layout >
    )
}


type Props = {
    data: any;
};

export const getStaticProps: GetStaticProps<Props> = async () => {

    try {
        const { results } = await blocksApi.getBlockList({ limit: 1 })

        const data = {
            latestBlock: results[0].height
        }

        return {
            props: { data },
            revalidate: 60
        };

    } catch (error) {
        return {
            props: {
                data: {}
            },
        }
    }
};
