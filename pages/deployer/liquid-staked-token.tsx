import Image from "next/image"
import { Button } from "@components/ui/button"
import Layout from "@components/layout"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getContractSource, getSymbol } from "@lib/stacks-api"
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from "@stacks/connect-react"
import { StacksMainnet } from "@stacks/network";
import { setContractMetadata } from "@lib/user-api"
import { useEffect } from "react"


const generateTemplate = ({
    sender,
    baseTokenA,
    baseTokenB,
    tokenARatio,
    tokenBRatio,
    name,
    ticker,
    decimals,
    unlockBlock,
    blocksPerTx,
    indexTokenRatio,
    lockAddLiquidity = false
}: any) => {
    const safeName = name.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const safeTicker = ticker.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const ca = `${sender}.${safeName}`
    return ``
}

const contractFormSchema = z.object({
    sender: z.string(),
    baseTokenA: z.string(),
    baseTokenB: z.string(),
    tokenARatio: z.coerce.number(),
    tokenBRatio: z.coerce.number(),
    name: z.string(),
    description: z.string(),
    ticker: z.string(),
    decimals: z.coerce.number(),
    image: z.string(),
    background: z.string(),
    // time lock for remove-liquidity
    unlockBlock: z.coerce.number(),
    // rate limiting for remove-liquidity
    blocksPerTx: z.coerce.number(),
    indexTokenRatio: z.coerce.number(),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

export default function IndexTokenTemplate({ onFormChange }: any) {



    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    const defaultValues: Partial<ContractFormValues> = {
        sender: sender,
        name: '',
        ticker: '',
    }

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const handleChange = () => {
        const template = generateTemplate(form.getValues())
        onFormChange(template)
    };

    useEffect(() => {
        onFormChange(generateTemplate(form.getValues()))
    }, [form])

    const createMetadata = async (e: any) => {
        e.preventDefault()
        const safeName = form.getValues().name.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
        const safeTicker = form.getValues().ticker.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
        const ca = `${sender}.${safeName}`

        const baseTokenSymbolA = await getSymbol(form.getValues().baseTokenA)
        const baseTokenSymbolB = await getSymbol(form.getValues().baseTokenB)
        const baseTokenSourceA = await getContractSource({ contractAddress: form.getValues().baseTokenA.split('.')[0], contractName: form.getValues().baseTokenA.split('.')[1] })
        const baseTokenSourceB = await getContractSource({ contractAddress: form.getValues().baseTokenB.split('.')[0], contractName: form.getValues().baseTokenB.split('.')[1] })
        // find the string that comes after the first occurence of 'define-fungible-token' in the baseTokenSourceA.source string
        const baseTokenFtA = baseTokenSourceA.source.split('define-fungible-token')[1].split('\n')[0].replace(')', '').trim()
        const baseTokenFtB = baseTokenSourceB.source.split('define-fungible-token')[1].split('\n')[0].replace(')', '').trim()

        // todo: this might be a good time to scan the source code with AI for malicious code or vulnerabilities

        const response = await setContractMetadata(ca, {
            name: form.getValues().name,
            description: form.getValues().description,
            image: form.getValues().image,
            background: form.getValues().background,
            symbol: safeTicker,
            ft: "index-token",
            weight: form.getValues().indexTokenRatio,
            contains: [
                {
                    address: form.getValues().baseTokenA,
                    symbol: baseTokenSymbolA,
                    ft: baseTokenFtA,
                    weight: form.getValues().tokenARatio
                },
                {
                    address: form.getValues().baseTokenB,
                    symbol: baseTokenSymbolB,
                    ft: baseTokenFtB,
                    weight: form.getValues().tokenBRatio
                }
            ]

        })
        console.log(response)
    }

    return (
        <Form {...form} >
            <form onChange={handleChange}>
                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Index Token
                    </legend>
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                        <div className="flex items-end space-x-4">
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
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="tokenARatio"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Base Token A Weight (A:B)</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'To mint 1 index token, this many base tokens is required.'} type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-end space-x-4">
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
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="tokenBRatio"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Base Token B Weight (A:B)</FormLabel>
                                        <FormControl>
                                            <Input placeholder={`To mint 1 index token, this many base tokens is required.`} type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>New Index Token - Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'Charismatic Corgi'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="indexTokenRatio"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Index Token Weight</FormLabel>
                                        <FormControl>
                                            <Input placeholder={`For each mint, this many index tokens are created.`} type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>New Index Token - Description</FormLabel>
                                <FormControl>
                                    <Input placeholder={'An index fund composed of sWELSH and sCHA at a fixed 100:1 ratio.'} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-end space-x-4">
                            <FormField
                                control={form.control}
                                name="ticker"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>New Index Token - Ticker</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'iCC, iGK, iTOKEN, etc.'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="decimals"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>New Index Token - Decimals</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'The standard amount is 6'} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-end space-x-4">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Token Icon</FormLabel>
                                            <FormControl>
                                                <Input placeholder={'Publicly available URL of image'} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {form.getValues().image && <Image src={form.getValues().image} width={400} height={400} alt='index logo image' className="w-full rounded-lg cursor-pointer border mt-4" />}

                        </div>
                        <div>

                            <div className="flex items-end space-x-4">
                                <FormField
                                    control={form.control}
                                    name="background"
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
                            {form.getValues().background && <Image src={form.getValues().background} width={400} height={400} alt="index background image" className="w-full rounded-lg cursor-pointer border mt-4" />}

                        </div>
                    </div>
                    <div className="border rounded-xl px-4 pb-4 pt-2">
                        <h2 className="text-lg font-fine mb-4">Capital Controls</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FormField
                                    control={form.control}
                                    name="unlockBlock"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Unlock Block Height</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`What block height the remove-liquidity function should be unlocked.`} type="number" min={155500} max={200000} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <FormField
                                    control={form.control}
                                    name="blocksPerTx"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Blocks per Transaction</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`Optional rate limiting of liquidity removal. Selecting 0 will disable rate limiting.`} type="number" min={0} max={1000} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>
                <div className="flex justify-end">
                    <Button onClick={createMetadata} className="mt-4">Create Metadata</Button>
                </div>
            </form>
        </Form>
    )
}
