import { Button } from "@components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"

const generateTemplate = ({ specializedCreatureId, questUri }: any) => {
    return `;; Yield Farm Contract
;; This contract allows users to harvest tokens by spending creatures energy.

;; Constants
(define-constant err-unauthorized (err u401))
(define-constant specialized-creature-id u${specializedCreatureId})

;; Data Variables
(define-data-var quest-uri (string-utf8 256) u"${questUri}")
(define-data-var creature-bonus uint u1)
(define-data-var scaling-factor uint u1)

;; Whitelisted Contract Addresses
(define-map whitelisted-tokens principal bool)
(define-map whitelisted-cdks principal bool)

;; Traits
(define-trait sip010-transferable-trait
	(
		(transfer (uint principal principal (optional (buff 34))) (response bool uint))
		(get-decimals () (response uint uint))
	)
)

(define-trait cdk-trait
	(
		(tap (uint) (response (tuple (type (string-ascii 256)) (creature-id uint) (creature-amount uint) (ENERGY uint)) uint))
		(get-untapped-amount (uint principal) (response uint uint))
	)
)

;; Authorization Functions

(define-private (is-dao-or-extension)
    (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) 
        (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller))
)

(define-read-only (is-authorized)
    (ok (asserts! (is-dao-or-extension) err-unauthorized))
)

;; Whitelist Functions

(define-public (set-whitelisted-token (token principal) (whitelisted bool))
    (begin
        (try! (is-authorized))
        (ok (map-set whitelisted-tokens token whitelisted))
    )
)

(define-read-only (is-whitelisted-token (token principal))
    (default-to false (map-get? whitelisted-tokens token))
)

(define-public (set-whitelisted-cdk (cdk principal) (whitelisted bool))
    (begin
        (try! (is-authorized))
        (ok (map-set whitelisted-cdks cdk whitelisted))
    )
)

(define-read-only (is-whitelisted-cdk (cdk principal))
    (default-to false (map-get? whitelisted-cdks cdk))
)

;; Harvesting Functions

(define-public (harvest (creature-id uint) (reward-asset <sip010-transferable-trait>) (cdk-contract <cdk-trait>))
    (begin
        (asserts! (is-whitelisted-cdk (contract-of cdk-contract)) err-invalid-cdk)
        (asserts! (is-whitelisted-token (contract-of reward-asset)) err-invalid-token)
        (let
            (
                (tapped-out (unwrap-panic (contract-call? cdk-contract tap creature-id)))
                (ENERGY (get ENERGY tapped-out))
                (token-amount (* ENERGY (get-scaling-factor)))
                (TOKENS (if (is-eq creature-id specialized-creature-id) (* token-amount (get-creature-bonus)) token-amount))
                (original-sender tx-sender)
            )
            (as-contract (contract-call? reward-asset transfer TOKENS tx-sender original-sender none))
        )
    )
)

(define-read-only (get-claimable-amount (creature-id uint) (cdk-contract <cdk-trait>))
    (begin
        (asserts! (is-whitelisted-cdk (contract-of cdk-contract)) err-invalid-cdk)
        (let
            (
                (untapped-energy (unwrap-panic (contract-call? cdk-contract get-untapped-amount creature-id tx-sender)))
                (token-amount (* untapped-energy (get-scaling-factor)))
            )
            (if (is-eq creature-id specialized-creature-id) (* token-amount (get-creature-bonus)) token-amount)
        )
    )
)

;; Getters
(define-read-only (get-scaling-factor)
    (var-get scaling-factor)
)

(define-read-only (get-quest-uri)
  	(var-get quest-uri)
)

(define-read-only (get-creature-bonus)
    (var-get creature-bonus)
)

;; Setters
(define-public (set-scaling-factor (new-scaling-factor uint))
    (begin
        (try! (is-authorized))
        (ok (var-set scaling-factor new-scaling-factor))
    )
)

(define-public (set-creature-bonus (new-bonus uint))
    (begin
        (try! (is-authorized))
        (ok (var-set creature-bonus new-bonus))
    )
)

(define-public (set-quest-uri (new-uri (optional (string-utf8 256))))
	(begin
		(try! (is-authorized))
		(ok (var-set quest-uri new-uri))
	)
)
`}

const proposalFormSchema = z.object({
    specializedCreatureId: z.coerce.number().min(1).max(100),
    questUri: z.string(),
    sip10RewardContract: z.string(),
})

type ProposalFormValues = z.infer<typeof proposalFormSchema>

export default function FarmTemplate({ onFormChange }: any) {
    const defaultValues: Partial<ProposalFormValues> = {
        specializedCreatureId: 0,
        questUri: "https://charisma.rocks/api/metadata/",
        sip10RewardContract: "'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma",
    }

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const handleChange = () => {
        const template = generateTemplate(form.getValues())
        onFormChange(template)
    };

    return (
        <Form {...form}>
            <form onChange={handleChange}>
                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Proposal Details
                    </legend>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="specializedCreatureId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Creature ID that gets a multiplier</FormLabel>
                                    <FormControl>
                                        <Input placeholder={'Creature ID'} type="number" min={1} max={100} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="questUri"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Metadata URL for the Quest</FormLabel>
                                    <FormControl>
                                        <Input placeholder={'...'} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sip10RewardContract"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>What token to issue for rewards</FormLabel>
                                    <FormControl>
                                        <Input placeholder={'...'} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </fieldset>
            </form>
        </Form>
    )
}