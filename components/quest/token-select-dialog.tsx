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

type TokenSelectDialogProps = {
    lands: any[];
    contractId: `${string}.${string}`
    buttonText?: string
}

export const TokenSelectDialog = ({ lands, contractId, buttonText = 'Complete Quest' }: TokenSelectDialogProps) => {

    const { openContractCall } = useOpenContractCall();
    const { lands: landEnergy, tapped, setTapped } = useGlobalState()
    const { stxAddress } = useAccount()
    const { toast } = useToast()

    for (const land of lands) {
        land.balances = landEnergy[land.id]
    }

    function tap(landId: number) {
        const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma::liquid-staked-token'
        const postConditions = [
            makeStandardFungiblePostCondition(stxAddress!, FungibleConditionCode.GreaterEqual, '1', burnTokenContract),
        ];

        openContractCall({
            contractAddress: contractId.split('.')[0],
            contractName: contractId.split('.')[1],
            functionName: "tap",
            functionArgs: [uintCV(landId), contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'land-helper-v2')],
            postConditions: postConditions as any[],
            onCancel: () => {
                toast({
                    title: "Transaction Canceled",
                    description: 'You canceled the transaction.',
                })
            },
            onFinish: (result) => {
                setTapped({ [landId]: true })
                toast({
                    title: "Transaction Broadcasted",
                    description: `txId: ${result.txId}`,
                })
            }
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={'sm'} className={`z-30`}>{buttonText}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <AlertDialogHeader>
                    <DialogTitle>Which staked token do you want to use?</DialogTitle>
                </AlertDialogHeader>

                <DialogDescription className='grid gap-2 grid-cols-2 sm:grid-cols-4 space-x-4 py-4'>
                    {lands.map((land: any) => (
                        <div className={`relative flex flex-col items-center space-y-2 ${!land.whitelisted || tapped[land.id] ? 'opacity-20 grayscale' : 'cursor-pointer'} group/token`}>
                            <Image
                                alt={'token-logo'}
                                src={land.image}
                                width={100}
                                height={100}
                                onClick={() => (land.whitelisted && !tapped[land.id] && tap(land.id))}
                                className={`z-20 border rounded-full h-32 w-32 ${(land.whitelisted && !tapped[land.id]) && 'group-hover/token:z-40 group-hover/token:shadow-xl group-hover/token:scale-110 transition-all'}`}
                            />
                            <div className={`z-30 opacity-0 absolute text-center px-3 py-1 border min-w-6 font-bold rounded-full top-0 text-md bg-card text-accent-foreground flex ${(land.whitelisted && !tapped[land.id]) && 'group-hover/token:-top-6 group-hover/token:opacity-100 group-hover/token:z-50 group-hover/token:shadow-xl group-hover/token:scale-150 transition-all'}`}>
                                <div className='z-30 text-white'>{numeral(land.balances?.energy).format('0a')} ⚡</div>
                            </div>
                        </div>
                    ))}
                </DialogDescription>
            </DialogContent>
        </Dialog >
    )
}
export default TokenSelectDialog