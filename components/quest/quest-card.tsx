import Image from 'next/image';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import Link from 'next/link';
import schaImg from '@public/liquid-staked-charisma.png'
import { FungibleConditionCode, makeStandardSTXPostCondition } from '@stacks/transactions';
import stxIcon from '@public/stx-logo.png'
import energyIcon from '@public/lands/img/energy.png'
import TokenSelectDialog from '@components/quest/token-select-dialog';
import { useOpenContractCall } from '@micro-stacks/react';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { uintCV, contractPrincipalCV } from 'micro-stacks/clarity';

const QuestCard = ({ nftCollectionMetadata, contractAddress, lands, stxAddress }: any) => {

    const isMintedOut = nftCollectionMetadata.properties.minted === nftCollectionMetadata.properties.total_supply
    const maxStxSpend = (nftCollectionMetadata.properties.stx_mint_cost * Math.pow(10, 6)) * nftCollectionMetadata.properties.max_mints_per_tx

    const extraPostConditions = []
    if (stxAddress) extraPostConditions.push(makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, maxStxSpend))

    return (
        <Card className="min-h-[600px] flex flex-col bg-black text-primary-foreground border-accent-foreground p-0 relative overflow-hidden rounded-md group/card w-full max-w-3xl opacity-[0.99] shadow-black shadow-2xl">
            <CardHeader className="z-20 p-4 space-y-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="z-30 text-xl font-semibold">{nftCollectionMetadata.properties.collection}</CardTitle>
                        <CardDescription className="z-30 text-sm sm:text-md font-fine text-muted-foreground">
                            {nftCollectionMetadata.description.description || '...'}
                        </CardDescription>
                    </div>
                    <div className='leading-snug sm:mr-4'>
                        <div className={`font-medium text-md whitespace-nowrap ${!isMintedOut ? `animate-pulse` : `text-primary`}`}>{isMintedOut ? `Minted Out` : `Minting Now`}</div>
                        <div className='font-medium text-sm text-center text-primary-foreground/80'>{nftCollectionMetadata.properties.minted || 0} / {nftCollectionMetadata.properties.total_supply}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="z-20 flex-grow p-4 space-y-4">
                <section className='grid grid-cols-1 sm:grid-cols-2'>
                    <div className="z-20">
                        <div className="z-30 text-xl font-semibold">Rewards</div>
                        <div className="z-30 mb-4 text-sm font-fine text-foreground">
                            You will receive:
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="relative">
                                <Image
                                    alt="NFT Icon"
                                    src={nftCollectionMetadata.image}
                                    width={100}
                                    height={100}
                                    className="z-30 w-full rounded-md border shadow-lg"
                                />
                                <div className="absolute px-1 font-bold rounded-full -top-1 -right-3 text-sm md:text-xs bg-accent text-accent-foreground">
                                    NFT
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="z-20 row-span-2 mt-8 sm:mt-0">
                        <div className="z-30 text-xl font-semibold">Quest Details</div>
                        <div className="z-30 mb-4 text-md font-fine text-foreground">
                            {nftCollectionMetadata.properties.overview || '...'}
                        </div>
                    </div>
                </section>

                <section className='grid grid-cols-1 sm:grid-cols-2'>
                    <div className="z-20">
                        <div className="z-30 text-xl font-semibold">Requirements</div>
                        <ul className="list-disc list-inside text-sm leading-snug mb-4">
                            <li>{nftCollectionMetadata.properties.stx_mint_cost || 1} STX mint cost per NFT</li>
                            <li>{nftCollectionMetadata.properties.energy_required || 10} energy cost per NFT</li>
                            <li>sCHA protocol burn per mint</li>
                        </ul>
                        <div className="grid grid-cols-6 gap-4 mt-4">
                            <div className="relative">
                                <Image
                                    alt="STX token"
                                    src={stxIcon}
                                    quality={10}
                                    className="z-30 w-full rounded-full border shadow-lg"
                                />
                                <div className="absolute text-center px-1 min-w-6 font-bold rounded-full -top-1 -right-2 text-sm md:text-xs bg-accent text-accent-foreground">
                                    {nftCollectionMetadata.properties.stx_mint_cost || 1}
                                </div>
                            </div>
                            <div className="relative">
                                <Image
                                    alt="energy"
                                    src={energyIcon}
                                    quality={10}
                                    className="z-30 w-full rounded-full border shadow-lg"
                                />
                                <div className="absolute text-center px-1 min-w-6 font-bold rounded-full -top-1 -right-2 text-sm md:text-xs bg-accent text-accent-foreground">
                                    {nftCollectionMetadata.properties.energy_required || 10}
                                </div>
                            </div>
                            <div className="relative">
                                <Image
                                    alt="sCHA token"
                                    src={schaImg}
                                    quality={10}
                                    className="z-30 w-full rounded-full border shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="z-20 mt-8 sm:mt-0">
                        <div className="z-30 text-xl font-semibold">Key Information</div>
                        <div className='z-30 mb-4 text-sm font-fine text-foreground'>
                            <ul className="list-disc list-inside text-sm leading-snug">
                                <li>Fixed Supply: Only {nftCollectionMetadata.properties.total_supply} NFTs will be minted</li>
                                <li>Mint Limit: Only {nftCollectionMetadata.properties.max_mints_per_tx || 4} NFTs can be minted per tx</li>
                                <li>Claim Amounts: {nftCollectionMetadata.properties.allow_multiple_claims ? 'Unlimited mints per wallet address' : 'One mint per wallet address'} </li>
                                <li>Utility: {nftCollectionMetadata.properties.utility || '...'}</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </CardContent>

            <CardFooter className="z-20 flex justify-between p-4 items-end">
                <Link href="/quests">
                    <Button variant="ghost" className="z-30">
                        Back
                    </Button>
                </Link>

                {nftCollectionMetadata.properties.whitelisted ? <>
                    {!isMintedOut && stxAddress &&
                        <TokenSelectDialog
                            lands={lands}
                            contractId={contractAddress}
                            buttonText={`Mint ${nftCollectionMetadata.properties.collection}`}
                            extraPostConditions={extraPostConditions}
                        />
                    }
                </> :
                    <GovernanceProposalButton metadata={nftCollectionMetadata} />
                    // <Button className="text-sm m-2.5 text-muted-foreground">
                    //     This quest is pending on community approval.
                    // </Button>
                }
            </CardFooter>
            <Image
                src={nftCollectionMetadata.properties.collection_image}
                width={800}
                height={1600}
                alt={'quest-background-image'}
                className={cn(
                    'object-cover',
                    'opacity-10',
                    'aspect-[2/5]',
                    'sm:aspect-square',
                    'flex',
                    'z-10',
                    'absolute',
                    'inset-0',
                    'pointer-events-none'
                )}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-black opacity-10" />
        </Card>
    )
}

export default QuestCard



const GovernanceProposalButton = ({ metadata }: any) => {
    const [address, name] = metadata.properties.proposal_name.split('.')

    const { openContractCall } = useOpenContractCall();

    const { block } = useGlobalState()

    function submitProposal() {
        openContractCall({
            contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
            contractName: 'dme002-proposal-submission',
            functionName: "propose",
            functionArgs: [contractPrincipalCV(address, name), uintCV(Number(block.height) + 15)],
        });
    }
    return (
        <Button onClick={submitProposal}>Request Approval</Button>
    )
}