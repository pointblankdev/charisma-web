import { useState, useEffect } from 'react';
import { callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import Image from 'next/image';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';

const TokenRedemptions = ({ data }: any) => {

    const { doContractCall } = useConnect();
    const { stxAddress } = useGlobalState();
    const { wallet } = useWallet();

    const [claimA, setClaimA] = useState(0);
    const [claimB, setClaimB] = useState(0);
    const [claimC, setClaimC] = useState(0);
    const [claimD, setClaimD] = useState(0);

    const [claims, setClaims] = useState({ a: { value: false }, b: { value: false }, c: { value: false }, d: { value: false } } as any);
    const [hasClaimedA, setHasClaimedA] = useState(false);
    const [hasClaimedB, setHasClaimedB] = useState(false);
    const [hasClaimedC, setHasClaimedC] = useState(false);

    function claimLpIndex(method: string) {
        doContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'lp-index-recovery',
            functionName: method,
            functionArgs: [],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [],
        });
    }

    useEffect(() => {
        if (stxAddress) {
            // Add new contract calls for lp-index-recovery
            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'lp-index-recovery',
                functionName: 'has-claimed-a',
                functionArgs: [principalCV(stxAddress)],
                senderAddress: stxAddress,
            }).then((response: any) => {
                const claimed = cvToJSON(response).value;
                console.log('claimed', claimed);
                setHasClaimedA(claimed);
            }).catch(console.error)

            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'lp-index-recovery',
                functionName: 'has-claimed-b',
                functionArgs: [principalCV(stxAddress)],
                senderAddress: stxAddress,
            }).then((response: any) => {
                const claimed = cvToJSON(response).value;
                setHasClaimedB(claimed);
            }).catch(console.error)

            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'lp-index-recovery',
                functionName: 'has-claimed-c',
                functionArgs: [principalCV(stxAddress)],
                senderAddress: stxAddress,
            }).then((response: any) => {
                const claimed = cvToJSON(response).value;
                setHasClaimedC(claimed);
            }).catch(console.error)
        }
    }, [stxAddress]);


    function depositWelsh(amount: number) {
        if (stxAddress) {
            doContractCall({
                network: network,
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'redemption-vault-v0',
                functionName: "deposit-welsh",
                functionArgs: [uintCV(amount)],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [
                    Pc.principal(stxAddress).willSendLte(amount).ft('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', 'welshcorgicoin') as any,
                ],
            });
        }
    }

    function depositRoo(amount: number) {
        if (stxAddress) {
            doContractCall({
                network: network,
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'redemption-vault-v0',
                functionName: "deposit-roo",
                functionArgs: [uintCV(amount)],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [
                    Pc.principal(stxAddress).willSendLte(amount).ft('SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', 'kangaroo') as any,
                ],
            });
        }
    }

    function redeemWelsh(amount: number) {
        if (stxAddress) {
            doContractCall({
                network: network,
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'redemption-vault-v0',
                functionName: "redeem-welsh",
                functionArgs: [uintCV(amount)],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [
                    Pc.principal(stxAddress).willSendLte(amount).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', 'synthetic-welsh') as any,
                    Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.redemption-vault-v0').willSendLte(amount).ft('SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', 'welshcorgicoin') as any,
                ],
            });
        }
    }

    function redeemRoo(amount: number) {
        if (stxAddress) {
            doContractCall({
                network: network,
                contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
                contractName: 'redemption-vault-v0',
                functionName: "redeem-roo",
                functionArgs: [uintCV(amount)],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [
                    Pc.principal(stxAddress).willSendLte(amount).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', 'synthetic-roo') as any,
                    Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.redemption-vault-v0').willSendLte(amount).ft('SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', 'kangaroo') as any,
                ],
            });
        }
    }

    function claim(method: string) {
        doContractCall({
            network: network,
            contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
            contractName: 'cha-recovery',
            functionName: method,
            functionArgs: [],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [],
        });
    }

    useEffect(() => {
        if (stxAddress) {
            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'cha-recovery',
                functionName: 'get-claim-amount-a',
                functionArgs: [
                    principalCV(stxAddress),
                ],
                senderAddress: stxAddress,
            }).then((response: any) => {
                setClaimA(Number(response?.value?.value))
            }).catch(console.error)
            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'cha-recovery',
                functionName: 'get-claim-amount-b',
                functionArgs: [
                    principalCV(stxAddress),
                ],
                senderAddress: stxAddress,
            }).then((response: any) => {
                setClaimB(Number(response?.value?.value))
            }).catch(console.error)
            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'cha-recovery',
                functionName: 'get-claim-amount-c',
                functionArgs: [
                    principalCV(stxAddress),
                ],
                senderAddress: stxAddress,
            }).then((response: any) => {
                setClaimC(Number(response?.value?.value))
            }).catch(console.error)
            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'cha-recovery',
                functionName: 'get-claim-amount-d',
                functionArgs: [
                    principalCV(stxAddress),
                ],
                senderAddress: stxAddress,
            }).then((response: any) => {
                setClaimD(Number(response?.value?.value))
            }).catch(console.error)

            callReadOnlyFunction({
                network: network,
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
                contractName: 'cha-recovery',
                functionName: 'get-all-claims',
                functionArgs: [
                    principalCV(stxAddress),
                ],
                senderAddress: stxAddress,
            }).then((response: any) => {
                setClaims(cvToJSON(response).value)
            })
        }
    }, [stxAddress]);

    const { balances } = useWallet();

    const iouWelsh: any = balances?.fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh'];
    const iouRoo: any = balances?.fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo'];

    const formatNumber = (num: number) => numeral(num / Math.pow(10, 6)).format('0,0.00');

    return (
        <div className='w-full space-y-8 px-4 sm:px-0'>
            <h2 className="text-xl font-bold mb-4">Synthetic Tokens</h2>
            <div className="flex flex-wrap p-4 sm:p-6 rounded-lg shadow-lg bg-[var(--sidebar)] border border-[var(--accents-7)] sm:space-x-8">

                {['Welsh', 'Roo'].map((token, index) => (
                    <div key={token} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Synthetic {token} (iou{token.toUpperCase()})</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>Total Issued:</div>
                            <div>{formatNumber(data[`synthetic${token}`].issued)}</div>
                            <div>Total Redeemed:</div>
                            <div>{formatNumber(data[`synthetic${token}`].burned)}</div>
                            <div>Redemptions Remaining:</div>
                            <div>{formatNumber(data[`synthetic${token}`].remaining)}</div>
                            <div>Your Balance:</div>
                            <div>{formatNumber(index === 0 ? iouWelsh?.balance : iouRoo?.balance)}</div>
                            <div>Redemptions Available:</div>
                            <div>{formatNumber(data[`synthetic${token}`].available)}</div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <Button onClick={() => index === 0 ? depositWelsh(10000000000) : depositRoo(100000000)} className='w-full'>
                                Donate {index === 0 ? '10k WELSH' : '100 ROO'}
                            </Button>
                            <Button
                                disabled={data[`synthetic${token}`].available === 0 || !wallet.bluePilled}
                                onClick={() => index === 0 ? redeemWelsh(10000000000) : redeemRoo(100000000)}
                                className='w-full bg-blue-800'
                            >
                                Redeem iou{token.toUpperCase()}
                            </Button>
                        </div>
                    </div>
                ))}

                <div className='mt-4 flex flex-col items-center mb-4'>
                    <div className='text-center font-bold mb-2'>Blue Pilled Status</div>
                    {wallet.bluePilled ? <Image src={bluePillFloating} alt='Blue Pill' width={120} height={120} /> : <div className='text-4xl'>❌</div>}
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Token Recovery</h2>
            <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-[var(--sidebar)] border border-[var(--accents-7)] flex flex-wrap sm:flex-nowrap sm:space-x-8">
                {['CHA', 'sCHA', 'wCHA', 'Staked sCHA'].map((tokenType, index) => (
                    <div key={tokenType} className="mb-6 w-full">
                        <h3 className="text-lg font-semibold mb-2">{tokenType}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>Recovered:</div>
                            <div>{formatNumber([claimA, claimB, claimC, claimD][index])}</div>
                            <div>Claimed:</div>
                            <div>{claims[['a', 'b', 'c', 'd'][index]].value ? formatNumber([claimA, claimB, claimC, claimD][index]) : '0'} CHA</div>
                        </div>
                        <div className="mt-2">
                            <Button
                                disabled={claims[['a', 'b', 'c', 'd'][index]].value || ![claimA, claimB, claimC, claimD][index]}
                                onClick={() => claim(`mint-${['a', 'b', 'c', 'd'][index]}`)}
                                className='w-full'
                            >
                                Claim
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold mb-4">Index & LP Token Recovery</h2>
            <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-[var(--sidebar)] border border-[var(--accents-7)] flex w-full flex-wrap sm:flex-nowrap sm:space-x-8">
                <div className="mb-6 w-full">
                    <h3 className="text-lg font-semibold mb-2">Index Tokens (CHA)</h3>
                    <div className="mt-2">
                        <Button
                            disabled={hasClaimedA}
                            onClick={() => claimLpIndex('mint-a')}
                            className='w-full'
                        >
                            Claim
                        </Button>
                    </div>
                </div>
                <div className="mb-6 w-full">
                    <h3 className="text-lg font-semibold mb-2">Velar LP (CHA)</h3>
                    <div className="mt-2">
                        <Button
                            disabled={hasClaimedB}
                            onClick={() => claimLpIndex('mint-b')}
                            className='w-full'
                        >
                            Claim
                        </Button>
                    </div>
                </div>
                <div className="mb-6 w-full">
                    <h3 className="text-lg font-semibold mb-2">Velar LP (synSTX)</h3>
                    <div className="mt-2">
                        <Button
                            disabled={hasClaimedC}
                            onClick={() => claimLpIndex('mint-c')}
                            className='w-full'
                        >
                            Claim
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TokenRedemptions;