;; SCS constants
(define-constant SCS_RATIO_BASE u293758009048)
(define-constant SCS_STX_MULTIPLIER u90711607748)
(define-constant SCS_SCHA_MULTIPLIER u982604817795)

;; WCS constants
(define-constant WCS_RATIO_BASE u80489226083)
(define-constant WCS_STX_MULTIPLIER u24022473965)
(define-constant WCS_WCHA_MULTIPLIER u282617340771)

(define-read-only (velar-scha (address principal) (block uint))
  (let
    (
      (block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
      (velar-staked-scha (unwrap! (at-block block-hash (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.farming-wstx-scha-core get-user-staked address)) (err u500)))
    )
    velar-staked-scha
  )
)
(define-read-only (velar-wcha (address principal) (block uint))
  (let
    (
      (block-hash (unwrap! (get-block-info? id-header-hash block) (err u500)))
      (velar-staked-wcha (unwrap! (at-block block-hash (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.farming-wstx-wcha-core get-user-staked address)) (err u500)))
    )
    velar-staked-wcha
  )
)
(define-read-only (calculate-ratio (value-1 uint) (ratio-base uint))
  (let
    (
      (ratio (/ (* value-1 u1000000) ratio-base))  ;; Multiply by 1000000 for precision
    )
    ratio
  )
)

(define-read-only (calculate-result (ratio uint) (multiplier uint))
  (/ (* ratio multiplier) u1000000)
)

(define-public (check-lp (user-address principal))
  (let
    (
      ;; SCS calculations
      (velar-sclp (velar-scha user-address u166688))
      (scs-ratio (calculate-ratio velar-sclp SCS_RATIO_BASE))
      (scs-stx-result (calculate-result scs-ratio SCS_STX_MULTIPLIER))
      (scs-scha-result (calculate-result scs-ratio SCS_SCHA_MULTIPLIER))
      
      ;; WCS calculations
      (velar-wclp (velar-wcha user-address u166688))
      (wcs-ratio (calculate-ratio velar-wclp WCS_RATIO_BASE))
      (wcs-stx-result (calculate-result wcs-ratio WCS_STX_MULTIPLIER))
      (wcs-wcha-result (calculate-result wcs-ratio WCS_WCHA_MULTIPLIER))
    )
    (ok {
      scs: {
        velar-lp: velar-sclp,
        stx: scs-stx-result,
        scha: scs-scha-result
      },
      wcs: {
        velar-lp: velar-wclp,
        stx: wcs-stx-result,
        wcha: wcs-wcha-result
      }
    })
  )
)