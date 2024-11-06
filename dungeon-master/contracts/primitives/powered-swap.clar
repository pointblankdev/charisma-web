;; Managed Token Swap
;;
;; Allows users to swap between tokens with energy consequences:
;; - Allowed pairs grant energy boost
;; - Non-allowed pairs consume energy
;; 
;; Energy costs/rewards scale with swap amount.

;; Traits
(use-trait rulebook-trait .charisma-traits-v0.rulebook-trait)
(use-trait ft-trait .dao-traits-v4.sip010-ft-trait)
(use-trait share-fee-to-trait .dao-traits-v4.share-fee-to-trait)

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INSUFFICIENT_ENERGY (err u402))
(define-constant ERR_UNVERIFIED (err u403))
(define-constant BASE_AMOUNT u1000000) ;; 1 token base amount
(define-constant BASE_ENERGY_COST u10000000) ;; 10 energy per BASE_AMOUNT
(define-constant BASE_ENERGY_BOOST u5000000) ;; 5 energy per BASE_AMOUNT

;; Token Pair Configuration
(define-map allowed-pairs 
    {token-in: principal, token-out: principal} 
    {factor: uint, enabled: bool})

;; Helper Functions

;; Calculate scaled energy based on amount
(define-private (scale-energy (base-energy uint) (amount uint))
    (/ (* base-energy amount) BASE_AMOUNT))

;; Admin Functions

;; Configure allowed token pair with energy boost
(define-public (configure-pair 
    (rulebook <rulebook-trait>)
    (token-in principal)
    (token-out principal)
    (energy-boost uint)
    (enabled bool))
  (begin
    (try! (contract-call? rulebook is-owner tx-sender))
    (ok (map-set allowed-pairs 
        {token-in: token-in, token-out: token-out}
        {factor: energy-boost, enabled: enabled}))))

;; Public Functions

;; Main swap function with energy mechanics
(define-public (do-token-swap
    (rulebook <rulebook-trait>)
    (amount uint)
    (token-in <ft-trait>)
    (token-out <ft-trait>)
    (share-fee-to <share-fee-to-trait>))
    (let (
        (pair-config (map-get? allowed-pairs {token-in: (contract-of token-in), token-out: (contract-of token-out)})))
        ;; Verify interaction is authorized
        (try! (contract-call? rulebook is-verified-interaction contract-caller))
        ;; Try the swap first
        (match (contract-call? .univ2-path2 do-swap 
                amount
                token-in 
                token-out
                share-fee-to)
            success ;; If swap succeeds, handle energy
                (match pair-config
                    config ;; If pair is configured
                        (if (get enabled config)
                            ;; Grant scaled energy boost for allowed pair
                            (match (contract-call? rulebook energize 
                                    (scale-energy (get factor config) amount)
                                    tx-sender)
                                boost-success (ok success)
                                boost-error (ok success)) ;; Still return swap success even if boost fails
                            ;; Exhaust scaled energy for disabled pair
                            (match (contract-call? rulebook exhaust 
                                    (scale-energy (get factor config) amount)
                                    tx-sender)
                                exhaust-success (ok success)
                                exhaust-error ERR_INSUFFICIENT_ENERGY))
                    ;; Exhaust scaled energy for unconfigured pair
                    (match (contract-call? rulebook exhaust 
                            (scale-energy BASE_ENERGY_COST amount)
                            tx-sender)
                        exhaust-success (ok success)
                        exhaust-error ERR_INSUFFICIENT_ENERGY))
            error (err error)))) ;; If swap fails, return the error

;; Read Functions

;; Get configuration for a token pair
(define-read-only (get-pair-config (token-in principal) (token-out principal))
    (ok (map-get? allowed-pairs {token-in: token-in, token-out: token-out})))

;; Get base energy amounts and scaling factors
(define-read-only (get-energy-config)
    (ok {
        base-amount: BASE_AMOUNT,
        base-energy-cost: BASE_ENERGY_COST,
        base-energy-boost: BASE_ENERGY_BOOST
    }))

;; Calculate energy amount for a given swap amount
(define-read-only (calculate-energy-for-amount (amount uint))
    (ok {
        energy-cost: (scale-energy BASE_ENERGY_COST amount),
        energy-boost: (scale-energy BASE_ENERGY_BOOST amount)
    }))