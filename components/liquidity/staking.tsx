import { Slider } from '@components/ui/slider';
import StakeButton from '@components/stake/stake-button';
import UnstakeButton from '@components/stake/unstake-button';
import Link from 'next/link';
import { Button } from '@components/ui/button';

const StakingControls = ({
    min,
    max,
    onSetTokensSelected,
    tokensSelected,
    contractAddress,
    contractName,
    decimals,
    symbol,
    baseTokenContractAddress,
    baseTokenContractName,
    baseFungibleTokenName,
}: any) => {
    return (
        <div className="flex flex-col space-y-2">
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
            <div className="z-20 flex items-center justify-between space-x-1 w-full">
                <Link href="/liquid-staking">
                    <Button variant="ghost" className="z-30">
                        Back
                    </Button>
                </Link>
                <div>
                    <UnstakeButton
                        contractAddress={contractAddress}
                        contractName={contractName}
                        tokens={-tokensSelected}
                        baseTokenContractAddress={baseTokenContractAddress}
                        baseTokenContractName={baseTokenContractName}
                        baseFungibleTokenName={baseFungibleTokenName}
                    />
                    <StakeButton
                        contractAddress={contractAddress}
                        contractName={contractName}
                        tokens={tokensSelected}
                        baseTokenContractAddress={baseTokenContractAddress}
                        baseTokenContractName={baseTokenContractName}
                        baseFungibleTokenName={baseFungibleTokenName}
                    />
                </div>
            </div>
        </div>
    )
}

export default StakingControls