import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@components/ui/textarea"
import { getStakingContract } from "@lib/hooks/use-swap-context"
import { Checkbox } from "@components/ui/checkbox" // Add this import

function generateClarityContract({ swapConfigString, addLiquidity }: { swapConfigString: string, addLiquidity: boolean }) {
    const wstxContract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx'
    const liquidStakedCharisma = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wrapped-charisma'
    const lpToken = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha'

    const optionalLiquidityAdd = `(try! (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router add-liquidity u55 '${wstxContract} '${liquidStakedCharisma} '${lpToken} amt0-desired amt1-desired amt0-min amt1-min))`
    try {
        const swapConfig = JSON.parse(swapConfigString);
        const steps = swapConfig.steps;
        const contractCalls: any[] = [];

        let i = 0;
        while (i < steps.length) {
            const step = steps[i];
            if (step.action === 'SWAP' && step.toToken === wstxContract) {
                if (i + 1 < steps.length && steps[i + 1].action === 'SWAP') {
                    const nextStep = steps[i + 1];
                    contractCalls.push(`(try! (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 swap-3 amount-in amount-in '${step.fromToken} '${step.toToken} '${nextStep.toToken} '${nextStep.fromToken.split('.')[0]}.univ2-share-fee-to))`);
                    i += 2;
                    continue;
                }
            }
            switch (step.action) {
                case 'SWAP':
                    contractCalls.push(`(try! (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 swap amount-in))`);
                    break;
                case 'STAKE':
                case 'UNSTAKE':
                    const actionType = step.action.toLowerCase();
                    const stakingContract = getStakingContract(step.toToken, step.fromToken);
                    if (stakingContract) {
                        contractCalls.push(`(try! (contract-call? '${stakingContract.split('.')[0]}.${stakingContract.split('.')[1]} ${actionType} amount-in))`);
                    } else {
                        console.warn(`No staking configuration found for: ${step.toToken}`);
                    }
                    break;
                default:
                    console.warn(`Unknown action: ${step.action}`);
            }
            i += 1;
        }

        const contractString = `(define-public (execute-strategy (amount-in uint) (amt0-desired uint) (amt1-desired uint) (amt0-min uint) (amt1-min uint))
    (begin
        ${contractCalls.join('\n        ')}
        ${addLiquidity ? optionalLiquidityAdd : ''}
        (ok true)
    )
)`;

        return contractString;

    } catch (error) {
        console.error(error)
        return ';; invalid swap config'
    }
}

// ${optionalLiquidityAdd}

const contractFormSchema = z.object({
    swapConfigString: z.string(),
    addLiquidity: z.boolean().default(false),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

export default function ArbitrageStrategyTemplate({ onFormChange }: any) {

    const defaultValues: Partial<ContractFormValues> = {
        addLiquidity: false,
    }

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const handleChange = () => {
        const values = form.getValues();
        const template = generateClarityContract({
            swapConfigString: values.swapConfigString,
            addLiquidity: values.addLiquidity
        })
        onFormChange(template)
    };

    return (
        <Form {...form} >
            <form onChange={handleChange}>
                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Arbitrage Strategy
                    </legend>
                    <div className="flex flex-col space-y-4">
                        <FormField
                            control={form.control}
                            name="swapConfigString"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Swap Config</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={'json string'} {...field} className="min-h-96" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="addLiquidity"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Add Liquidity After Success
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </fieldset>
            </form>
        </Form >
    )
}
