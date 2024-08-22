import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const generateTemplate = ({ specializedCreatureId, questUri }: any) => {
    return `;; Battle Royale Contract
;; This contract manages an auction system where creatures bid for rewards with energy.

;; Constants
(define-constant err-unauthorized (err u401))
(define-constant err-invalid-token (err u402))
(define-constant err-invalid-cdk (err u403))
(define-constant specialized-creature-id u${specializedCreatureId})
(define-constant contract (as-contract tx-sender))
(define-constant deployer tx-sender)

;; Data Variables
(define-data-var quest-uri (string-utf8 256) u"${questUri}")
(define-data-var creature-bonus uint u1)
(define-data-var scaling-factor uint u1)
(define-data-var blocks-per-epoch uint u5)
(define-data-var supply-per-epoch uint u100000000)
(define-data-var last-reset-epoch uint u0)
(define-data-var current-epoch uint u0)

;; Whitelisted Contract Addresses
(define-map whitelisted-tokens principal bool)
(define-map whitelisted-cdks principal bool)

;; Storage Maps
(define-map bids {bidder: principal, epoch: uint} {price: uint})
(define-map highest-bidder uint principal)
(define-map highest-bid uint uint)
(define-map bid-count uint uint)
(define-map prize-claimed uint bool)

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

;; Bidding Functions

(define-private (bid (new-price uint))
    (let
        (
            (existing-bid (default-to u0 (get price (map-get? bids {bidder: tx-sender, epoch: (get-current-epoch)}))))
            (updated-bid (+ new-price existing-bid))
            (current-highest-bid (default-to u0 (map-get? highest-bid (get-current-epoch))))
            (current-highest-bidder (default-to deployer (map-get? highest-bidder (get-current-epoch))))
        )
        ;; Update highest bidder and bid if necessary
        (if (> updated-bid current-highest-bid)
            (begin
                (map-set highest-bidder (get-current-epoch) tx-sender)
                (map-set highest-bid (get-current-epoch) updated-bid)
            )
            true
        )
        ;; Update bid and bid count
        (map-set bids {bidder: tx-sender, epoch: (get-current-epoch)} {price: updated-bid})
        (map-set bid-count (get-current-epoch) (+ (default-to u0 (map-get? bid-count (get-current-epoch))) u1))
        (print {
            notification: "updated-bid",
            payload: {
                bidder: tx-sender,
                price: updated-bid,
                bid-count: (map-get? bid-count (get-current-epoch)),
            }
        })
        (ok (map-get? bid-count (get-current-epoch)))
    )
)

;; Epoch Management Functions

(define-private (epoch-passed)
    (> (- block-height (var-get last-reset-epoch)) (var-get blocks-per-epoch))
)

(define-private (try-reset-epoch (reward-token principal))
    (if (epoch-passed)
        (let
            (
                (last-epoch (var-get current-epoch))
            )
            (var-set current-epoch (+ last-epoch u1))
            (var-set last-reset-epoch block-height)
            (print {
                notification: "epoch-reset",
                payload: {
                    epoch: (var-get current-epoch),
                    last-epoch: last-epoch,
                    last-reset-block: (var-get last-reset-epoch),
                    block-height: block-height,
                    winner: (get-winner last-epoch),
                    highest-bid: (get-highest-bid last-epoch),
                }
            })
            (try! (as-contract (contract-call? reward-token transfer (var-get supply-per-epoch) contract (get-winner (- (get-current-epoch) u1)) none)))
            true
        )
        false
    )
)

;; Battle Function

(define-public (battle (creature-id uint) (reward-asset <sip010-transferable-trait>) (cdk-contract <cdk-trait>))
    (begin
        (asserts! (is-whitelisted-cdk (contract-of cdk-contract)) err-invalid-cdk)
        (asserts! (is-whitelisted-token (contract-of reward-asset)) err-invalid-token)
        (let
            (
                (tapped-out (unwrap-panic (contract-call? cdk-contract tap creature-id)))
                (ENERGY (get ENERGY tapped-out))
                (bid-amount (* ENERGY (get-factor)))
                (TOKENS (if (is-eq creature-id specialized-creature-id) (* bid-amount (get-creature-bonus)) bid-amount))
                (is-reset (try-reset-epoch reward-token))
            )
            (bid TOKENS)
        )
    )
)

;; Getter Functions

(define-read-only (get-quest-uri)
  	(var-get quest-uri)
)

(define-read-only (get-creature-bonus)
    (var-get creature-bonus)
)

(define-read-only (get-highest-bid (epoch uint))
    (map-get? highest-bid epoch)
)

(define-read-only (get-highest-bidder (epoch uint))
    (map-get? highest-bidder epoch)
)

(define-read-only (get-latest-bid-of (bidder principal) (epoch uint))
    (default-to u0 (get price (map-get? bids {bidder: bidder, epoch: epoch})))
)

(define-read-only (get-winner (epoch uint))
    (default-to deployer (map-get? highest-bidder epoch))
)

(define-read-only (get-claimable-amount (creature-id uint) (cdk-contract <cdk-trait>))
    (begin
        (asserts! (is-whitelisted-cdk (contract-of cdk-contract)) err-invalid-cdk)
        (let
            (
                (untapped-energy (unwrap-panic (contract-call? cdk-contract get-untapped-amount creature-id tx-sender)))
                (energy-amount (* untapped-energy (get-scaling-factor)))
                (bid-amount (if (is-eq creature-id specialized-creature-id) (* energy-amount (get-creature-bonus)) energy-amount))
            )
            bid-amount
        )
    )
)

(define-read-only (get-scaling-factor)
    (var-get scaling-factor)
)

(define-read-only (get-blocks-per-epoch)
    (var-get blocks-per-epoch)
)

(define-read-only (get-supply-per-epoch)
    (var-get supply-per-epoch)
)

(define-read-only (get-last-reset-epoch)
    (var-get last-reset-epoch)
)

(define-read-only (get-current-epoch)
    (var-get current-epoch)
)

;; Setter Functions

(define-public (set-quest-uri (new-uri (optional (string-utf8 256))))
	(begin
		(try! (is-authorized))
		(ok (var-set quest-uri new-uri))
	)
)

(define-public (set-creature-bonus (new-bonus uint))
    (begin
        (try! (is-authorized))
        (ok (var-set creature-bonus new-bonus))
    )
)

(define-public (set-scaling-factor (new-scaling-factor uint))
    (begin
        (try! (is-authorized))
        (ok (var-set scaling-factor new-scaling-factor))
    )
)

(define-public (set-blocks-per-epoch (new-blocks-per-epoch uint))
    (begin
        (try! (is-authorized))
        (ok (var-set blocks-per-epoch new-blocks-per-epoch))
    )
)

(define-public (set-supply-per-epoch (new-supply-per-epoch uint))
    (begin
        (try! (is-authorized))
        (ok (var-set supply-per-epoch new-supply-per-epoch))
    )
)

;; Utility Functions

(define-read-only (get-blocks-until-next-epoch)
    (let
        (
            (blocks-since-last-reset (- block-height (var-get last-reset-epoch)))
            (blocks-in-current-epoch (mod blocks-since-last-reset (var-get blocks-per-epoch)))
        )
        (- (var-get blocks-per-epoch) blocks-in-current-epoch)
    )
)

(define-read-only (get-epoch-progress)
    (let
        (
            (blocks-since-last-reset (- block-height (var-get last-reset-epoch)))
            (blocks-in-current-epoch (mod blocks-since-last-reset (var-get blocks-per-epoch)))
        )
        (/ (* blocks-in-current-epoch u100) (var-get blocks-per-epoch))
    )
)
`}

const proposalFormSchema = z.object({
    specializedCreatureId: z.coerce.number().min(1).max(100),
    questUri: z.string(),
})

type ProposalFormValues = z.infer<typeof proposalFormSchema>

export default function BattleRoyaleTemplate({ onFormChange }: any) {
    const defaultValues: Partial<ProposalFormValues> = {
        specializedCreatureId: 0,
        questUri: "https://charisma.rocks/api/metadata/",
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
                    </div>
                </fieldset>
            </form>
        </Form>
    )
}