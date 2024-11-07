;; WELSH/iouWELSH LP Arbitrage Interaction
;;
;; This contract attempts to profit from price discrepancies between WELSH and iouWELSH tokens
;; by executing LP arbitrage trades. It integrates with the Fatigue interaction for energy costs.
;;
;; Key Features:
;; 1. Dual Trading Paths: 
;;    Forward: Buy LP -> Remove liquidity -> Sell Components
;;    Reverse: Buy Components -> Add liquidity -> Sell LP
;; 2. Energy Cost: Each attempt requires energy expenditure
;; 3. Profit Tracking: Records successful arbitrage profits per user
;; 4. Configurable Input: Allows admin to adjust trade amounts

;; Traits
(impl-trait .dao-traits-v9.interaction-trait)
(use-trait rulebook-trait .dao-traits-v9.rulebook-trait)
(use-trait ft-trait .dao-traits-v4.sip010-ft-trait)
(use-trait ft-plus-trait .dao-traits-v4.ft-plus-trait)
(use-trait share-fee-to-trait .dao-traits-v4.share-fee-to-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant POOL_ID u1) ;; WELSH/iouWELSH pool ID
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_EXCEEDS_LIMIT (err u405))
(define-constant ERR_SWAP_FAILED (err u500))

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) 
  (some u"https://charisma.rocks/api/v0/interactions/welsh-arbitrage"))

(define-data-var amount-in uint u1000000000) ;; 1000 WELSH default
(define-data-var total-profit uint u0)
(define-map profits principal uint)
(define-map contract-owners principal bool)

;; Initialize deployer as first owner
(map-set contract-owners CONTRACT_OWNER true)

;; Owner Management Functions
(define-private (is-owner (caller principal))
    (default-to false (map-get? contract-owners caller)))

(define-public (add-owner (new-owner principal))
    (begin
        (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
        (ok (map-set contract-owners new-owner true))))

(define-public (remove-owner (owner principal))
    (begin
        (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
        (asserts! (not (is-eq owner CONTRACT_OWNER)) ERR_UNAUTHORIZED)
        (ok (map-set contract-owners owner false))))

;; URI Functions
(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri)))

;; Action Execution
(define-public (execute (rulebook <rulebook-trait>) (action (string-ascii 32)))
  (begin
    (try! (contract-call? .registry authorize rulebook))
    (if (is-eq action "FORWARD") (try-forward-path rulebook)
    (if (is-eq action "REVERSE") (try-reverse-path rulebook)
    (err "INVALID_ACTION")))))

;; Profit Tracking
(define-private (update-profit (profit uint))
  (begin
    (map-set profits tx-sender (+ (default-to u0 (map-get? profits tx-sender)) profit))
    (var-set total-profit (+ (var-get total-profit) profit))))

;; Forward Path (Buy LP -> Remove liquidity -> Sell Components)
(define-private (try-forward-path (rulebook <rulebook-trait>))
    (begin
        (if (is-eq (unwrap-panic (contract-call? .fatigue execute rulebook "BURN")) "ENERGY_BURNED")
            (match (contract-call? .generic-lp-arbitrage try-forward-arbitrage
                POOL_ID
                .welshcorgicoin-token  ;; base token (WELSH)
                .welshcorgicoin-token  ;; token0
                .welsh-iouwelsh        ;; token1
                .welsh-iouwelsh-lp     ;; lp token to buy
                .welsh-iouwelsh-lp     ;; lp token to burn
                (var-get amount-in)    ;; input amount
                .univ2-share-fee-to)   ;; fee sharing
                result (begin
                    (print "The adventurer successfully arbitraged the WELSH/iouWELSH LP market!")
                    (update-profit (var-get amount-in))
                    (ok "ARBITRAGE_COMPLETE"))
                error (begin
                    (print "The arbitrage attempt yielded no profit in these market conditions.")
                    (err "NO_PROFIT_OPPORTUNITY")))
            (ok "NOT_ENOUGH_ENERGY"))))

;; Reverse Path (Buy Components -> Add liquidity -> Sell LP)
(define-private (try-reverse-path (rulebook <rulebook-trait>))
    (begin
        (if (is-eq (unwrap-panic (contract-call? .fatigue execute rulebook "BURN")) "ENERGY_BURNED")
            (match (contract-call? .generic-lp-arbitrage try-reverse-arbitrage
                POOL_ID
                .welshcorgicoin-token  ;; base token (WELSH)
                .welshcorgicoin-token  ;; token0
                .welsh-iouwelsh        ;; token1
                .welsh-iouwelsh-lp     ;; lp token to mint
                .welsh-iouwelsh-lp     ;; lp token to sell
                (var-get amount-in)    ;; input amount
                .univ2-share-fee-to)   ;; fee sharing
                result (begin
                    (print "The adventurer successfully arbitraged the WELSH/iouWELSH LP market!")
                    (update-profit (var-get amount-in))
                    (ok "ARBITRAGE_COMPLETE"))
                error (begin
                    (print "The arbitrage attempt yielded no profit in these market conditions.")
                    (err "NO_PROFIT_OPPORTUNITY")))
            (ok "NOT_ENOUGH_ENERGY"))))

;; Admin Functions
(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri))))

(define-public (set-amount-in (new-amount uint))
  (begin
    (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
    (ok (var-set amount-in new-amount))))

;; Read Functions
(define-read-only (get-total-profit)
    (ok (var-get total-profit)))

(define-read-only (get-profit (principal principal))
    (ok (default-to u0 (map-get? profits principal))))