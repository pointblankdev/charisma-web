// import from auto-generated types
import { contracts } from './types';
import { contractFactory } from '@clarigen/core';
import { useOpenContractCall } from '@micro-stacks/react';

const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master';
export const dungeonMasterContract = contractFactory(contracts.dungeonMaster, contractAddress);


// export async function getOwner(id: number | bigint) {
//     // `response` is type:
//     // `{ isOk: true; value: string } | { isOk: false, value: bigint }`
//     const response = await clarigen.ro(nftContract.getOwner(id));
//     if (response.isOk) {
//         // `response.value` is a string
//         return response.value;
//     }
//     // `response.value` is a bigint
//     throw new Error(`Unexpected error: ${response.value}`);
// }

// export const TransferTx = () => {
//     const { openContractCall } = useOpenContractCall();
//     const id = 1;
//     const sender = 'SP...';
//     const recipient = 'SP...';

//     const handleOpenContractCall = async () => {
//         await openContractCall({
//             ...nftContract.transfer({
//                 id,
//                 sender,
//                 recipient,
//             }),
//             onFinish: async data => {
//                 console.log('Finished!', data);
//             },
//         });
//     };

//     return <button onClick={ () => handleOpenContractCall() }> Transfer </button>;
// };