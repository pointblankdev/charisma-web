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
import { Textarea } from "@components/ui/textarea"
import { StepConfig, SwapConfig, getStakingContract } from "@lib/hooks/use-swap-context"


function generateClarityContract({ swapConfigString }: { swapConfigString: string }) {

    const wstxContract = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx'
    const liquidStakedCharisma = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
    const lpToken = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-scha'

    const optionalLiquidityAdd = `\n(try! (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router add-liquidity u54 ${wstxContract} ${liquidStakedCharisma} ${lpToken} u100000 u750000 u50000 u15000))`
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

        const contractString = `(define-public (execute-strategy (amount-in uint))
    (begin
        ${contractCalls.join('\n        ')}${optionalLiquidityAdd}
        (ok true)
    )
)`;

        return contractString;

    } catch (error) {
        console.error(error)
        return ';; invalid swap config'
    }
}

const contractFormSchema = z.object({
    swapConfigString: z.string(),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

export default function ArbitrageStrategyTemplate({ onFormChange }: any) {

    const sender = userSession.loadUserData().profile.stxAddress.mainnet

    const defaultValues: Partial<ContractFormValues> = {
    }

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const handleChange = (e: any) => {
        const template = generateClarityContract({ swapConfigString: e.target.value })
        onFormChange(template)
    };

    return (
        <Form {...form} >
            <form>
                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Arbitrage Strategy
                    </legend>
                    <div className="flex items-end space-x-4">
                        <FormField
                            control={form.control}
                            name="swapConfigString"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Swap Config</FormLabel>
                                    <FormControl onChange={handleChange}>
                                        <Textarea placeholder={'json string'} {...field} className="min-h-96" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </fieldset>
            </form>
        </Form >
    )
}
