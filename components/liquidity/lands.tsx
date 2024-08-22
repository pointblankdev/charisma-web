import { useState } from 'react';
import { Slider } from '@components/ui/slider';
import Link from 'next/link';
import { Button } from '@components/ui/button';
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
    const hasRequiredTokens = Math.abs(min) !== Math.abs(max);
    const [manualInput, setManualInput] = useState(tokensSelected);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) {
            value = 0;
        }
        value = Math.max(min, Math.min(value, max));
        setManualInput(value);
        onSetTokensSelected(value);
    };

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
                        onValueChange={(v: any) => {
                            setManualInput(v[0]);
                            onSetTokensSelected(v[0]);
                        }}
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <label htmlFor="manual-input" className="font-medium text-gray-700 mt-4">
                        Enter Manually
                    </label>
                    <input
                        type="number"
                        value={manualInput}
                        min={min}
                        max={max}
                        onChange={handleInputChange}
                        className="p-2 border rounded-md w-full text-red-700"
                    />
                    <span>{metadata.wraps.symbol}</span>
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

export default LandControls;
