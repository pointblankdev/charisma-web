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
    baseTokenContract,
    name,
    ticker,
    decimals,
}: any) => {
    const safeName = name.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const safeTicker = ticker.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const ca = `${sender}.${safeName}`
    return `(impl-trait .dao-traits-v2.sip010-ft-trait)

(define-fungible-token liquid-staked-token)

(define-constant err-unauthorized (err u3000))
(define-constant err-not-token-owner (err u4))

(define-constant ONE_6 (pow u10 u6)) ;; 6 decimal places

(define-constant contract (as-contract tx-sender))

(define-data-var token-name (string-ascii 32) "${name}")
(define-data-var token-symbol (string-ascii 10) "${safeTicker}")
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/api/metadata/${ca}.json"))
(define-data-var token-decimals uint u${decimals})

;; --- Authorization check

(define-public (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller)) err-unauthorized))
)

;; --- Public functions

(define-public (stake (amount uint))
	(begin
		(let
			(
				(inverse-rate (get-inverse-rate))
				(amount-lst (/ (* amount inverse-rate) ONE_6))
				(sender tx-sender)
			)
			(try! (contract-call? '${baseTokenContract} transfer amount sender contract none))
			(try! (mint amount-lst sender))
		)
		(ok true)
	)
)

(define-public (unstake (amount uint))
	(begin
		(let
			(
				(exchange-rate (get-exchange-rate))
				(amount-token (/ (* amount exchange-rate) ONE_6))
				(sender tx-sender)
			)
			(try! (burn amount sender))
			(try! (as-contract (contract-call? '${baseTokenContract} transfer amount-token contract sender none)))
		)
		(ok true)
	)
)

(define-public (deposit (amount uint))
    (contract-call? '${baseTokenContract} transfer amount tx-sender contract none)
)

(define-public (deflate (amount uint))
    (burn amount tx-sender)
)

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
					contract-id: (as-contract tx-sender),
					token-class: "ft"
				}
			})
		)
	)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
		(ft-transfer? liquid-staked-token amount sender recipient)
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
	(ok (ft-get-balance liquid-staked-token who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply liquid-staked-token))
)

(define-read-only (get-token-uri)
	(ok (var-get token-uri))
)

(define-read-only (get-total-in-pool)
	(unwrap-panic (contract-call? '${baseTokenContract} get-balance contract))
)

(define-read-only (get-exchange-rate)
	(/ (* (get-total-in-pool) ONE_6) (ft-get-supply liquid-staked-token))
)

(define-read-only (get-inverse-rate)
	(/ (* (ft-get-supply liquid-staked-token) ONE_6) (get-total-in-pool))
)

;; --- Private functions

(define-private (mint (amount uint) (recipient principal))
    (ft-mint? liquid-staked-token amount recipient)
)

(define-private (burn (amount uint) (owner principal))
    (ft-burn? liquid-staked-token amount owner)
)

;; --- Init

(mint u1 contract)`
}

const contractFormSchema = z.object({
    sender: z.string(),
    baseTokenContract: z.string(),
    name: z.string(),
    ticker: z.string(),
    decimals: z.coerce.number(),
    image: z.string(),
    image1x2: z.string(),
    image2x1: z.string(),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

export default function LiquidStakedTemplate({ onFormChange }: any) {



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

        const baseTokenSource = await getContractSource({ contractAddress: form.getValues().baseTokenContract.split('.')[0], contractName: form.getValues().baseTokenContract.split('.')[1] })
        const baseTokenFt = baseTokenSource.source.split('define-fungible-token')[1].split('\n')[0].replace(')', '').trim()
        const baseTokenSymbol = await getSymbol(form.getValues().baseTokenContract)
        // todo: this might be a good time to scan the source code with AI for malicious code or vulnerabilities

        const response = await setContractMetadata(ca, {
            name: form.getValues().name,
            image: form.getValues().image,
            image1x2: form.getValues().image1x2,
            cardImage: form.getValues().image2x1,
            symbol: safeTicker,
            ft: "liquid-staked-token",
            contains: [
                {
                    address: form.getValues().baseTokenContract,
                    symbol: baseTokenSymbol,
                    ft: baseTokenFt,
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
                        Base Token
                    </legend>
                    <div className="flex items-end space-x-4">
                        <FormField
                            control={form.control}
                            name="baseTokenContract"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Base Token - Contract Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder={'SP4M2C88EE8RQZPYTC4PZ88CE16YGP825EYF6KBQ.stacks-rock'} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>New Index Token - Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder={'Charisma'} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-end space-x-4">
                            <FormField
                                control={form.control}
                                name="ticker"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>New Rebase Token - Ticker</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'sROCK'} {...field} />
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
                                    name="image1x2"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Image 1x2 Aspect Ratio</FormLabel>
                                            <FormControl>
                                                <Input placeholder={'Publicly available URL of image'} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {form.getValues().image1x2 && <Image src={form.getValues().image1x2} width={400} height={400} alt="index image1x2 image" className="w-full rounded-lg cursor-pointer border mt-4" />}

                        </div>
                        <div>

                            <div className="flex items-end space-x-4">
                                <FormField
                                    control={form.control}
                                    name="image2x1"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Image 2x1 Aspect Ratio</FormLabel>
                                            <FormControl>
                                                <Input placeholder={'Publicly available URL of image'} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {form.getValues().image2x1 && <Image src={form.getValues().image2x1} width={400} height={400} alt="index image2x1 image" className="w-full rounded-lg cursor-pointer border mt-4" />}

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
