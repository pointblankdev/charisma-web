(use-trait ft-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.sip010-ft-trait)
(use-trait share-fee-to-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.share-fee-to-trait)

(define-public (swap-helper-a (id uint) (token0 <ft-trait>) (token1 <ft-trait>) (token-in <ft-trait>) (token-out <ft-trait>) (share-fee-to <share-fee-to-trait>) (amt-in uint) (amt-out-min uint))
  (let (
    (call (try! (contract-call?
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-router swap-exact-tokens-for-tokens
          id
          token0 token1
          token-in token-out
          share-fee-to
          amt-in amt-out-min)))
  )
    (ok call)
  )
)

(define-public (swap-helper-b (id uint) (token0 <ft-trait>) (token1 <ft-trait>) (token-in <ft-trait>) (token-out <ft-trait>) (share-fee-to <share-fee-to-trait>) (amt-in-max uint) (amt-out uint))
  (let (
    (call (try! (contract-call?
          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-router swap-tokens-for-exact-tokens
          id
          token0 token1
          token-in token-out
          share-fee-to
          amt-in-max amt-out)))
  )
    (ok call)
  )
)