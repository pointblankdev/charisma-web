import Image from 'next/image';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import { AlertDialogHeader } from '@components/ui/alert-dialog';
import { useAccount, useOpenContractCall } from '@micro-stacks/react';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';
import { FungibleConditionCode, makeStandardFungiblePostCondition } from '@stacks/transactions';
import numeral from 'numeral';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useToast } from '@components/ui/use-toast';
import { useEffect } from 'react';

type TokenSelectDialogProps = {
    lands: any[];
    contractId: `${string}.${string}`
    buttonText?: string
    extraPostConditions?: any[]
}

export const TokenSelectDialog = ({ lands, contractId, buttonText = 'Complete Quest', extraPostConditions = [] }: TokenSelectDialogProps) => {

    const { openContractCall } = useOpenContractCall();
    const { lands: landEnergy, tapped, setTapped } = useGlobalState()
    const { stxAddress } = useAccount()
    const { toast } = useToast()

    // the tokens are still getting greyed out arbitrarily
    // I decided to implement a useEffect to log the energy mapping to inspect and debug if lands are missing energy.
    useEffect(() => {
        if (lands.length > 0) {
            for (const land of lands) {
                land.balances = landEnergy[land.id] || { energy: 0 };
                console.log(`Land ID: ${land.id}, Energy: ${land.balances.energy}, Whitelisted: ${land.whitelisted}, Tapped: ${tapped[land.id]}`);
            }
        }
    }, [lands, landEnergy, tapped]);

    function tap(landId: number) {
        const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token'
        const postConditions: any[] = [
            makeStandardFungiblePostCondition(stxAddress!, FungibleConditionCode.GreaterEqual, '1', burnTokenContract),
        ];

        extraPostConditions.length > 0 && postConditions.push(...extraPostConditions)

        openContractCall({
            contractAddress: contractId.split('.')[0],
            contractName: contractId.split('.')[1],
            functionName: "tap",
            functionArgs: [uintCV(landId), contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'land-helper-v3')],
            postConditions,
            onCancel: () => {
                toast({
                    title: "Transaction Canceled",
                    description: 'You canceled the transaction.',
                })
            },
            onFinish: (result) => {
                setTapped((tapped: any) => ({ ...tapped, [landId]: true }))
                toast({
                    title: "Transaction Broadcasted",
                    description: result.txId,
                })
            }
        });
    }

    // To prevent incorrect or incomplete UI
    if (!lands || lands.length === 0) {
        return <div>Loading tokens...</div>; // To handles the loading state gracefully if no lands are present
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={'sm'} className={`z-30`}>{buttonText}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <DialogTitle>Which staked token do you want to use?</DialogTitle>
                </AlertDialogHeader>

                {/* <DialogDescription className='grid gap-2 grid-cols-4 space-x-4 py-4'>
                    {lands.map((land: any) => (
                        <div className={`relative flex flex-col items-center space-y-2 ${!land.whitelisted || tapped[land.id] || !land.balances?.energy ? 'opacity-20 grayscale' : 'cursor-pointer'} group/token`}>
                            <Image
                                alt={'token-logo'}
                                src={land.image}
                                width={100}
                                height={100}
                                onClick={() => (land.whitelisted && !tapped[land.id] && land.balances?.energy && tap(land.id))}
                                className={`w-24 h-24 z-20 border rounded-full ${(land.whitelisted && !tapped[land.id] && land.balances?.energy) && 'group-hover/token:z-40 group-hover/token:shadow-xl group-hover/token:scale-110 transition-all'}`}
                            />
                            <div className={`z-30 opacity-0 absolute text-center px-3 py-1 border min-w-6 font-bold rounded-full top-0 text-md bg-card text-accent-foreground flex ${(land.whitelisted && !tapped[land.id] && land.balances?.energy) && 'group-hover/token:-top-6 group-hover/token:opacity-100 group-hover/token:z-50 group-hover/token:shadow-xl group-hover/token:scale-150 transition-all'}`}>
                                <div className='z-30 text-white whitespace-nowrap'>{numeral(land.balances?.energy).format('0a')} ⚡</div>
                            </div>
                        </div>
                    ))}
                </DialogDescription> */}

                <DialogDescription className='grid gap-2 grid-cols-4 space-x-4 py-4'>
                    {lands.map((land: any) => (
                        <div 
                            key={land.id} 
                            onClick={() => {
                                if (land.whitelisted && !tapped[land.id] && land.balances?.energy) { // to ensure click is triggered for only whiltelisted token and not just tapped
                                    tap(land.id);
                                }
                            }}
                            className={`relative flex flex-col items-center space-y-2 group/token ${!land.whitelisted || tapped[land.id] ? 'opacity-20 grayscale' : 'cursor-pointer'}`}>
                            <Image
                                alt={'token-logo'}
                                src={land.image}
                                width={100}
                                height={100}
                                // onClick={() => (tap(land.id))}
                                className={`w-24 h-24 z-20 border rounded-full ${(land.whitelisted && !tapped[land.id] && land.balances?.energy) && 'group-hover/token:z-40 group-hover/token:shadow-xl group-hover/token:scale-110 transition-all'}`}
                            />
                            {land.balances?.energy > 0 && (
                                <div className={`z-30 opacity-0 absolute text-center px-3 py-1 border min-w-6 font-bold rounded-full top-0 text-md bg-card text-accent-foreground flex ${(land.whitelisted && !tapped[land.id] && land.balances?.energy) && 'group-hover/token:-top-6 group-hover/token:opacity-100 group-hover/token:z-50 group-hover/token:shadow-xl group-hover/token:scale-150 transition-all'}`}>
                                    <div className='z-30 text-white whitespace-nowrap'>{numeral(land.balances?.energy).format('0a')} ⚡</div>
                                </div>
                            )}
                        </div>
                    ))}
                </DialogDescription>
            </DialogContent>
        </Dialog >
    )
}
export default TokenSelectDialog