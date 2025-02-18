import { addNftCollection, getNftCollectionMetadata, setNftCollectionMetadata, setNftMetadata } from '@lib/redis/kv';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

type NFTItem = {
    name: string;
    amount: string;
    image_url: string;
};

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i] as any, array[j] as any] = [array[j], array[i]];
    }
    return array;
}

export default async function nftCollectionMetadataApi(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    let response, code = 200;
    try {
        const ca = req.query.ca as string;
        if (req.method === 'POST') {
            await setNftCollectionMetadata(ca, req.body);
            response = await getNftCollectionMetadata(ca);

            if (req.body.properties.items) {
                await addNftCollection(ca);

                const items: NFTItem[] = req.body.properties.items;
                let allNFTs: { name: string; image: string }[] = [];


                // Create an array of all NFTs
                items.forEach(item => {
                    for (let i = 0; i < parseInt(item.amount); i++) {
                        allNFTs.push({ name: item.name, image: item.image_url });
                    }
                });

                // Shuffle the array of all NFTs
                allNFTs = shuffleArray(allNFTs);

                // Assign IDs and set metadata for each NFT
                for (let i = 0; i < allNFTs.length; i++) {
                    const nftId = (i + 1).toString();
                    const { name, image } = allNFTs[i] as { name: string; image: string };
                    setNftMetadata(ca, nftId, {
                        name: `${name} #${nftId}`,
                        image: image
                    });
                }
            } else {
                console.log('Unique NFT collection detected')
            }

        } else if (req.method === 'GET') {
            response = await getNftCollectionMetadata(ca);
        } else {
            code = 501;
            response = {
                error: {
                    code: 'method_unknown',
                    message: 'This endpoint only responds to GET and POST'
                }
            };
        }
    } catch (error: any) {
        console.error(error);
        response = { error: error.message || 'An unknown error occurred' };
        code = error.response?.status || 500;
    }

    return res.status(code).json(response);
}