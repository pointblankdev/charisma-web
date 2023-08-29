import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { getAllWallets } from '@lib/cms-api';
import { updateWalletAmount } from '@lib/db-api';
import { callReadOnlyFunction, principalCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import _ from 'lodash';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function updateWalletData(
    req: NextApiRequest,
    res: NextApiResponse<ConfUser | ErrorResponse>
) {
    try {

        const wallets = await getAllWallets()
        let count = 0

        for (const wallet of _.shuffle(wallets)) {
            count++

            const getBalanceResponse: any = await callReadOnlyFunction({
                network: new StacksMainnet(),
                contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
                contractName: "dme000-governance-token",
                functionName: "get-balance",
                functionArgs: [principalCV(wallet.stxaddress)],
                senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
            });
            const amount = Number(getBalanceResponse.value.value)

            const resp = await updateWalletAmount(wallet.id, amount)

            console.log(resp)

            if (count > 49) {
                break;
            }
        }

    } catch (error: any) {
        console.error(error.message)
    }

    return res.status(200).json({});
}
