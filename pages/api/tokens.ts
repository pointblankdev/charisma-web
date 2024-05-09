import { getFenrirBalance, getFenrirTotalSupply, getStakedTokenExchangeRate, getTokenPrices } from '@lib/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function tokens(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(501).json({
            error: {
                code: 'method_unknown',
                message: 'This endpoint only responds to GET'
            }
        });
    }

    const response = await getTokenPrices()
    const odinVelarPrice = Number(response.message[16].price)
    const welshVelarPrice = Number(response.message[14].price)

    const welshBalanceReponse = await getFenrirBalance("liquid-staked-welsh-v2")
    const odinBalanceReponse = await getFenrirBalance("liquid-staked-odin")

    const fenrirTotalSupplyResponse = await getFenrirTotalSupply()

    const amountOutEstimation = (
        (welshVelarPrice * (Number(welshBalanceReponse.value.value) / Number(fenrirTotalSupplyResponse.value.value))) +
        (odinVelarPrice * (Number(odinBalanceReponse.value.value) / Number(fenrirTotalSupplyResponse.value.value)))
    )

    // const welsh = await (await fetch('https://api.alexgo.io/v1/price/token-wcorgi')).json()

    // console.log(welsh.price)

    const swelshv2 = await getStakedTokenExchangeRate('liquid-staked-welsh-v2')
    const sodin = await getStakedTokenExchangeRate('liquid-staked-odin')

    // console.log(swelshv2.value)


    return res.status(200).json({
        statusCode: 200,
        data: [
            {
                symbol: "sWELSH",
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh-v2",
                baseToken: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welshcorgicoin-token",
                exchangeRate: Number(swelshv2.value / 1000000),
            },
            {
                symbol: "sODIN",
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-odin",
                baseToken: "SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn",
                exchangeRate: Number(sodin.value / 1000000),
            },
            {
                symbol: "FENRIR",
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fenrir-corgi-of-ragnarok",
                baseToken: "stx",
                exchangeRate: amountOutEstimation,
            },
        ]
    });
}
