import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const generateTemplate = ({ amount, reasoning }: any) => {
    return `;; Reasoning: 
;; ${reasoning}

(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dao-traits-v2.proposal-trait)

(define-constant cha-amount (* u${amount} (pow u10 u6)))
(define-constant target-farm 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.abundant-orchard)

(define-public (execute (sender principal))
	(begin
		(try! (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token dmg-mint cha-amount tx-sender))
		(try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma add-liquidity cha-amount))
		(let
			(
				(scha-amount (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma get-balance tx-sender)))
			)
			(try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples add-liquidity (/ scha-amount u2)))
		)
		(let
			(
				(fuji-amount (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples get-balance tx-sender)))
			)
			(try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples transfer fuji-amount tx-sender target-farm none))
		)
        (ok true)
	)
)

(define-public (propose (proposal <proposal-trait>))
    (let 
        (
            (start-delay (try! (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission get-parameter "minimum-proposal-start-delay")))
            (start-block-height (+ block-height start-delay))
        )
        (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission propose proposal start-block-height)
    )
)
`}

const proposalFormSchema = z.object({
    amount: z.coerce.number().min(1).max(100000),
    reasoning: z.string().min(1, "Reasoning is required"),
})

type ProposalFormValues = z.infer<typeof proposalFormSchema>

export default function RestockFarmsTemplate({ onFormChange }: any) {
    const defaultValues: Partial<ProposalFormValues> = {
        amount: 0,
        reasoning: "",
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of tokens to mint and distribute to the staking pool</FormLabel>
                                    <FormControl>
                                        <Input placeholder={'Amount of tokens'} type="number" min={1} max={100000} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reasoning"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reasoning for this disbursement</FormLabel>
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