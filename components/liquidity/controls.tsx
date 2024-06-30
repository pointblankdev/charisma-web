import { Slider } from '@components/ui/slider';
import AddLiquidityToIndex from '@components/craft/add-liquidity';
import RemoveLiquidityFromIndex from '@components/salvage/remove-liquidity';
import { TimerOffIcon } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@components/ui/tooltip';
import millify from 'millify';

const LiquidityControls = ({ min, max, onSetTokensSelected, tokensSelected, data = {}, tokensRequested, tokensRequired, indexWeight }: any) => {
    return (
        <div className="flex flex-col">
            <Slider
                defaultValue={[0]}
                min={min}
                max={max}
                step={1}
                className="w-full p-4"
                onValueChange={(v: any) => onSetTokensSelected(v[0])}
            />
            <div className="z-20 flex items-center space-x-1">
                {data.isRemoveLiquidityUnlocked ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
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
                                Burning {millify(Math.abs(tokensRequested))} {data.symbol} returns{' '}
                                {millify(Math.abs(tokensRequired[0]))}{' '}
                                {data.metadata?.contains[0].symbol} and{' '}
                                {millify(Math.abs(tokensRequired[1]))} sCHA back to you.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <div className="text-secondary/50 text-sm flex items-center space-x-2">
                        <div>
                            Locked ({data.blocksUntilUnlock} block{data.blocksUntilUnlock !== 1 && `s`})
                        </div>{' '}
                        <TimerOffIcon size={14} className="mt-0.5" />{' '}
                    </div>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <AddLiquidityToIndex
                                amount={tokensSelected}
                                address={data.address}
                                metadata={data.metadata}
                            />
                        </TooltipTrigger>
                        <TooltipContent
                            className={`max-w-[99vw] max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl`}
                        >
                            Minting {millify(Math.abs(tokensRequested))} {data.symbol} requires{' '}
                            {millify(Math.abs(tokensRequired[0]))} {data.metadata?.contains[0].symbol}{' '}
                            and {millify(Math.abs(tokensRequired[1]))} sCHA.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

export default LiquidityControls