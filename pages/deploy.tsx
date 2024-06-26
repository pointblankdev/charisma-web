import { GetStaticProps } from "next"
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
import { getAllGuilds, getAllNetworks, getQuestImageUrls } from "@lib/cms-providers/dato"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { useEffect, useState } from "react"
import { checkQuestStxRewards, getQuestActivationBlock, getQuestExpirationBlock, getQuestMaxCompletions, getStxProtocolFeePercentage, getStxQuestRewardsDeposited } from "@lib/stacks-api"
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from "@stacks/connect-react"
import {
    AnchorMode,
    Pc,
    PostConditionMode,
    principalCV,
    uintCV,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { updateQuest } from "@lib/user-api"
import { Textarea } from "@components/ui/textarea"
import { Slider } from "@components/ui/slider"
// import DepositForm from "@components/quest-manager/deposit-form"

const questFormSchema = z.object({
    baseTokenA: z.string(),
    baseTokenB: z.string(),
    // ratioAtoB: z.coerce.number(),
    name: z.string(),
    ticker: z.string(),
    decimals: z.coerce.number(),
    // cardImage: z.string(),
    // questBgImage: z.string(),
})

type QuestFormValues = z.infer<typeof questFormSchema>

export default function ContractEditor({ quest, cardImage, questBgImage }: any) {


    const { doContractDeploy } = useConnect();

    const deployContract = ({
        baseTokenA,
        baseTokenB,
        // ratioAtoB,
        tokenARatio = 1,
        tokenBRatio = 1,
        name,
        ticker,
        decimals,
    }: any) => {
        const safeName = name.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
        const safeTicker = ticker.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
        doContractDeploy({
            contractName: safeName,
            codeBody: `
;; Title: ${name}
;; Created With Charisma

(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.sip010-ft-trait)
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.extension-trait)
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v3.index-token-trait)

(define-constant err-unauthorized (err u3000))
(define-constant err-not-token-owner (err u4))

(define-constant contract (as-contract tx-sender))

(define-fungible-token index-token)

(define-data-var token-name (string-ascii 32) "${name}")
(define-data-var token-symbol (string-ascii 10) "${safeTicker}")
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/indexes/${safeName}.json"))
(define-data-var token-decimals uint u${Number(decimals).toFixed(0)})

(define-data-var token-a-ratio uint u${Number(tokenARatio).toFixed(0)})
(define-data-var token-b-ratio uint u${Number(tokenBRatio).toFixed(0)})

;; --- Authorization check

(define-read-only (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller)) err-unauthorized))
)

;; --- Internal DAO functions

(define-public (set-name (new-name (string-ascii 32)))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-name new-name))
	)
)

(define-public (set-symbol (new-symbol (string-ascii 10)))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-symbol new-symbol))
	)
)

(define-public (set-decimals (new-decimals uint))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set token-decimals new-decimals))
	)
)

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
	(begin
		(try! (is-dao-or-extension))
		(var-set token-uri new-uri)
		(ok 
			(print {
				notification: "token-metadata-update",
				payload: {
					token-class: "ft",
					contract-id: contract
				}
			})
		)
	)
)

;; --- Index token functions

(define-public (add-liquidity (amount uint))
    (let
        (
            (amount-a (* amount (var-get token-a-ratio)))
            (amount-b (* amount (var-get token-b-ratio)))
        )
        (try! (contract-call? '${baseTokenA} transfer amount-a tx-sender contract none))
        (try! (contract-call? '${baseTokenB} transfer amount-b tx-sender contract none))
        (try! (ft-mint? index-token amount tx-sender))
        (ok true)
    )
)

(define-public (remove-liquidity (amount uint))
    (let
        (
            (sender tx-sender)
            (amount-a (* amount (var-get token-a-ratio)))
            (amount-b (* amount (var-get token-b-ratio)))
        )
        (try! (ft-burn? index-token amount tx-sender))
        (try! (as-contract (contract-call? '${baseTokenA} transfer amount-a contract sender none)))
        (try! (as-contract (contract-call? '${baseTokenB} transfer amount-b contract sender none)))
        (ok true)
    )
)

;; --- SIP-010 FT Trait

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
		(ft-transfer? index-token amount sender recipient)
	)
)

(define-read-only (get-name)
	(ok (var-get token-name))
)

(define-read-only (get-symbol)
	(ok (var-get token-symbol))
)

(define-read-only (get-decimals)
	(ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance index-token who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply index-token))
)

(define-read-only (get-token-uri)
	(ok (var-get token-uri))
)

;; --- Extension callback

(define-public (callback (sender principal) (memo (buff 34)))
	(ok true)
)`,
            network: new StacksMainnet(),
        });
    }

    const defaultValues: Partial<QuestFormValues> = {
        ...quest,
    }

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
            <div className="my-4 space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="container my-4 space-y-4">
                            <FormField
                                control={form.control}
                                name="baseTokenA"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Base Token A - Contract Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="baseTokenB"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Base Token B - Contract Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
                                control={form.control}
                                name="ratioAtoB"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Base Tokens Weight Ratio (A:B)</FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={100} step={1} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>New Index Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'Charismatic Corgi'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ticker"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>New Index Ticker</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'iCC'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="decimals"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Decimals</FormLabel>
                                        <FormControl>
                                            <Input defaultValue={6} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* <div>

                                    <div className="flex items-end space-x-4">
                                        <FormField
                                            control={form.control}
                                            name="cardImage"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Card Image</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={'Publicly available URL of image'} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {cardImage && <Image src={cardImage.url} width={400} height={400} alt={cardImage.alt} className="w-full rounded-lg cursor-pointer border mt-4" />}

                                </div>
                                <div>

                                    <div className="flex items-end space-x-4">
                                        <FormField
                                            control={form.control}
                                            name="questBgImage"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Background Image</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={'Publicly available URL of image'} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {questBgImage && <Image src={questBgImage.url} width={400} height={400} alt={cardImage.alt} className="w-full rounded-lg cursor-pointer border mt-4" />}

                                </div> */}
                                <Button type="submit" className="my-4 w-full h-14">
                                    Deploy Index Token Contract
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </Layout>
    )
}