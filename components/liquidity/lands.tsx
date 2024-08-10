import { Slider } from '@components/ui/slider';
import StakeButton from '@components/stake/stake-button';
import UnstakeButton from '@components/stake/unstake-button';
import Link from 'next/link';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import UnwrapLandButton from '@components/stake/unwrap-land-button';
import WrapLandButton from '@components/stake/wrap-land-button';

const LandControls = ({
    min,
    max,
    onSetTokensSelected,
    tokensSelected,
    metadata
}: any) => {
    const hasRequiredTokens = Math.abs(min) !== Math.abs(max)
    return (
        <div className="flex flex-col space-y-2">
            {hasRequiredTokens && <div className="flex flex-col space-y-2">
                <div className='flex justify-between'>
                    <div>Token Amount</div>
                    <div>{Math.abs(tokensSelected) / Math.pow(10, metadata.wraps.decimals)} {metadata.wraps.symbol}</div>
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
            <div className="z-20 flex items-center justify-between w-full space-x-1">
                <Link href="/staking">
                    <Button variant="ghost" className="z-30">
                        Back
                    </Button>
                </Link>
                <div>
                    <UnwrapLandButton
                        tokens={-tokensSelected}
                        baseTokenContractAddress={metadata.wraps.ca}
                        baseFungibleTokenName={metadata.wraps.asset}
                    />
                    <WrapLandButton
                        tokens={tokensSelected}
                        baseTokenContractAddress={metadata.wraps.ca}
                        baseFungibleTokenName={metadata.wraps.asset}
                    />
                </div>
            </div>
        </div>
    )
}

export default LandControls