import { Pool } from '../pool-helpers';
import { contractPrincipalCV, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import { network } from '@components/stacks-session/connect';

interface ContractCallArgs {
  pool: Pool;
  stxAddress: string;
  amount0: string;
  amount1: string;
  onFinish: (data: any) => void;
  onCancel: () => void;
}

interface RemoveLiquidityArgs extends ContractCallArgs {
  lpTokensToRemove: number;
}

export const calculateTokenAmounts = (
  pool: Pool,
  sliderValue: number,
  balance0: number,
  balance1: number
) => {
  const reserve0 = pool.poolData.reserve0;
  const reserve1 = pool.poolData.reserve1;

  // Calculate maximum amounts based on balances and pool ratio
  const maxAmount0ByBalance = balance0;
  const maxAmount1ByBalance = balance1;
  const maxAmount0ByRatio = (maxAmount1ByBalance * reserve0) / reserve1;
  const maxAmount1ByRatio = (maxAmount0ByBalance * reserve1) / reserve0;

  // Determine limiting token and maximum amounts
  let maxAmount0, maxAmount1, limitingToken;
  if (maxAmount0ByRatio <= maxAmount0ByBalance) {
    maxAmount0 = maxAmount0ByRatio;
    maxAmount1 = maxAmount1ByBalance;
    limitingToken = 'token1';
  } else {
    maxAmount0 = maxAmount0ByBalance;
    maxAmount1 = maxAmount1ByRatio;
    limitingToken = 'token0';
  }

  // Calculate amounts based on slider value
  const amount0 = (maxAmount0 * sliderValue) / 100;
  const amount1 = (maxAmount1 * sliderValue) / 100;

  return {
    amount0: amount0.toFixed(pool.token0.metadata.decimals),
    amount1: amount1.toFixed(pool.token1.metadata.decimals),
    limitingToken
  };
};

export const calculateRemovalAmounts = (
  pool: Pool,
  sliderValue: number,
  lpTokenBalance: number,
  userShareOfPool: number
) => {
  const userReserve0 =
    (pool.poolData.reserve0 * userShareOfPool) / 10 ** pool.token0.metadata.decimals;
  const userReserve1 =
    (pool.poolData.reserve1 * userShareOfPool) / 10 ** pool.token1.metadata.decimals;

  const share = lpTokenBalance > 0 ? sliderValue / 100 : 0;
  const amount0 = (userReserve0 * share).toFixed(pool.token0.metadata.decimals);
  const amount1 = (userReserve1 * share).toFixed(pool.token1.metadata.decimals);
  const selectedLpAmount = Math.floor(lpTokenBalance * share);

  return { amount0, amount1, selectedLpAmount };
};

export const createAddLiquidityTransaction = ({
  pool,
  stxAddress,
  amount0,
  amount1,
  onFinish,
  onCancel
}: ContractCallArgs): any => {
  const postConditions: any[] = [];

  // Add post conditions for token0
  if (pool.token0.symbol !== 'STX') {
    const amount0BigInt = BigInt(
      Math.floor(parseFloat(amount0) * 10 ** pool.token0.metadata.decimals)
    );
    postConditions.push(
      Pc.principal(stxAddress)
        .willSendLte(amount0BigInt)
        .ft(
          pool.token0.contractId as any,
          pool.token0.audit.fungibleTokens[0].tokenIdentifier as string
        )
    );
  } else {
    const amount0BigInt = BigInt(
      Math.floor(parseFloat(amount0) * 10 ** pool.token0.metadata.decimals)
    );
    postConditions.push(Pc.principal(stxAddress).willSendLte(amount0BigInt).ustx());
  }

  // Add post conditions for token1
  if (pool.token1.symbol !== 'STX') {
    const amount1BigInt = BigInt(
      Math.floor(parseFloat(amount1) * 10 ** pool.token1.metadata.decimals)
    );
    postConditions.push(
      Pc.principal(stxAddress)
        .willSendLte(amount1BigInt)
        .ft(
          pool.token1.contractId as any,
          pool.token1.audit.fungibleTokens[0].tokenIdentifier as string
        )
    );
  } else {
    const amount1BigInt = BigInt(
      Math.floor(parseFloat(amount1) * 10 ** pool.token1.metadata.decimals)
    );
    postConditions.push(Pc.principal(stxAddress).willSendLte(amount1BigInt).ustx());
  }

  return {
    network,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'univ2-router',
    functionName: 'add-liquidity',
    functionArgs: [
      uintCV(pool.poolData.id),
      contractPrincipalCV(
        pool.token0.contractId.split('.')[0],
        pool.token0.contractId.split('.')[1]
      ),
      contractPrincipalCV(
        pool.token1.contractId.split('.')[0],
        pool.token1.contractId.split('.')[1]
      ),
      contractPrincipalCV(pool.contractId.split('.')[0], pool.contractId.split('.')[1]),
      uintCV(BigInt(Math.floor(parseFloat(amount0) * 10 ** pool.token0.metadata.decimals))),
      uintCV(BigInt(Math.floor(parseFloat(amount1) * 10 ** pool.token1.metadata.decimals))),
      uintCV(1),
      uintCV(1)
    ],
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    onFinish,
    onCancel
  };
};

export const createRemoveLiquidityTransaction = ({
  pool,
  stxAddress,
  lpTokensToRemove,
  onFinish,
  onCancel
}: RemoveLiquidityArgs): any => {
  const postConditions = [
    // LP token post condition
    Pc.principal(stxAddress)
      .willSendLte(lpTokensToRemove)
      .ft(pool.contractId as any, 'lp-token'),

    // Token0 post condition
    pool.token0.symbol !== 'STX'
      ? Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
          .willSendGte(1)
          .ft(
            pool.token0.contractId as any,
            pool.token0.audit.fungibleTokens[0].tokenIdentifier as string
          )
      : Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(1).ustx(),

    // Token1 post condition
    pool.token1.symbol !== 'STX'
      ? Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core')
          .willSendGte(1)
          .ft(
            pool.token1.contractId as any,
            pool.token1.audit.fungibleTokens[0].tokenIdentifier as string
          )
      : Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core').willSendGte(1).ustx()
  ];

  return {
    network,
    contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName: 'univ2-router',
    functionName: 'remove-liquidity',
    functionArgs: [
      uintCV(pool.poolData.id),
      contractPrincipalCV(
        pool.token0.contractId.split('.')[0],
        pool.token0.contractId.split('.')[1]
      ),
      contractPrincipalCV(
        pool.token1.contractId.split('.')[0],
        pool.token1.contractId.split('.')[1]
      ),
      contractPrincipalCV(pool.contractId.split('.')[0], pool.contractId.split('.')[1]),
      uintCV(lpTokensToRemove),
      uintCV(1),
      uintCV(1)
    ],
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    onFinish,
    onCancel
  };
};

export const calculateUserPoolShare = (lpTokenBalance: number, totalSupply: number) => {
  return (lpTokenBalance / totalSupply) * 100;
};
