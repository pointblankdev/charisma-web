import { Slider } from '@components/ui/slider';
import AddLiquidityToIndex from '@components/craft/add-liquidity';
import RemoveLiquidityFromIndex from '@components/salvage/remove-liquidity';
import { TimerOffIcon } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@components/ui/tooltip';
import millify from 'millify';

const LiquidityControls = ({ min, max, onSetTokensSelected, tokensSelected, data = {}, tokensRequested, tokensRequired, indexWeight }: any) => {

    return data.isRemoveLiquidityUnlocked ? (
        <div className="flex flex-col min-w-48">
            <Slider
                defaultValue={[0]}
                min={min < -Math.pow(10, 10) ? -Math.pow(10, 10) : min}
                max={max > Math.pow(10, 10) ? Math.pow(10, 10) : max}
                step={0.000001}
                className="w-full p-4"
                onValueChange={(v: any) => onSetTokensSelected(v[0])}
            />
            <div className="z-20 flex items-center justify-evenly space-x-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className='w-full'>
                            <RemoveLiquidityFromIndex
                                amount={-tokensSelected}
                                address={data.address}
                                metadata={data.metadata}
                                indexWeight={indexWeight}
                            />
                        </TooltipTrigger>
                        <TooltipContent
                            className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
                        >
                            Unwrapping {millify(Math.abs(tokensRequested))} {data.symbol} returns{' '}
                            {millify(Math.abs(tokensRequired[0]))}{' '}
                            {data.metadata?.contains[0].symbol}
                            {tokensRequired[1] && `and ${millify(Math.abs(tokensRequired[1]))} sCHA back to you.`}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className='w-full'>
                            <AddLiquidityToIndex
                                amount={tokensSelected}
                                address={data.address}
                                metadata={data.metadata}
                            />
                        </TooltipTrigger>
                        <TooltipContent
                            className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
                        >
                            Wrapping {millify(Math.abs(tokensRequested))} {data.symbol} requires{' '}
                            {millify(Math.abs(tokensRequired[0]))} {data.metadata?.contains[0].symbol}{' '}
                            {tokensRequired[1] && `and ${millify(Math.abs(tokensRequired[1]))} sCHA.`}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    ) : (
        <div className="m-2">
            <div className="text-secondary/50 text-sm flex items-center space-x-2">
                <div>
                    Liquidity Locked (for {data.blocksUntilUnlock} more block{data.blocksUntilUnlock !== 1 && `s`})
                </div>{' '}
                <TimerOffIcon size={14} className="mt-0.5 animate-pulse" />{' '}
            </div>
        </div>
    )
}

export default LiquidityControls