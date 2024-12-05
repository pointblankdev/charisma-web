;; Helper functions for scaling amounts
(define-private (scale-alex (amount uint))
    (* amount (pow u10 u8)))

(define-private (scale-charisma (amount uint))
    (* amount (pow u10 u6)))

;; Swap functions
(define-private (alex-wstx-cha (amount-wstx uint))
  (contract-call? 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 swap-helper
    'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-wstx-v2
    'SP1E0XBN9T4B10E9QMR7XMFJPMA19D77WY3KP2QKC.token-wcharisma
    u100000000
    (scale-alex amount-wstx)
    none))

(define-private (alex-cha-stx (amount-charisma uint))
  (contract-call? 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01 swap-helper 
    'SP1E0XBN9T4B10E9QMR7XMFJPMA19D77WY3KP2QKC.token-wcharisma
    'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-wstx-v2
    u100000000
    (scale-alex amount-charisma)
    none))

(define-private (charisma-wstx-cha (amount-wstx uint))
  (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-path2 do-swap
    (scale-charisma amount-wstx)
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-share-fee-to))

(define-private (charisma-cha-stx (amount-charisma uint))
  (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-path2 do-swap
    (scale-charisma amount-charisma)
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-share-fee-to))

;; Public functions
(define-public (buy-cha (amt-in uint))
  (let (
    (x (match (alex-wstx-cha amt-in) success a error b))
    (y (match (charisma-wstx-cha amt-in) success a error b)))
  (ok {x: x, y: y})))

(define-public (sell-cha (amt-in uint))
  (let (
    (x (match (alex-cha-stx amt-in) success a error b))
    (y (match (charisma-cha-stx amt-in) success a error b)))
  (ok {x: x, y: y})))