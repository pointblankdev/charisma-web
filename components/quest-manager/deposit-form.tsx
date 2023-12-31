/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { SetStateAction, useState } from "react";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import * as btc from "@scure/btc-signer";
import { userSession } from "@components/stacks-session/connect";
import { Button } from "@components/ui/button";
import {
    DevEnvHelper,
    sbtcDepositHelper,
    TESTNET,
    TestnetHelper,
    WALLET_00,
    WALLET_01,
} from "sbtc"


export default function DepositForm() {
    const userData = userSession.loadUserData()
    const [satoshis, setSatoshis] = useState("");

    const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setSatoshis(event.target.value);
    };

    const buildTransaction = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Helper for working with various API and RPC endpoints and getting and processing data
        // Change this depending on what network you are working with
        const testnet = new TestnetHelper();
        // const testnet = new DevEnvHelper();

        // setting BTC address for devnet
        // Because of some quirks with Leather, we need to pull our BTC wallet using the helper if we are on devnet
        // const bitcoinAccountA = await testnet.getBitcoinAccount(WALLET_00);
        // const btcAddress = bitcoinAccountA.wpkh.address;
        // const btcPublicKey = bitcoinAccountA.publicKey.buffer.toString();

        // setting BTC address for testnet
        // here we are pulling directly from our authenticated wallet
        const btcAddress = userData.profile.btcAddress.p2wpkh.testnet;
        const btcPublicKey = userData.profile.btcPublicKey.p2wpkh;

        const utxos = await testnet.fetchUtxos(btcAddress);

        // If we are working via testnet
        // get sBTC deposit address from bridge API
        const response = await fetch(
            "https://bridge.sbtc.tech/bridge-api/testnet/v1/sbtc/init-ui"
        );
        const data = await response.json();
        console.log(data)
        const sbtcWalletAddress = data.sbtcContractData.sbtcWalletAddress;

        // if we are working via devnet we can use the helper to get the sbtc wallet address, which is associated with the first wallet
        // const sbtcWalletAccount = await testnet.getBitcoinAccount(WALLET_00);
        // const sbtcWalletAddress = sbtcWalletAccount.tr.address;

        const tx = await sbtcDepositHelper({
            // comment this line out if working via devnet
            network: TESTNET,
            // sbtcWalletAddress,
            stacksAddress: userData.profile.stxAddress.testnet,
            amountSats: satoshis as any,
            // we can use the helper to get an estimated fee for our transaction
            feeRate: await testnet.estimateFeeRate("low"),
            // the helper will automatically parse through these and use one or some as inputs
            utxos,
            // where we want our remainder to be sent. UTXOs can only be spent as is, not divided, so we need a new input with the difference between our UTXO and how much we want to send
            bitcoinChangeAddress: btcAddress,
        });

        // convert the returned transaction object into a PSBT for Leather to use
        const psbt = tx.toPSBT();
        const requestParams = {
            publicKey: btcPublicKey,
            hex: bytesToHex(psbt),
        };
        // Call Leather API to sign the PSBT and finalize it
        const txResponse = await (window as any).btc.request("signPsbt", requestParams);
        const formattedTx = btc.Transaction.fromPSBT(
            hexToBytes(txResponse.result.hex)
        );
        formattedTx.finalize();

        // Broadcast it using the helper
        const finalTx = await testnet.broadcastTx(formattedTx);

        // Get the transaction ID
        console.log(finalTx);
    };

    return (
        <form className="flex items-center justify-center space-x-4">
            <input
                type="number"
                placeholder="Amount of BTC to deposit"
                className="w-1/3 px-4 py-2 text-gray-300 bg-gray-700 rounded focus:outline-none focus:border-orange-500"
                value={satoshis}
                onChange={handleInputChange}
            />
            <Button
                type="submit"
                className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 focus:outline-none"
                onClick={buildTransaction}
            >
                Deposit BTC
            </Button>
        </form>
    );
}
