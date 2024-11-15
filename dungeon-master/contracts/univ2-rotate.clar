(use-trait ft-trait .dao-traits-v4.sip010-ft-trait)
(use-trait ft-plus-trait .dao-traits-v4.ft-plus-trait)
(use-trait share-fee-to-trait .dao-traits-v4.share-fee-to-trait)

(define-constant err-slippage (err u2001))

(define-public 
  (swap-and-add-liquidity
    (pool-id uint)
    (token0 <ft-trait>)
    (token1 <ft-trait>)
    (lp-token <ft-plus-trait>)
    (amt0-in uint)
    (amt1-min uint)  ;; Minimum amount of token1 to receive from swap
    (min-liquidity uint)
    (share-fee-to <share-fee-to-trait>))
  (let ((swap-amt (/ amt0-in u2)))  ;; Split input amount in half
    
    ;; First swap half for token1
    (let ((swap-result 
            (try! (contract-call? 
                    .univ2-router
                    swap-exact-tokens-for-tokens
                    pool-id
                    token0 
                    token1
                    token0
                    token1
                    share-fee-to  
                    swap-amt
                    amt1-min))))
      
      ;; Add liquidity with remaining amounts
      (let ((liquidity-result
              (try! (contract-call?
                .univ2-router
                add-liquidity
                pool-id
                token0
                token1  
                lp-token
                (- amt0-in swap-amt)  ;; Remaining token0
                (get amt-out swap-result)  ;; Swapped token1 
                (- amt0-in swap-amt)  ;; Min amounts = exact amounts
                (get amt-out swap-result)))))
        
        ;; Check minimum liquidity
        (asserts! (>= (get liquidity liquidity-result) min-liquidity)
                 err-slippage)
        
        (ok {
          swap: swap-result,
          liquidity: liquidity-result
        })))))

(define-public
  (remove-liquidity-and-swap
    (pool-id uint)
    (token0 <ft-trait>)
    (token1 <ft-trait>)
    (lp-token <ft-plus-trait>)
    (liquidity uint)
    (to-token0 bool)  ;; Whether to swap to token0 or token1
    (min-out uint)    ;; Minimum output from the final swap
    (share-fee-to <share-fee-to-trait>))
  
  ;; First remove liquidity
  (let ((remove-result 
          (try! (contract-call?
            .univ2-router
            remove-liquidity
            pool-id
            token0
            token1
            lp-token
            liquidity
            u0  ;; Accept any output amounts since we're swapping anyway
            u0))))
    
    ;; Then swap one side to the other
    (if to-token0
        (contract-call?  ;; Swap token1 to token0
          .univ2-router
          swap-exact-tokens-for-tokens
          pool-id
          token1
          token0
          token1
          token0
          share-fee-to
          (get amt1 remove-result)
          min-out)
        (contract-call?  ;; Swap token0 to token1
          .univ2-router
          swap-exact-tokens-for-tokens
          pool-id
          token0
          token1
          token0
          token1
          share-fee-to
          (get amt0 remove-result)
          min-out))))