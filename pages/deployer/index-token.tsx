import Image from "next/image"
import { Button } from "@components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getContractSource, getSymbol } from "@lib/stacks-api"
import { useEffect } from "react"
import { setContractMetadata } from "@lib/user-api"


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
}: any) => {
    const safeName = name.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const safeTicker = ticker.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const ca = `${sender}.${safeName}`
    return `(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.sip010-ft-trait)
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.extension-trait)

(define-constant err-unauthorized (err u401))
(define-constant err-liquidity-lock (err u402))
(define-constant err-forbidden (err u403))
(define-constant err-not-token-owner (err u4))

(define-constant contract (as-contract tx-sender))
(define-constant unlock-block u${Number(unlockBlock).toFixed(0)})
(define-constant token-a-ratio u${Number(tokenARatio).toFixed(0)})
(define-constant token-b-ratio u${Number(tokenBRatio).toFixed(0)})
(define-constant index-token-ratio u${Number(indexTokenRatio).toFixed(0)})

(define-fungible-token index-token)

(define-data-var token-name (string-ascii 32) "${name}")
(define-data-var token-symbol (string-ascii 10) "${safeTicker}")
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://charisma.rocks/api/metadata/${ca}.json"))
(define-data-var token-decimals uint u${Number(decimals).toFixed(0)})

(define-data-var blocks-per-tx uint u${Number(blocksPerTx).toFixed(0)})
(define-data-var block-counter uint u0)

(define-data-var required-exp-percentage uint (/ u100000 u1)) ;; 1% of total supply
(define-data-var max-liquidity-flow uint (* u1000000 u1000)) ;; 1k tokens 

;; --- Authorization checks

(define-read-only (is-dao-or-extension)
    (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller))
)

(define-read-only (has-required-experience (who principal))
    (unwrap-panic (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience has-percentage-balance who (var-get required-exp-percentage)))
)

(define-read-only (is-authorized)
	(ok (asserts! (is-dao-or-extension) err-unauthorized))
)

(define-read-only (is-privileged)
	(ok (asserts! (or (is-dao-or-extension) (has-required-experience tx-sender)) err-forbidden))
)

(define-read-only (is-unlocked)
	(ok (asserts! (>= block-height (+ unlock-block (var-get block-counter))) err-liquidity-lock))
)

;; --- Internal DAO functions

(define-public (set-name (new-name (string-ascii 32)))
	(begin
		(try! (is-authorized))
		(ok (var-set token-name new-name))
	)
)

(define-public (set-symbol (new-symbol (string-ascii 10)))
	(begin
		(try! (is-authorized))
		(ok (var-set token-symbol new-symbol))
	)
)

(define-public (set-decimals (new-decimals uint))
	(begin
		(try! (is-authorized))
		(ok (var-set token-decimals new-decimals))
	)
)

(define-public (set-blocks-per-tx (new-blocks-per-tx uint))
	(begin
		(try! (is-authorized))
		(ok (var-set blocks-per-tx new-blocks-per-tx))
	)
)

(define-public (set-required-exp-percentage (new-required-exp-percentage uint))
	(begin
		(try! (is-authorized))
		(ok (var-set required-exp-percentage new-required-exp-percentage))
	)
)

(define-public (set-max-liquidity-flow (new-max-liquidity-flow uint))
	(begin
		(try! (is-authorized))
		(ok (var-set max-liquidity-flow new-max-liquidity-flow))
	)
)

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
	(begin
		(try! (is-authorized))
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
            (privileged (try! (is-privileged)))
            (max-flow (var-get max-liquidity-flow))
            (amount-in (if (and (not privileged) (> amount max-flow)) max-flow amount))
            (amount-a (* amount-in token-a-ratio))
            (amount-b (* amount-in token-b-ratio))
            (amount-index (* amount-in index-token-ratio))
        )
        (if 
            privileged
            true
            (begin
                (try! (is-unlocked))
                (var-set block-counter (+ (var-get block-counter) (var-get blocks-per-tx)))
                false
            )
        )
        (try! (contract-call? '${baseTokenA} transfer amount-a tx-sender contract none))
        (try! (contract-call? '${baseTokenB} transfer amount-b tx-sender contract none))
        (try! (ft-mint? index-token amount-index tx-sender))
        (ok {
            a: amount-a,
            b: amount-b,
            x: amount-index
        })
    )
)

(define-public (remove-liquidity (amount uint))
    (let
        (
            (sender tx-sender)
            (privileged (try! (is-privileged)))
            (max-flow (var-get max-liquidity-flow))
            (amount-in (if (and (not privileged) (> amount max-flow)) max-flow amount))
            (amount-a (* amount-in token-a-ratio))
            (amount-b (* amount-in token-b-ratio))
            (amount-index (* amount-in index-token-ratio))
        )
        (if 
            privileged
            true
            (begin
                (try! (is-unlocked))
                (var-set block-counter (+ (var-get block-counter) (var-get blocks-per-tx)))
                false
            )
        )
        (try! (ft-burn? index-token amount-index tx-sender))
        (try! (as-contract (contract-call? '${baseTokenA} transfer amount-a contract sender none)))
        (try! (as-contract (contract-call? '${baseTokenB} transfer amount-b contract sender none)))
        (ok {
            a: amount-a,
            b: amount-b,
            x: amount-index
        })
    )
)
    
(define-read-only (get-token-a-ratio)
    (ok token-a-ratio)
)

(define-read-only (get-token-b-ratio)
    (ok token-b-ratio)
)

(define-read-only (get-index-token-ratio)
    (ok index-token-ratio)
)

(define-read-only (get-blocks-per-tx)
	(ok (var-get blocks-per-tx))
)

(define-read-only (get-block-counter)
	(ok (var-get block-counter))
)

(define-read-only (get-txs-available)
    (begin
        (asserts! (>= block-height (+ unlock-block (var-get block-counter))) (ok u0))
        (ok (/ (- block-height (+ unlock-block (var-get block-counter))) (var-get blocks-per-tx)))
    )
)

(define-read-only (get-blocks-until-unlock)
    (begin
        (asserts! (< block-height (+ unlock-block (var-get block-counter))) (ok u0))
	    (ok (- (+ unlock-block (var-get block-counter)) block-height))
    )
)

(define-read-only (get-required-exp-percentage)
	(ok (var-get required-exp-percentage))
)

(define-read-only (get-max-liquidity-flow)
	(ok (var-get max-liquidity-flow))
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

;; --- Utility functions

(define-public (send-many (recipients (list 200 { to: principal, amount: uint, memo: (optional (buff 34)) })))
  (fold check-err (map send-token recipients) (ok true))
)

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result err-value (err err-value))
)

(define-private (send-token (recipient { to: principal, amount: uint, memo: (optional (buff 34)) }))
  (send-token-with-memo (get amount recipient) (get to recipient) (get memo recipient))
)

(define-private (send-token-with-memo (amount uint) (to principal) (memo (optional (buff 34))))
  (let ((transferOk (try! (transfer amount tx-sender to memo))))
    (ok transferOk)
  )
)

;; --- Extension callback

(define-public (callback (sender principal) (memo (buff 34)))
	(ok true)
)`
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

    const sender = ''

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
