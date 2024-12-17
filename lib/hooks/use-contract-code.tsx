import { useCallback, useState } from 'react';
import { generateContractCode, getTokenUri } from '@lib/codegen/dexterity';

type CodeGenParams = {
  fullContractName: string;
  tokenAContract: string;
  tokenBContract: string;
  lpTokenName: string;
  lpTokenSymbol: string;
  lpRebatePercent: number;
  initialLiquidityA: number;
  initialLiquidityB: number;
};

export function useContractCode() {
  const [contractCode, setContractCode] = useState('');

  const updateContractCode = useCallback((params: CodeGenParams) => {
    if (!params.fullContractName) return;
    const code = generateContractCode({
      tokenUri: getTokenUri(params.fullContractName),
      tokenAContract: params.tokenAContract,
      tokenBContract: params.tokenBContract,
      lpTokenName: params.lpTokenName,
      lpTokenSymbol: params.lpTokenSymbol,
      lpRebatePercent: params.lpRebatePercent,
      initialLiquidityA: params.initialLiquidityA,
      initialLiquidityB: params.initialLiquidityB
    });
    setContractCode(code);
  }, []);

  return { contractCode, updateContractCode };
}
