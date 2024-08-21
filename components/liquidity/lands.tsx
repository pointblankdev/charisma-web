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
    metadata,
    hadLand
}: any) => {
    const hasRequiredTokens = Math.abs(min) !== Math.abs(max)

    // if using the burn token, reduce the max by 10 to prevent not having enough tokens to pay the burn fee
    const burnTokenContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma'
    const burnFee = 10000000 // 10 tokens
    const isUsingBurnToken = metadata.wraps.ca === burnTokenContract
    if (isUsingBurnToken) max -= burnFee

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
                    <UnwrapLandButton tokens={-tokensSelected} metadata={metadata} />
                    <WrapLandButton tokens={tokensSelected} metadata={metadata} hadLand={hadLand} />
                </div>
            </div>
        </div>
    )
}

export default LandControls