(use-trait sip010 .dao-traits-v2.sip010-ft-trait)

;; Constants for fee calculation
(define-constant EXPERIENCE-SCALE u1000000000) ;; 1,000 EXP (with 6 decimal places)
(define-constant FEE-SCALE u1000000) ;; 1 sCHA (with 6 decimal places)
(define-constant MAX-RAVEN-ID u100)
(define-constant MAX-BURN-REDUCTION u500000) ;; 50% reduction (with 6 decimal places)
(define-constant ERR-SWAP-FAILED (err u1001))

;; Helper function to calculate the fee based on experience
(define-private (calculate-fee (experience uint))
  (/ (* experience FEE-SCALE) EXPERIENCE-SCALE)
)

;; Helper function to get user's experience
(define-private (get-user-experience (user principal))
  (unwrap-panic (contract-call? .experience get-balance user))
)

;; Helper function to calculate burn reduction based on Odin's Raven ownership
(define-private (calculate-burn-reduction (user principal))
  (let
    (
      (raven-id (get-user-raven-id user))
      (reduction-rate (/ (* raven-id MAX-BURN-REDUCTION) MAX-RAVEN-ID))
    )
    reduction-rate
  )
)

;; Helper function to get the highest Raven ID owned by the user
(define-private (get-user-raven-id (user principal))
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u100) false)) u100
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u99) false)) u99
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u98) false)) u98
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u97) false)) u97
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u96) false)) u96
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u95) false)) u95
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u94) false)) u94
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u93) false)) u93
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u92) false)) u92
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u91) false)) u91
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u90) false)) u90
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u89) false)) u89
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u88) false)) u88
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u87) false)) u87
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u86) false)) u86
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u85) false)) u85
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u84) false)) u84
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u83) false)) u83
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u82) false)) u82
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u81) false)) u81
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u80) false)) u80
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u79) false)) u79
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u78) false)) u78
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u77) false)) u77
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u76) false)) u76
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u75) false)) u75
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u74) false)) u74
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u73) false)) u73
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u72) false)) u72
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u71) false)) u71
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u70) false)) u70
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u69) false)) u69
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u68) false)) u68
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u67) false)) u67
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u66) false)) u66
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u65) false)) u65
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u64) false)) u64
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u63) false)) u63
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u62) false)) u62
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u61) false)) u61
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u60) false)) u60
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u59) false)) u59
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u58) false)) u58
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u57) false)) u57
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u56) false)) u56
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u55) false)) u55
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u54) false)) u54
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u53) false)) u53
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u52) false)) u52
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u51) false)) u51
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u50) false)) u50
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u49) false)) u49
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u48) false)) u48
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u47) false)) u47
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u46) false)) u46
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u45) false)) u45
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u44) false)) u44
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u43) false)) u43
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u42) false)) u42
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u41) false)) u41
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u40) false)) u40
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u39) false)) u39
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u38) false)) u38
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u37) false)) u37
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u36) false)) u36
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u35) false)) u35
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u34) false)) u34
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u33) false)) u33
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u32) false)) u32
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u31) false)) u31
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u30) false)) u30
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u29) false)) u29
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u28) false)) u28
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u27) false)) u27
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u26) false)) u26
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u25) false)) u25
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u24) false)) u24
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u23) false)) u23
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u22) false)) u22
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u21) false)) u21
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u20) false)) u20
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u19) false)) u19
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u18) false)) u18
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u17) false)) u17
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u16) false)) u16
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u15) false)) u15
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u14) false)) u14
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u13) false)) u13
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u12) false)) u12
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u11) false)) u11
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u10) false)) u10
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u9) false)) u9
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u8) false)) u8
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u7) false)) u7
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u6) false)) u6
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u5) false)) u5
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u4) false)) u4
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u3) false)) u3
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u2) false)) u2
  (if (is-eq user (unwrap! (contract-call? .odins-raven get-owner u1) false)) u1
  u0))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))
)

;; Helper function to swap 1 wSTX for sCHA
(define-private (swap-wstx-for-scha)
  (let
    (
      (swap-result (try! (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 
                          do-swap 
                          u1000000 ;; 1 wSTX (assuming 6 decimal places)
                          'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx 
                          'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma 
                          'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-share-fee-to)))
    )
    (ok (get amt-out swap-result))
  )
)

;; Helper function to pay the burn with Odin's Raven reduction
(define-private (burn-fee (user principal))
  (let
    (
      (experience (get-user-experience user))
      (base-fee (calculate-fee experience))
      (burn-reduction (calculate-burn-reduction user))
      (reduced-fee (- base-fee (/ (* base-fee burn-reduction) u1000000)))
      (user-scha-balance (unwrap-panic (contract-call? .liquid-staked-charisma get-balance user)))
    )
    (if (< user-scha-balance reduced-fee)
      (let
        (
          (swapped-scha (try! (swap-wstx-for-scha)))
        )
        (if (>= (+ user-scha-balance swapped-scha) reduced-fee)
          (contract-call? .liquid-staked-charisma deflate reduced-fee)
          (err ERR-SWAP-FAILED)
        )
      )
      (contract-call? .liquid-staked-charisma deflate reduced-fee)
    )
  )
)

;; Wrapper for tap function
(define-public (tap (land-id uint))
  (begin
    (try! (burn-fee tx-sender))
    (contract-call? .lands tap land-id)
  )
)

;; Wrapper for wrap function
(define-public (wrap (amount uint) (sip010-asset <sip010>))
  (begin
    (try! (burn-fee tx-sender))
    (contract-call? .lands wrap amount sip010-asset)
  )
)

;; Wrapper for unwrap function
(define-public (unwrap (amount uint) (sip010-asset <sip010>))
  (begin
    (try! (burn-fee tx-sender))
    (contract-call? .lands unwrap amount sip010-asset)
  )
)

;; Util functions
(define-private (max (a uint) (b uint))
  (if (> a b) a b)
)