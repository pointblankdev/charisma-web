import { Slider } from '@components/ui/slider';
import StakeButton from '@components/stake/stake-button';
import UnstakeButton from '@components/stake/unstake-button';
import Link from 'next/link';
import { Button } from '@components/ui/button';
import Image from 'next/image';

const StakingControls = ({
    min,
    max,
    onSetTokensSelected,
    tokensSelected,
    contractAddress,
    contractName,
    fungibleTokenName,
    decimals,
    symbol,
    baseTokenContractAddress,
    baseTokenContractName,
    baseFungibleTokenName,
    exchangeRate,
}: any) => {
    const hasRequiredTokens = Math.abs(min) !== Math.abs(max)
    return (
        <div className="flex flex-col space-y-2">
            {hasRequiredTokens && <div className="flex flex-col space-y-2">
                <div className='flex justify-between'>
                    <div>Token Amount</div>
                    <div>{Math.abs(tokensSelected) / Math.pow(10, decimals)} {symbol}</div>
                </div>
                <div className="">
                    <Slider
                        value={[tokensSelected]}
                        defaultValue={[0]}
                        min={min}
                        max={max}
                        step={1}
                        className="w-full"
                        onValueChange={(v: any) => onSetTokensSelected(v[0])}
                    />
                </div>
            </div>}
            <div className="z-20 flex items-center justify-between space-x-1 w-full">
                <Link href="/liquid-staking">
                    <Button variant="ghost" className="z-30">
                        Back
                    </Button>
                </Link>
                {hasRequiredTokens ? <div>
                    <UnstakeButton
                        contractAddress={contractAddress}
                        contractName={contractName}
                        fungibleTokenName={fungibleTokenName}
                        tokens={-tokensSelected}
                        baseTokenContractAddress={baseTokenContractAddress}
                        baseTokenContractName={baseTokenContractName}
                        baseFungibleTokenName={baseFungibleTokenName}
                        exchangeRate={exchangeRate}
                    />
                    <StakeButton
                        contractAddress={contractAddress}
                        contractName={contractName}
                        tokens={tokensSelected}
                        baseTokenContractAddress={baseTokenContractAddress}
                        baseTokenContractName={baseTokenContractName}
                        baseFungibleTokenName={baseFungibleTokenName}
                    />
                </div> : <div className="text-center px-2 text-sm flex space-x-1">
                    <div>You have no {symbol} tokens available.</div>
                    <Link className='flex space-x-1' href='https://app.velar.co/swap' target='_blank'>
                        <div className='flex space-x-1'>
                            <div>Get some on</div>
                            <Image alt='velar logo' src="https://app.velar.co/assets/imgs/velar-logo.svg" height={12} width={12} />
                            <div>Velar</div>
                            <div>to start liquid staking.</div>
                        </div>
                    </Link>
                </div>}
            </div>
        </div>
    )
}

export default StakingControls