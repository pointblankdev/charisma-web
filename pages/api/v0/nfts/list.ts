// pages/api/nft-ownership.js
import { getCollectionSize, getNftOwner } from '@lib/hiro/stacks-api';
import { kv } from '@vercel/kv';

const CACHE_DURATION = 60 * 60 * 24; // 1 day in seconds

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contractAddress, userAddress } = req.query;

    // Validate inputs
    if (!contractAddress || !userAddress) {
      return res.status(400).json({ error: 'Contract address and user address are required' });
    }

    // Create a unique cache key for this contract + user combination
    const cacheKey = `nft-ownership:${contractAddress}:${userAddress}`;

    // Try to get cached data
    const cachedData = await kv.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        cached: true
      });
    }

    // If no cached data, fetch fresh data
    const totalSupply = await getCollectionSize(contractAddress);

    if (!totalSupply) {
      return res.status(404).json({ error: 'No NFTs found in collection' });
    }

    // Array to store owned NFT IDs
    const ownedNfts = [];

    // Check ownership for each token ID
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const owner = await getNftOwner(contractAddress, tokenId);
        console.log(`Token ${tokenId} owner:`, owner);

        // Check if the current owner matches our user
        if (owner === userAddress) {
          ownedNfts.push(tokenId);
        }
      } catch (error) {
        console.error(`Error checking token ${tokenId}:`, error);
        continue;
      }
    }

    // Prepare response data
    const responseData = {
      owner: userAddress,
      contract: contractAddress,
      totalSupply,
      ownedTokenIds: ownedNfts,
      count: ownedNfts.length,
      lastUpdated: new Date().toISOString()
    };

    // Cache the data
    await kv.set(cacheKey, responseData, {
      ex: CACHE_DURATION // Set expiration time in seconds
    });

    // Return the response
    return res.status(200).json({
      ...responseData,
      cached: false
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
