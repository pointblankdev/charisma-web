(use-trait ft-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.sip010-ft-trait)
(use-trait share-fee-to-trait 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-traits-v1.share-fee-to-trait)

(define-public (swap-3
    (amt-in uint) (amt-out-min uint)
    (token-a <ft-trait>) (token-b <ft-trait>)
    (token-c <ft-trait>)
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-path2 swap-3
                  amt-in amt-out-min
                  token-a token-b
                  token-c
                  share-fee-to)))
  )
    (ok swap-a)
  )
)

(define-public (swap-4
    (amt-in uint) (amt-out-min uint)
    (token-a <ft-trait>) (token-b <ft-trait>)
    (token-c <ft-trait>) (token-d <ft-trait>)
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-path2 swap-4
                  amt-in amt-out-min
                  token-a token-b
                  token-c token-d
                  share-fee-to)))
  )
    (ok swap-a)
  )
)

(define-public (swap-5
    (amt-in uint) (amt-out-min uint)
    (token-a <ft-trait>) (token-b <ft-trait>)
    (token-c <ft-trait>) (token-d <ft-trait>)
    (token-e <ft-trait>)
    (share-fee-to <share-fee-to-trait>)
  )
  (let (
    (swap-a (try! (contract-call?
                  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-path2 swap-5
                  amt-in amt-out-min
                  token-a token-b
                  token-c token-d
                  token-e
                  share-fee-to)))
  )
    (ok swap-a)
  )
)