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
    indexTokenRatio
}: any) => {
    const safeName = name.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const safeTicker = ticker.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, "-")
    const ca = `${sender}.${safeName}`
    return `(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.sip010-ft-trait)
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.extension-trait)

(define-constant err-unauthorized (err u3000))
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

;; --- Authorization check

(define-read-only (is-dao-or-extension)
	(ok (asserts! (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller)) err-unauthorized))
)

(define-read-only (is-unlocked)
	(ok (asserts! (>= block-height (+ unlock-block (var-get block-counter))) err-unauthorized))
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

(define-public (set-blocks-per-tx (new-blocks-per-tx uint))
	(begin
		(try! (is-dao-or-extension))
		(ok (var-set blocks-per-tx new-blocks-per-tx))
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
            (amount-a (* amount token-a-ratio))
            (amount-b (* amount token-b-ratio))
            (amount-index (* amount index-token-ratio))
        )
        (try! (is-unlocked))
        (try! (contract-call? '${baseTokenA} transfer amount-a tx-sender contract none))
        (try! (contract-call? '${baseTokenB} transfer amount-b tx-sender contract none))
        (try! (ft-mint? index-token amount-index tx-sender))
        (var-set block-counter (+ (var-get block-counter) (var-get blocks-per-tx)))
        (ok true)
    )
)

(define-public (remove-liquidity (amount uint))
    (let
        (
            (sender tx-sender)
            (amount-a (* amount token-a-ratio))
            (amount-b (* amount token-b-ratio))
            (amount-index (* amount index-token-ratio))
        )
        (try! (is-unlocked))
        (try! (ft-burn? index-token amount-index tx-sender))
        (try! (as-contract (contract-call? '${baseTokenA} transfer amount-a contract sender none)))
        (try! (as-contract (contract-call? '${baseTokenB} transfer amount-b contract sender none)))
        (var-set block-counter (+ (var-get block-counter) (var-get blocks-per-tx)))
        (ok true)
    )
)
    
(define-read-only (get-token-a-ratio)
    (ok token-a-ratio)
)

(define-read-only (get-token-a-ratio)
    (ok token-a-ratio)
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
    (ok (/ (- block-height (+ unlock-block (var-get block-counter))) (var-get blocks-per-tx)))
)

(define-read-only (get-blocks-until-unlock)
	(ok (- (+ unlock-block (var-get block-counter)) block-height))
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



    const sender = userSession.loadUserData().profile.stxAddress.mainnet

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
            </form>
        </Form>
    )
}
