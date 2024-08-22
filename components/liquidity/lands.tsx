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
    const tokenPrecision = Math.pow(10, metadata.wraps.decimals);
    const [manualInput, setManualInput] = useState(tokensSelected / tokenPrecision);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) {
            value = 0;
        }
        value = Math.max(min / tokenPrecision, Math.min(value, max / tokenPrecision));
        setManualInput(value);
        onSetTokensSelected(value * tokenPrecision);
    };

    const handleSliderChange = (value: number[]) => {
        setManualInput(value[0] / tokenPrecision);
        onSetTokensSelected(value[0]);
    };

    return (
        <div className="flex flex-col space-y-2">
            {Math.abs(min) !== Math.abs(max) && (
                <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                        <div>Token Amount</div>
                        <div>{(tokensSelected / tokenPrecision).toLocaleString()} {metadata.wraps.symbol}</div>
                    </div>
                    <div className="">
                        <Slider
                            value={[tokensSelected]}
                            defaultValue={[0]}
                            min={min}
                            max={max}
                            step={tokenPrecision}
                            className="w-full"
                            onValueChange={handleSliderChange}
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="manual-input" className="text-sm font-medium text-gray-700">
                            Enter Manually
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="manual-input"
                                type="number"
                                value={manualInput}
                                min={min / tokenPrecision}
                                max={max / tokenPrecision}
                                step="1"
                                onChange={handleInputChange}
                                className="p-2 border rounded-md w-full text-red-700"
                            />
                            <span>{metadata.wraps.symbol}</span>
                        </div>
                    </div>
                </div>
            )}
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
    );
};

export default LandControls;
