import { useState, useEffect } from 'react';
import { useOpenContractCall } from '@micro-stacks/react';
import { useAccount } from '@micro-stacks/react';
import { callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from "@stacks/transactions";
import { Button } from "@components/ui/button";
import Image from 'next/image';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';

const TokenRedemptions = ({ data }: any) => {

    const { openContractCall } = useOpenContractCall();
    const { stxAddress } = useAccount();
    const { wallet } = useWallet();

    const [claimA, setClaimA] = useState(0);
    const [claimB, setClaimB] = useState(0);
    const [claimC, setClaimC] = useState(0);
    const [claimD, setClaimD] = useState(0);

    const [claims, setClaims] = useState({ a: { value: false }, b: { value: false }, c: { value: false }, d: { value: false } });


    function depositWelsh(amount: number) {
        if (stxAddress) {
            openContractCall({
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
            openContractCall({
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
            openContractCall({
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
            openContractCall({
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
        openContractCall({
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

    return (
        <div className='max-w-5xl space-y-4'>
            <div className="flex w-full p-6 rounded-lg shadow-lg bg-gray-900/80">
                <div className='grid grid-cols-3 text-right grow'>
                    <div className='text-left'></div>
                    <div>Synthetic Welsh (iouWELSH)</div>
                    <div>Synthetic Roo (iouROO)</div>

                    <div className='text-left'>Total Issued</div>
                    <div>{data.syntheticWelsh.issued / Math.pow(10, 6)}</div>
                    <div>{data.syntheticRoo.issued / Math.pow(10, 6)}</div>

                    <div className='text-left'>Total Redeemed</div>
                    <div>{data.syntheticWelsh.burned / Math.pow(10, 6)}</div>
                    <div>{data.syntheticRoo.burned / Math.pow(10, 6)}</div>

                    <div className='text-left'>Redemptions Remaining</div>
                    <div>{data.syntheticWelsh.remaining / Math.pow(10, 6)}</div>
                    <div>{data.syntheticRoo.remaining / Math.pow(10, 6)}</div>

                    <div className='mt-4 text-left'>Your Balances</div>
                    <div className='mt-4'>{iouWelsh?.balance / Math.pow(10, 6) || 0}</div>
                    <div className='mt-4'>{iouRoo?.balance / Math.pow(10, 6) || 0}</div>

                    <div className='text-left'>Redemptions Available</div>
                    <div>{data.syntheticWelsh.available / Math.pow(10, 6)}</div>
                    <div>{data.syntheticRoo.available / Math.pow(10, 6)}</div>

                    <div className='mt-4 text-left'>Donate Tokens</div>
                    <div className='mt-4'><Button onClick={() => depositWelsh(10000000000)} className='h-6' >Donate 10k WELSH</Button></div>
                    <div className='mt-4'><Button onClick={() => depositRoo(100000000)} className='h-6' >Donate 100 ROO</Button></div>

                    <div className='mt-4 text-left'>Redeem Tokens</div>
                    <div className='mt-4'><Button disabled={data.syntheticWelsh.available === 0 || !wallet.bluePilled} onClick={() => redeemWelsh(10000000000)} className='h-6 bg-blue-800' >Redeem iouWELSH</Button></div>
                    <div className='mt-4'><Button disabled={data.syntheticRoo.available === 0 || !wallet.bluePilled} onClick={() => redeemRoo(100000000)} className='h-6 bg-blue-800' >Redeem iouROO</Button></div>
                </div>
                <div className='ml-6'>
                    <div className='text-center'>Blue Pilled</div>
                    {wallet.bluePilled ? <Image src={bluePillFloating} alt='Blue Pill' width={120} height={120} /> : <div className='m-2 text-center'>❌</div>}
                </div>
            </div>

            <div className="p-6 mx-auto space-y-8 rounded-lg shadow-lg bg-gray-900/80">
                <div className='grid grid-cols-5'>
                    <div></div>
                    <div>CHA</div>
                    <div>sCHA</div>
                    <div>wCHA</div>
                    <div>Staked sCHA</div>

                    <div>Recovered</div>
                    <div>{!claims.a.value ? numeral(claimA / Math.pow(10, 6)).format('0.0a') : 0}</div>
                    <div>{!claims.b.value ? numeral(claimB / Math.pow(10, 6)).format('0.0a') : 0}</div>
                    <div>{!claims.c.value ? numeral(claimC / Math.pow(10, 6)).format('0.0a') : 0}</div>
                    <div>{!claims.d.value ? numeral(claimD / Math.pow(10, 6)).format('0.0a') : 0}</div>

                    <div>Claimed (CHA)</div>
                    <div>{claims.a.value ? numeral(claimA / Math.pow(10, 6)).format('0.0a') : 0}</div>
                    <div>{claims.b.value ? numeral(claimB / Math.pow(10, 6)).format('0.0a') : 0}</div>
                    <div>{claims.c.value ? numeral(claimC / Math.pow(10, 6)).format('0.0a') : 0}</div>
                    <div>{claims.d.value ? numeral(claimD / Math.pow(10, 6)).format('0.0a') : 0}</div>

                    <div className='mt-4'>Claim Tokens</div>
                    <div className='mt-4'><Button disabled={claims.a.value || !claimA} onClick={() => claim('mint-a')} className='h-6' >Claim</Button></div>
                    <div className='mt-4'><Button disabled={claims.b.value || !claimB} onClick={() => claim('mint-b')} className='h-6' >Claim</Button></div>
                    <div className='mt-4'><Button disabled={claims.c.value || !claimC} onClick={() => claim('mint-c')} className='h-6' >Claim</Button></div>
                    <div className='mt-4'><Button disabled={claims.d.value || !claimD} onClick={() => claim('mint-d')} className='h-6' >Claim</Button></div>
                </div>
            </div>
        </div>
    )
}

export default TokenRedemptions;