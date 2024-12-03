import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { useForm } from 'react-hook-form';
import { Info, Share } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import Layout from '@components/layout/layout';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import { setIndexMetadata } from '@lib/user-api';
import { network } from '@components/stacks-session/connect';
import { PostConditionMode } from '@stacks/transactions';
import LaunchpadHeader from '@components/launchpad/header';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Slider } from '@components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import Image from 'next/image';

const ContractDeployer = () => {
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [fullContractName, setFullContractName] = useState('');
  const { stxAddress } = useGlobalState();
  const { doContractDeploy } = useConnect();
  const [initialMintChecked, setInitialMintChecked] = useState(true);

  // Helper functions for logarithmic slider
  const logScale = (value: any) => {
    const minp = 0;
    const maxp = 100;
    const minv = Math.log(0.01);
    const maxv = Math.log(50);

    const scale = (maxv - minv) / (maxp - minp);
    return Math.exp(minv + scale * (value - minp));
  };

  const inverseLogScale = (value: any) => {
    const minp = 0;
    const maxp = 100;
    const minv = Math.log(0.01);
    const maxv = Math.log(50);

    const scale = (maxv - minv) / (maxp - minp);
    return (Math.log(value) - minv) / scale + minp;
  };

  const formatPercentage = (value: any) => `${value.toFixed(2)}%`;
  const formatEnergyAmount = (value: any) => `${value.toFixed(1)}`;

  const form = useForm({
    defaultValues: {
      indexTokenName: 'MiniDex',
      indexTokenSymbol: 'MDX',
      indexTokenImage: 'https://charisma.rocks/dmg-logo-square.png',
      tokenA: '',
      tokenB: '',
      defaultSwapFee: '5',
      alpha: '0.95',
      energyBurnAmount: '10',
      initialMint: true
    }
  });

  const onSubmit = (data: any) => {
    const precision = 1000000;
    const safeName = data.indexTokenName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    const defaultSwapFee = Math.floor(
      Math.max(0, Math.min(50, Number(parseFloat(data.defaultSwapFee).toFixed(6)))) * 10000
    );
    const safeContractName = `${safeName}-dexterity`;
    const fullContractName = `${stxAddress}.${safeContractName}`;
    const alpha = Math.floor(Math.max(0, Math.min(50, parseFloat(data.alpha))) * precision);
    const energyBurnAmount = Math.floor(
      Math.max(0, Math.min(1000, parseFloat(data.energyBurnAmount))) * precision
    );
    // Generate contract code based on parameters
    const code = `;; ${data.indexTokenName} - LP Token, AMM DEX and Hold-to-Earn Engine
;; ${fullContractName}

;; Implement SIP-010 trait
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.sip010-ft-trait)

;; Define the LP token
(define-fungible-token index)

;; Constants
(define-constant DEPLOYER tx-sender)
(define-constant CONTRACT (as-contract tx-sender))
(define-constant ERR_UNAUTHORIZED (err u403))
(define-constant PRECISION u${precision})
(define-constant ALPHA u${alpha})

;; Storage
(define-data-var owner principal DEPLOYER)
(define-data-var energy-burn-amount uint u${energyBurnAmount})
(define-data-var swap-fee uint u${defaultSwapFee}) ;; Default to ${(
      (defaultSwapFee / precision) *
      100
    ).toPrecision(2)}%
(define-data-var token-uri (optional (string-utf8 256)) 
  (some u"https://charisma.rocks/api/v0/indexes/${fullContractName}"))
(define-data-var first-start-block uint stacks-block-height)
(define-map last-tap-block principal uint)

;; Configuration functions
(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq contract-caller (var-get owner)) ERR_UNAUTHORIZED)
    (ok (var-set owner new-owner))))

(define-public (set-energy-burn-amount (new-amount uint))
  (begin
    (asserts! (is-eq contract-caller (var-get owner)) ERR_UNAUTHORIZED)
    (ok (var-set energy-burn-amount new-amount))))

(define-public (set-token-uri (value (string-utf8 256)))
  (if (is-eq contract-caller (var-get owner))
    (ok (var-set token-uri (some value))) 
    ERR_UNAUTHORIZED))

;; Core AMM operations
(define-private (calculate-output-amount (x uint) (y uint) (dx uint) (amp uint))
  (let (
    ;; Constant sum portion (better for similar values)
    (sum-term (/ (* dx y) x))
    ;; Constant product portion (better for different values)
    (product-term (/ (* dx y) (+ x dx)))
    ;; Weighted sum of both terms
    (weighted-output (+ (* (- PRECISION amp) sum-term) (* amp product-term))))
    (/ weighted-output PRECISION)))

(define-public (swap (forward bool) (amt-in uint))
  (let (
    (sender tx-sender)
    (reserve-in (unwrap-panic (if forward (contract-call? '${data.tokenA} get-balance CONTRACT) 
      (contract-call? '${data.tokenB} get-balance CONTRACT))))
    (reserve-out (unwrap-panic (if forward (contract-call? '${data.tokenB} get-balance CONTRACT) 
      (contract-call? '${data.tokenA} get-balance CONTRACT))))
    ;; Calculate raw output amount first
    (raw-out (calculate-output-amount reserve-in reserve-out amt-in ALPHA))
    ;; Check if energy was paid and apply fees to output amount
    (paid-energy (match (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-rulebook-v0 exhaust (var-get energy-burn-amount) sender) success true error false))
    (amt-out (if paid-energy (/ raw-out u2) (/ (* raw-out (- PRECISION (var-get swap-fee))) PRECISION))))
    ;; Execute the swap
    (try! (if forward (contract-call? '${data.tokenA} transfer amt-in sender CONTRACT none) 
      (contract-call? '${data.tokenB} transfer amt-in sender CONTRACT none)))
    (try! (as-contract (if forward (contract-call? '${
      data.tokenB
    } transfer amt-out CONTRACT sender none)
      (contract-call? '${data.tokenA} transfer amt-out CONTRACT sender none))))
    (ok {amt-in: amt-in, amt-out: amt-out})))

(define-public (mint (who principal) (amount uint))
  (let (
    (reserve0 (unwrap-panic (contract-call? '${data.tokenA} get-balance CONTRACT)))
    (reserve1 (unwrap-panic (contract-call? '${data.tokenB} get-balance CONTRACT)))
    (total-supply (ft-get-supply index))
    (token0-amount (if (is-eq total-supply u0) amount (/ (* amount reserve0) total-supply)))
    (token1-amount (if (is-eq total-supply u0) amount (/ (* amount reserve1) total-supply))))
    (asserts! (is-eq tx-sender who) ERR_UNAUTHORIZED)
    (try! (contract-call? '${data.tokenA} transfer token0-amount who CONTRACT none))
    (try! (contract-call? '${data.tokenB} transfer token1-amount who CONTRACT none))
    (try! (ft-mint? index amount who))
    (ok {token0-amount: token0-amount, token1-amount: token1-amount, lp-amount: amount})))

(define-public (burn (who principal) (amount uint))
  (let (
    (reserve0 (unwrap-panic (contract-call? '${data.tokenA} get-balance CONTRACT)))
    (reserve1 (unwrap-panic (contract-call? '${data.tokenB} get-balance CONTRACT)))
    (total-supply (ft-get-supply index))
    (token0-amount (/ (* amount reserve0) total-supply))
    (token1-amount (/ (* amount reserve1) total-supply)))
    (asserts! (is-eq tx-sender who) ERR_UNAUTHORIZED)
    (try! (ft-burn? index amount who))
    (try! (as-contract (contract-call? '${data.tokenA} transfer token0-amount CONTRACT who none)))
    (try! (as-contract (contract-call? '${data.tokenB} transfer token1-amount CONTRACT who none)))
    (ok {token0-amount: token0-amount, token1-amount: token1-amount, lp-amount: amount})))

;; Read functions
(define-read-only (get-owner)
  (ok (var-get owner)))

(define-read-only (get-alpha)
  (ok ALPHA))

(define-read-only (get-tokens)
  (ok {token0: '${data.tokenA}, token1: '${data.tokenB}}))

(define-read-only (get-swap-fee)
  (ok (var-get swap-fee)))

(define-read-only (get-reserves)
  (ok {
    token0: (unwrap-panic (contract-call? '${data.tokenA} get-balance CONTRACT)),
    token1: (unwrap-panic (contract-call? '${data.tokenB} get-balance CONTRACT))
  }))

(define-read-only (get-quote (forward bool) (amt-in uint) (apply-fee bool))
  (let (
    (reserve-in (unwrap-panic (if forward (contract-call? '${data.tokenA} get-balance CONTRACT) 
      (contract-call? '${data.tokenB} get-balance CONTRACT))))
    (reserve-out (unwrap-panic (if forward (contract-call? '${data.tokenB} get-balance CONTRACT) 
      (contract-call? '${data.tokenA} get-balance CONTRACT))))
    (raw-out (calculate-output-amount reserve-in reserve-out amt-in ALPHA))
    (output-amount (if apply-fee (/ (* raw-out (- PRECISION (var-get swap-fee))) PRECISION) (/ raw-out u2))))
    (ok output-amount)))

;; SIP-010 Implementation
(define-read-only (get-name)
  (ok "${data.indexTokenName}"))

(define-read-only (get-symbol)
  (ok "${data.indexTokenSymbol}"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance index who)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply index)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender from) ERR_UNAUTHORIZED)
    (ft-transfer? index amount from to)))

;; Hold-to-Earn functions
(define-private (get-balance-at (data { address: principal, block: uint }))
    (let ((target-block (get block data)))
        (if (< target-block stacks-block-height)
            (let ((block-hash (unwrap-panic (get-stacks-block-info? id-header-hash target-block))))
                (at-block block-hash (unwrap-panic (get-balance (get address data)))))
                (unwrap-panic (get-balance (get address data))))))

(define-private (calculate-trapezoid-areas-39 (balances (list 39 uint)) (dx uint))
    (list
        (/ (* (+ (unwrap-panic (element-at balances u0)) (unwrap-panic (element-at balances u1))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u1)) (unwrap-panic (element-at balances u2))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u2)) (unwrap-panic (element-at balances u3))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u3)) (unwrap-panic (element-at balances u4))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u4)) (unwrap-panic (element-at balances u5))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u5)) (unwrap-panic (element-at balances u6))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u6)) (unwrap-panic (element-at balances u7))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u7)) (unwrap-panic (element-at balances u8))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u8)) (unwrap-panic (element-at balances u9))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u9)) (unwrap-panic (element-at balances u10))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u10)) (unwrap-panic (element-at balances u11))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u11)) (unwrap-panic (element-at balances u12))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u12)) (unwrap-panic (element-at balances u13))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u13)) (unwrap-panic (element-at balances u14))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u14)) (unwrap-panic (element-at balances u15))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u15)) (unwrap-panic (element-at balances u16))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u16)) (unwrap-panic (element-at balances u17))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u17)) (unwrap-panic (element-at balances u18))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u18)) (unwrap-panic (element-at balances u19))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u19)) (unwrap-panic (element-at balances u20))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u20)) (unwrap-panic (element-at balances u21))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u21)) (unwrap-panic (element-at balances u22))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u22)) (unwrap-panic (element-at balances u23))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u23)) (unwrap-panic (element-at balances u24))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u24)) (unwrap-panic (element-at balances u25))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u25)) (unwrap-panic (element-at balances u26))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u26)) (unwrap-panic (element-at balances u27))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u27)) (unwrap-panic (element-at balances u28))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u28)) (unwrap-panic (element-at balances u29))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u29)) (unwrap-panic (element-at balances u30))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u30)) (unwrap-panic (element-at balances u31))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u31)) (unwrap-panic (element-at balances u32))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u32)) (unwrap-panic (element-at balances u33))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u33)) (unwrap-panic (element-at balances u34))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u34)) (unwrap-panic (element-at balances u35))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u35)) (unwrap-panic (element-at balances u36))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u36)) (unwrap-panic (element-at balances u37))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u37)) (unwrap-panic (element-at balances u38))) dx) u2)))

(define-private (calculate-trapezoid-areas-19 (balances (list 19 uint)) (dx uint))
    (list
        (/ (* (+ (unwrap-panic (element-at balances u0)) (unwrap-panic (element-at balances u1))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u1)) (unwrap-panic (element-at balances u2))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u2)) (unwrap-panic (element-at balances u3))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u3)) (unwrap-panic (element-at balances u4))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u4)) (unwrap-panic (element-at balances u5))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u5)) (unwrap-panic (element-at balances u6))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u6)) (unwrap-panic (element-at balances u7))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u7)) (unwrap-panic (element-at balances u8))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u8)) (unwrap-panic (element-at balances u9))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u9)) (unwrap-panic (element-at balances u10))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u10)) (unwrap-panic (element-at balances u11))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u11)) (unwrap-panic (element-at balances u12))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u12)) (unwrap-panic (element-at balances u13))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u13)) (unwrap-panic (element-at balances u14))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u14)) (unwrap-panic (element-at balances u15))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u15)) (unwrap-panic (element-at balances u16))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u16)) (unwrap-panic (element-at balances u17))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u17)) (unwrap-panic (element-at balances u18))) dx) u2)))

(define-private (calculate-trapezoid-areas-9 (balances (list 9 uint)) (dx uint))
    (list
        (/ (* (+ (unwrap-panic (element-at balances u0)) (unwrap-panic (element-at balances u1))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u1)) (unwrap-panic (element-at balances u2))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u2)) (unwrap-panic (element-at balances u3))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u3)) (unwrap-panic (element-at balances u4))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u4)) (unwrap-panic (element-at balances u5))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u5)) (unwrap-panic (element-at balances u6))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u6)) (unwrap-panic (element-at balances u7))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u7)) (unwrap-panic (element-at balances u8))) dx) u2)))

(define-private (calculate-trapezoid-areas-5 (balances (list 5 uint)) (dx uint))
    (list
        (/ (* (+ (unwrap-panic (element-at balances u0)) (unwrap-panic (element-at balances u1))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u1)) (unwrap-panic (element-at balances u2))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u2)) (unwrap-panic (element-at balances u3))) dx) u2)
        (/ (* (+ (unwrap-panic (element-at balances u3)) (unwrap-panic (element-at balances u4))) dx) u2)))

(define-private (calculate-trapezoid-areas-2 (balances (list 2 uint)) (dx uint))
    (list
        (/ (* (+ (unwrap-panic (element-at balances u0)) (unwrap-panic (element-at balances u1))) dx) u2)))

(define-private (calculate-balance-integral-39 (address principal) (start-block uint) (end-block uint))
    (let (
        (sample-points (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator generate-sample-points-39 address start-block end-block))
        (balances (map get-balance-at sample-points))
        (dx (/ (- end-block start-block) u38))
        (areas (calculate-trapezoid-areas-39 balances dx)))
        (fold + areas u0)))

(define-private (calculate-balance-integral-19 (address principal) (start-block uint) (end-block uint))
    (let (
        (sample-points (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator generate-sample-points-19 address start-block end-block))
        (balances (map get-balance-at sample-points))
        (dx (/ (- end-block start-block) u18))
        (areas (calculate-trapezoid-areas-19 balances dx)))
        (fold + areas u0)))

(define-private (calculate-balance-integral-9 (address principal) (start-block uint) (end-block uint))
    (let (
        (sample-points (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator generate-sample-points-9 address start-block end-block))
        (balances (map get-balance-at sample-points))
        (dx (/ (- end-block start-block) u8))
        (areas (calculate-trapezoid-areas-9 balances dx)))
        (fold + areas u0)))

(define-private (calculate-balance-integral-5 (address principal) (start-block uint) (end-block uint))
    (let (
        (sample-points (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator generate-sample-points-5 address start-block end-block))
        (balances (map get-balance-at sample-points))
        (dx (/ (- end-block start-block) u4))
        (areas (calculate-trapezoid-areas-5 balances dx)))
        (fold + areas u0)))

(define-private (calculate-balance-integral-2 (address principal) (start-block uint) (end-block uint))
    (let (
        (sample-points (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator generate-sample-points-2 address start-block end-block))
        (balances (map get-balance-at sample-points))
        (dx (/ (- end-block start-block) u1))
        (areas (calculate-trapezoid-areas-2 balances dx)))
        (fold + areas u0)))

(define-private (calculate-balance-integral (address principal) (start-block uint) (end-block uint))
    (let (
        (block-difference (- end-block start-block))
        (thresholds (unwrap-panic (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator get-thresholds))))
        (if (>= block-difference (get threshold-39-point thresholds)) (calculate-balance-integral-39 address start-block end-block)
        (if (>= block-difference (get threshold-19-point thresholds)) (calculate-balance-integral-19 address start-block end-block)
        (if (>= block-difference (get threshold-9-point thresholds)) (calculate-balance-integral-9 address start-block end-block)
        (if (>= block-difference (get threshold-5-point thresholds)) (calculate-balance-integral-5 address start-block end-block)
        (calculate-balance-integral-2 address start-block end-block)))))))

(define-read-only (get-last-tap-block (address principal))
    (default-to (var-get first-start-block) (map-get? last-tap-block address)))

(define-public (tap)
  (let (
    (sender tx-sender)
    (end-block stacks-block-height)
    (start-block (get-last-tap-block sender))
    (balance-integral (calculate-balance-integral sender start-block end-block))
    (incentive-score (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.engine-coordinator get-incentive-score CONTRACT))
    (circulating-supply (unwrap-panic (get-total-supply)))
    (potential-energy (/ (* balance-integral incentive-score) circulating-supply)))
    (map-set last-tap-block sender end-block)
    (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-rulebook-v0 energize potential-energy sender)))

${initialMintChecked ? '(begin (mint DEPLOYER u1000000))' : ''}  
`;

    setContractCode(code);
    setContractName(safeContractName);
    setFullContractName(fullContractName);
  };

  const deployContract = (e: any) => {
    e.preventDefault();
    // Handle contract deployment
    console.log('Deploying contract:', contractCode);
    doContractDeploy({
      network: network,
      contractName: contractName,
      codeBody: contractCode,
      clarityVersion: 3,
      postConditionMode: PostConditionMode.Allow,
      onFinish: async (result: any) => {
        const response = await setIndexMetadata(fullContractName, {
          name: form.getValues('indexTokenName'),
          image: form.getValues('indexTokenImage'),
          description: 'Index Token – LP, AMM DEX and Hold-to-Earn Engine',
          decimals: 6,
          symbol: form.getValues('indexTokenSymbol'),
          tokenA: form.getValues('tokenA'),
          tokenB: form.getValues('tokenB'),
          contractAddress: result.contractAddress
        });
        console.log(response);
      }
    });
  };

  return (
    <Layout>
      <LaunchpadHeader />
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <Card className="p-6">
          <Alert className="mb-6">
            <Info className="w-4 h-4" />
            <AlertDescription>
              Create your own liquidity pool and index token. This advanced AMM design uses higher
              initial fees to protect early liquidity providers, with the ability to adjust fees as
              the pool matures.
            </AlertDescription>
          </Alert>
          <Form {...form}>
            <form onChange={() => form.handleSubmit(onSubmit)()} className="space-y-4">
              <FormField
                control={form.control}
                name="indexTokenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Index Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter index token name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="indexTokenSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Index Token Symbol/Ticker</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter index token symbol/ticker" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="indexTokenImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Index Token Image Logo</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter valid URL to hosted image" {...field} />
                    </FormControl>
                    <div className="mt-2">
                      {field.value && (
                        <div className="relative w-24 h-24 overflow-hidden border border-gray-200 rounded-lg">
                          <Image
                            src={field.value}
                            alt="Token logo preview"
                            fill
                            className="object-cover"
                            onError={e => {
                              e.currentTarget.src = '/api/placeholder/96/96';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tokenA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Token A</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter first swappable token contract address"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tokenB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Token B</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter second swappable token contract address"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alpha"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Alpha (Curve Shape)</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[800px] p-4">
                            <div className="space-y-2">
                              <p>
                                <strong>Constant Product (α = 1.0):</strong>
                              </p>
                              <ul className="pl-4 list-disc">
                                <li>Better for volatile or uncorrelated assets</li>
                                <li>Higher fees on large trades</li>
                                <li>More protection against price manipulation</li>
                                <li>Example: STX/WELSH pools</li>
                              </ul>
                              <p>
                                <strong>Constant Sum (α = 0.0):</strong>
                              </p>
                              <ul className="pl-4 list-disc">
                                <li>Better for stable or correlated assets</li>
                                <li>Lower slippage on large trades</li>
                                <li>More capital efficient</li>
                                <li>Example: sBTC/aBTC pools</li>
                              </ul>
                              <p className="pt-2">
                                <strong>Choosing the right α:</strong>
                              </p>
                              <ul className="pl-4 list-disc">
                                <li>Use lower α (0 – 0.3) for stableswaps</li>
                                <li>Use higher α (0.8 – 1.0) for volatile pairs</li>
                                <li>
                                  Middle range (0.4 – 0.7) for correlated but not stable assets
                                </li>
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={1}
                          step={0.01}
                          value={[parseFloat(field.value)]}
                          onValueChange={([value]) => field.onChange(value.toString())}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Constant Sum</span>
                          <span>{formatPercentage(parseFloat(field.value) * 100)}</span>
                          <span>Constant Product</span>
                        </div>
                      </div>
                    </FormControl>
                    <p className="mt-2 text-sm text-gray-500">
                      Select between a constant sum and constant product curve
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultSwapFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Swap Fee</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[inverseLogScale(parseFloat(field.value))]}
                          onValueChange={([value]) => field.onChange(logScale(value).toString())}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0.01%</span>
                          <span>{formatPercentage(parseFloat(field.value))}</span>
                          <span>50%</span>
                        </div>
                      </div>
                    </FormControl>
                    <div className="mt-2 space-y-2 text-sm text-gray-500">
                      <p>Default: 5%. This higher initial fee serves multiple purposes:</p>
                      <ul className="pl-4 space-y-1 list-disc">
                        <li>Protection for LP providers from arbitrage while growing TVL</li>
                        <li>Emphasizes long-term holding over frequent trading</li>
                        <li>Creates natural market segmentation across different pools</li>
                      </ul>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energyBurnAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Burn Amount</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[parseFloat(field.value)]}
                          onValueChange={([value]) => field.onChange(value.toString())}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1</span>
                          <span>{formatEnergyAmount(parseFloat(field.value))} Energy</span>
                          <span>100</span>
                        </div>
                      </div>
                    </FormControl>
                    <p className="mt-2 text-sm text-gray-500">
                      Amount of energy required to avoid swap fees
                    </p>
                  </FormItem>
                )}
              />
              <Button className="w-full mt-6" onClick={deployContract}>
                <Share className="w-4 h-4 mr-2" />
                Deploy Contract
              </Button>
              <div className="text-xs text-gray-500">
                Note: Please make sure you are connected with Xverse wallet, as we've seen issues
                with Clarity v3 contract deployments while connected with Leather.
              </div>
            </form>
          </Form>
        </Card>

        <Card className="col-span-1 p-6 bg-black md:col-span-2">
          <CardContent className="p-0">
            <SyntaxHighlighter
              language="lisp"
              customStyle={{
                background: 'black',
                height: '100%',
                margin: 0
              }}
            >
              {contractCode}
            </SyntaxHighlighter>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContractDeployer;
