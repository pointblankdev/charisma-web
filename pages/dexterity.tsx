import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Slider } from '@components/ui/slider';
import { useForm } from 'react-hook-form';
import { Info, Share } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Alert, AlertDescription } from '@components/ui/alert';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';
import { PostConditionMode } from '@stacks/transactions';
import Layout from '@components/layout/layout';

export default function ContractDeployer() {
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [fullContractName, setFullContractName] = useState('');
  const { stxAddress } = useGlobalState();
  const { doContractDeploy } = useConnect();

  const form = useForm({
    defaultValues: {
      contractName: 'TokenPair',
      tokenAContract: '',
      tokenBContract: '',
      lpTokenName: 'Token Pair LP',
      lpTokenSymbol: 'TPLP',
      initialTokenUri: 'https://metadata.example.com/lp-token',
      lpRebatePercent: 5
    }
  });

  const onSubmit = (data: any) => {
    const safeName = data.contractName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    const safeContractName = `${safeName}-pool-v1`;
    const fullContractName = `${stxAddress}.${safeContractName}`;
    const lpRebateRaw = Math.floor((parseFloat(data.lpRebatePercent) / 100) * 1000000);

    const code = `;; Title: ${data.contractName}
;; Version: 1.0.0
;; Description: 
;;   Implementation of the standard trait interface for liquidity pools on the Stacks blockchain.
;;   Provides automated market making functionality between two SIP-010 compliant tokens.
;;   Implements SIP-010 fungible token standard for LP token compatibility.

;; Traits
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.sip010-ft-trait)
(impl-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dexterity-traits-v0.liquidity-pool-trait)

;; Constants
(define-constant DEPLOYER tx-sender)
(define-constant CONTRACT (as-contract tx-sender))
(define-constant ERR_UNAUTHORIZED (err u403))
(define-constant ERR_INVALID_OPERATION (err u400))
(define-constant PRECISION u1000000)
(define-constant LP_REBATE u${lpRebateRaw})

;; Operation Types (Byte 0 of opcode)
(define-constant OP_SWAP_A_TO_B 0x00)     ;; Swap token A for B
(define-constant OP_SWAP_B_TO_A 0x01)     ;; Swap token B for A
(define-constant OP_ADD_LIQUIDITY 0x02)   ;; Add liquidity
(define-constant OP_REMOVE_LIQUIDITY 0x03) ;; Remove liquidity

;; Define LP token
(define-fungible-token ${data.lpTokenSymbol})
(define-data-var token-uri (optional (string-utf8 256)) 
  ${data.initialTokenUri ? `(some u"${data.initialTokenUri}")` : 'none'})

;; --- SIP10 Functions ---

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
        (try! (ft-transfer? ${data.lpTokenSymbol} amount sender recipient))
        (match memo to-print (print to-print) 0x0000)
        (ok true)))

(define-read-only (get-name)
    (ok "${data.lpTokenName}"))

(define-read-only (get-symbol)
    (ok "${data.lpTokenSymbol}"))

(define-read-only (get-decimals)
    (ok u6))

(define-read-only (get-balance (who principal))
    (ok (ft-get-balance ${data.lpTokenSymbol} who)))

(define-read-only (get-total-supply)
    (ok (ft-get-supply ${data.lpTokenSymbol})))

(define-read-only (get-token-uri)
    (ok (var-get token-uri)))

(define-public (set-token-uri (uri (string-utf8 256)))
    (if (is-eq contract-caller DEPLOYER)
        (ok (var-set token-uri (some uri))) 
        ERR_UNAUTHORIZED))

;; --- Core Functions ---

(define-public (execute (amount uint) (opcode (optional (buff 16))))
    (let (
        (sender tx-sender)
        (operation (get-byte opcode u0)))
        (if (is-eq operation OP_SWAP_A_TO_B) (swap-a-to-b amount)
        (if (is-eq operation OP_SWAP_B_TO_A) (swap-b-to-a amount)
        (if (is-eq operation OP_ADD_LIQUIDITY) (add-liquidity amount)
        (if (is-eq operation OP_REMOVE_LIQUIDITY) (remove-liquidity amount)
        ERR_INVALID_OPERATION))))))

(define-read-only (quote (amount uint) (opcode (optional (buff 16))))
    (let (
        (operation (get-byte opcode u0)))
        (if (is-eq operation OP_SWAP_A_TO_B) (ok (get-swap-quote amount opcode))
        (if (is-eq operation OP_SWAP_B_TO_A) (ok (get-swap-quote amount opcode))
        (if (is-eq operation OP_ADD_LIQUIDITY) (ok (get-liquidity-quote amount))
        (if (is-eq operation OP_REMOVE_LIQUIDITY) (ok (get-liquidity-quote amount))
        ERR_INVALID_OPERATION))))))

;; --- Execute Functions ---

(define-public (swap-a-to-b (amount uint))
    (let (
        (sender tx-sender)
        (delta (get-swap-quote amount (some OP_SWAP_A_TO_B))))
        ;; Transfer token A to pool
        (try! (contract-call? '${data.tokenAContract} transfer amount sender CONTRACT none))
        ;; Transfer token B to sender
        (try! (as-contract (contract-call? '${
          data.tokenBContract
        } transfer (get dy delta) CONTRACT sender none)))
        (ok delta)))

(define-public (swap-b-to-a (amount uint))
    (let (
        (sender tx-sender)
        (delta (get-swap-quote amount (some OP_SWAP_B_TO_A))))
        ;; Transfer token B to pool
        (try! (contract-call? '${data.tokenBContract} transfer amount sender CONTRACT none))
        ;; Transfer token A to sender
        (try! (as-contract (contract-call? '${
          data.tokenAContract
        } transfer (get dy delta) CONTRACT sender none)))
        (ok delta)))

(define-public (add-liquidity (amount uint))
    (let (
        (sender tx-sender)
        (delta (get-liquidity-quote amount)))
        (try! (contract-call? '${data.tokenAContract} transfer (get dx delta) sender CONTRACT none))
        (try! (contract-call? '${data.tokenBContract} transfer (get dy delta) sender CONTRACT none))
        (try! (ft-mint? ${data.lpTokenSymbol} (get dk delta) sender))
        (ok delta)))

(define-public (remove-liquidity (amount uint))
    (let (
        (sender tx-sender)
        (delta (get-liquidity-quote amount)))
        (try! (ft-burn? ${data.lpTokenSymbol} (get dk delta) sender))
        (try! (as-contract (contract-call? '${
          data.tokenAContract
        } transfer (get dx delta) CONTRACT sender none)))
        (try! (as-contract (contract-call? '${
          data.tokenBContract
        } transfer (get dy delta) CONTRACT sender none)))
        (ok delta)))

;; --- Helper Functions ---

(define-private (get-byte (opcode (optional (buff 16))) (position uint))
    (default-to 0x00 (element-at? (default-to 0x00 opcode) position)))

(define-private (get-reserves)
    { 
      a: (unwrap-panic (contract-call? '${data.tokenAContract} get-balance CONTRACT)), 
      b: (unwrap-panic (contract-call? '${data.tokenBContract} get-balance CONTRACT)) 
    })

;; --- Quote Functions ---

(define-read-only (get-swap-quote (amount uint) (opcode (optional (buff 16))))
    (let (
        (reserves (get-reserves))
        (operation (get-byte opcode u0))
        (is-a-in (is-eq operation OP_SWAP_A_TO_B))
        (x (if is-a-in (get a reserves) (get b reserves)))
        (y (if is-a-in (get b reserves) (get a reserves)))
        (dx (/ (* amount (- PRECISION LP_REBATE)) PRECISION))
        (numerator (* dx y))
        (denominator (+ x dx))
        (dy (/ numerator denominator)))
        {
          dx: dx,
          dy: dy,
          dk: u0
        }))

(define-read-only (get-liquidity-quote (amount uint))
    (let (
        (k (ft-get-supply ${data.lpTokenSymbol}))
        (reserves (get-reserves)))
        {
          dx: (if (> k u0) (/ (* amount (get a reserves)) k) amount),
          dy: (if (> k u0) (/ (* amount (get b reserves)) k) amount),
          dk: amount
        }))`;

    setContractCode(code);
    setContractName(safeContractName);
    setFullContractName(fullContractName);
  };

  const deployContract = (e: any) => {
    e.preventDefault();
    doContractDeploy({
      network,
      contractName,
      codeBody: contractCode,
      clarityVersion: 3,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (result: any) => {
        console.log('Contract deployed:', result);
      }
    });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <Card className="p-6">
          <Alert className="mb-6">
            <Info className="w-4 h-4" />
            <AlertDescription>
              Create a new liquidity pool with constant product AMM and customizable LP token
              parameters.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onChange={() => form.handleSubmit(onSubmit)()} className="space-y-4">
              <FormField
                control={form.control}
                name="contractName"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Contract Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contract name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lpTokenName"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>LP Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter LP token name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lpTokenSymbol"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>LP Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter LP token symbol" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenAContract"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Token A Contract</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter token A contract principal" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenBContract"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Token B Contract</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter token B contract principal" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lpRebatePercent"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>LP Rebate Percentage</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0.01}
                          max={99.99}
                          step={0.01}
                          value={[parseFloat(field.value)]}
                          onValueChange={([value]: any) => field.onChange(value.toString())}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0.01%</span>
                          <span>{parseFloat(field.value).toFixed(2)}%</span>
                          <span>99.99%</span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialTokenUri"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Initial Token URI</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter token metadata URI" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button className="w-full mt-6" onClick={deployContract}>
                <Share className="w-4 h-4 mr-2" />
                Deploy Contract
              </Button>
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
}
