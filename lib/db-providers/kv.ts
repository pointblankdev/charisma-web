import { getDecimals, getSymbol } from '@lib/stacks-api';
import { kv } from '@vercel/kv';
import _ from 'lodash';

export async function getContractMetadata(ca: string): Promise<any> {
  return await kv.get(`ca:${ca}`);
}

export async function addIndexContract(ca: string): Promise<void> {
  await kv.sadd('tokens:contracts', ca);
  await kv.sadd(`indexes`, ca);
}

export async function removeIndexContract(ca: string): Promise<void> {
  await kv.srem(`indexes`, ca);
}

export async function getIndexContracts(): Promise<any> {
  return await kv.smembers('indexes');
}

export async function setContractMetadata(ca: string, data: any): Promise<void> {
  const existingMetadata = await getContractMetadata(ca);
  const newMetadata = { ...existingMetadata, ...data };
  await kv.sadd('tokens:contracts', ca);
  let decimals, symbol;
  try {
    decimals = await getDecimals(ca);
    symbol = await getSymbol(ca);
  } catch (error) {
    console.error(error);
  }
  if (decimals) {
    newMetadata.decimals = decimals;
  }
  if (symbol) {
    newMetadata.symbol = symbol;
  }
  await kv.set(`ca:${ca}`, newMetadata);
  await kv.set(`metadata:${ca}`, {
    ...newMetadata,
    lastUpdated: Date.now()
  });
}

export async function getGlobalState(key: string): Promise<any> {
  return await kv.get(`global:${key}`);
}

export async function cacheGlobalState(key: string, json: any): Promise<void> {
  await kv.set(`global:${key}`, JSON.stringify(json));
}

// experience

export async function updateExperienceLeaderboard(experience: number, address: any) {
  try {
    await kv.zadd('leaderboard:exp', { score: experience, member: address });
  } catch (error) {
    console.error('Error updating player score:', error);
  }
}

export async function getExperienceLeaderboard(startRank: number, endRank: number) {
  try {
    const leaderboard = await kv.zrange('leaderboard:exp', startRank, endRank, {
      withScores: true,
      rev: true
    });
    const resultArray = [];

    for (let i = 0; i < leaderboard.length; i += 2) {
      const address: any = leaderboard[i]; // The stored JSON string
      const experience: any = leaderboard[i + 1]; // The corresponding score
      const data: any = {
        rank: i / 2 + 1,
        address: address,
        experience: Number(experience)
      };
      resultArray.push(data);
    }
    return resultArray;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function clearLeaderboard() {
  try {
    return await kv.del('leaderboard:exp');
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}

// rewards

export async function incrementRewardLeaderboard(token: string, amount: number, data: any) {
  try {
    await kv.zincrby(`leaderboard:rewards:${token}`, amount, data);
  } catch (error) {
    console.error('Error updating player score:', error);
  }
}

export async function getRewardLeaderboard(token: string, startRank: number, endRank: number) {
  try {
    const leaderboard = await kv.zrange(`leaderboard:rewards:${token}`, startRank, endRank, {
      withScores: true,
      rev: true
    });
    const resultArray = [];

    for (let i = 0; i < leaderboard.length; i += 2) {
      const address: any = leaderboard[i]; // The stored JSON string
      const amount: any = leaderboard[i + 1]; // The corresponding score
      const data: any = {
        rank: i / 2 + 1,
        address: address,
        amount: Number(amount)
      };
      resultArray.push(data);
    }
    return resultArray;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function clearRewardsLeaderboard(token: string) {
  try {
    return await kv.del(`leaderboard:rewards:${token}`);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}

// nft collection metadata

export async function getNftCollections(): Promise<any> {
  return await kv.smembers('nfts');
}

export async function addNftCollection(ca: string): Promise<any> {
  return await kv.sadd('nfts', ca);
}

export async function removeNftCollection(ca: string): Promise<any> {
  return await kv.srem('nfts', ca);
}

export async function getNftCollectionMetadata(ca: string): Promise<any> {
  return await kv.get(`nft:${ca}`);
}

export async function setNftCollectionMetadata(ca: string, data: any): Promise<void> {
  await kv.set(`nft:${ca}`, data);
}

// nft metadata

export async function getNftMetadata(ca: string, id: string): Promise<any> {
  return await kv.get(`nft:${ca}:${id}`);
}

export async function setNftMetadata(ca: string, id: string, data: any): Promise<void> {
  await kv.set(`nft:${ca}:${id}`, data);
}

// players

export async function getPlayers(): Promise<any> {
  return await kv.smembers('players');
}

export async function addPlayer(player: string): Promise<any> {
  return await kv.sadd('players', player);
}

export async function removePlayer(player: string): Promise<any> {
  return await kv.srem('players', player);
}

// is player in set
export async function isPlayer(player: string): Promise<boolean> {
  return (await kv.sismember('players', player)) ? true : false;
}

// player red/blue pilled

export async function getPlayerPill(player: string): Promise<any> {
  return await kv.get(`player:${player}:pill`);
}

export async function setPlayerPill(player: string, pill: string): Promise<any> {
  return (await kv.set(`player:${player}:pill`, pill)) || false;
}

// player tokens

export async function getPlayerTokens(contractAddress: string, player: string): Promise<any> {
  return (await kv.get(`player:${player}tokens:${contractAddress}`)) || 0;
}

export async function setPlayerTokens(
  contractAddress: string,
  player: string,
  amount: number
): Promise<any> {
  return await kv.set(`player:${player}tokens:${contractAddress}`, amount);
}

// player transfers

export async function trackTransferEvent(event: any) {
  const player = event.sender;
  const timestamp = Date.now();
  const transferEvent = { timestamp, ...event };

  // store the swap event in a sorted set
  await kv.zadd(`player:${player}:transfers`, { score: timestamp, member: transferEvent });

  // Add player to the list of known players
  await kv.sadd('players', player);
}

// player mints

export async function trackMintEvent(event: any) {
  const player = event.sender;
  const timestamp = Date.now();
  const mintEvent = { timestamp, ...event };

  // store the swap event in a sorted set
  await kv.zadd(`player:${player}:mints`, { score: timestamp, member: mintEvent });

  // Add player to the list of known players
  await kv.sadd('players', player);
}

// player burns

export async function trackBurnEvent(event: any) {
  const player = event.sender;
  const timestamp = Date.now();
  const burnEvent = { timestamp, ...event };

  // store the swap event in a sorted set
  await kv.zadd(`player:${player}:burns`, { score: timestamp, member: burnEvent });

  // Add player to the list of known players
  await kv.sadd('players', player);
}

export async function getPlayerEventData(player: string): Promise<any> {
  const transfers = await kv.zrange(`player:${player}:transfers`, 0, 999, { rev: true });
  const mints = await kv.zrange(`player:${player}:mints`, 0, 999, { rev: true });
  const burns = await kv.zrange(`player:${player}:burns`, 0, 999, { rev: true });

  return {
    player: player,
    transfers: transfers,
    mints: mints,
    burns: burns
  };
}

export async function clearPlayerEventData(player: string): Promise<void> {
  // clear all items from list
  await kv.del(`player:${player}:transfers`);
  await kv.del(`player:${player}:mints`);
  await kv.del(`player:${player}:burns`);
}

// proposals

export async function getCachedProposals(): Promise<any> {
  return await kv.smembers('proposals');
}

export async function addCachedProposal(proposal: string): Promise<any> {
  return await kv.sadd('proposals', proposal);
}

export async function removeCachedProposal(proposal: string): Promise<any> {
  return await kv.srem('proposals', proposal);
}

// proposals-users events

// { for: 18000000, against: 2000000 }

export async function getVoteData(proposal: string, userAddress: string): Promise<any> {
  const data = await kv.get(`vote-data:${proposal}:${userAddress}`);
  // merge into object of for and against
  const response = _.merge({ for: 0, against: 0 }, data);
  return response;
}

export async function setVoteData(proposal: string, userAddress: string, data: any): Promise<void> {
  await kv.set(`vote-data:${proposal}:${userAddress}`, data);
}

// swap event timeseries data

interface PoolData {
  symbol: string;
  token0: string;
  token1: string;
  swaps: any[];
}

export async function saveSwapEvent(event: any) {
  const poolId = event['id'];
  const timestamp = Date.now();

  const swapEvent = { timestamp, ...event };

  // store the swap event in a sorted set
  await kv.zadd(`pool:${poolId}:swaps`, {
    score: swapEvent.pool['block-height'],
    member: swapEvent
  });

  // Update pool metadata if needed
  await kv.hset(`pool:${poolId}:meta`, {
    symbol: event.pool.symbol,
    token0: event.pool.token0,
    token1: event.pool.token1
  });

  // Add pool to the list of known pools
  await kv.sadd('pool:ids', poolId);
}

export async function getPoolData(poolId: string): Promise<PoolData> {
  const swaps = await kv.zrange(`pool:${poolId}:swaps`, 0, 999, { rev: true });
  const meta: any = await kv.hgetall(`pool:${poolId}:meta`);

  return {
    symbol: meta?.symbol,
    token0: meta?.token0,
    token1: meta?.token1,
    swaps: swaps
  };
}

export async function clearSwapData(poolId: string): Promise<void> {
  // clear all items from list
  await kv.del(`pool:${poolId}:swaps`);
}

// meme engine calibration data
export async function saveTapEvent(event: any) {
  const timestamp = Date.now();
  const tapEvent = { event, timestamp };
  // store the tap event in a list
  await kv.lpush(`taps`, tapEvent);
}

export async function getTapData() {
  const taps = await kv.lrange(`taps`, 0, 999);
  return taps;
}
