;; Welsh Arbitrage Interaction Contract
;;
;; This contract enables arbitrage through the Welsh Corgi path in the dungeon's
;; mysterious marketplace. It attempts profitable trades through various token pools
;; while locking in successful arbitrage opportunities.

(impl-trait .dao-traits-v7.interaction-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u401))

;; Data Variables
(define-data-var contract-uri (optional (string-utf8 256)) 
  (some u"https://charisma.rocks/api/v0/interactions/charismatic-corgi"))

(define-data-var amount-in u10000000) ;; 10 CHA
(define-data-var total-profit uint u0)
(define-map profits principal uint)

;; URI Functions
(define-read-only (get-interaction-uri)
  (ok (var-get contract-uri)))

;; Action Execution
(define-public (execute (action (string-ascii 32)))
  (let ((sender tx-sender))
    (if (is-eq action "FORWARD") (try-forward-path sender)
    (if (is-eq action "REVERSE") (try-reverse-path sender)
    (err "INVALID_ACTION")))))

;; Profit Tracking
(define-private (update-profit (profit uint))
  (begin
    (map-set profits tx-sender (+ (default-to u0 (map-get? profits tx-sender)) profit))
    (var-set total-profit (+ (var-get total-profit) profit))))

;; Forward Path (CHA -> STX -> WELSH -> CHA)
(define-private (try-forward-path (sender principal))
    (begin
        (if (is-eq (unwrap-panic (contract-call? .fatigue execute "BURN")) "ENERGY_BURNED")
            (match (contract-call? .univ2-path2 swap-4 (var-get amount-in) (var-get amount-in) .charisma-token .wstx .welshcorgicoin-token .charisma-token .univ2-share-fee-to)
                success (begin
                            (print "The adventurer successfully arbitraged the mystical marketplace!")
                            (update-profit (var-get amount-in))
                            (match (contract-call? .univ2-path2 do-swap u1000000 .wstx .charisma-token .univ2-share-fee-to)
                                s (print "With the profits, the adventurer swapped 1 STX to CHA.")
                                e (print "Swapping 1 STX to CHA after the successful arbitrage failed."))
                            (ok "ARBITRAGE_COMPLETE"))
                error   (begin
                            (print "The arbitrage attempt yielded no profit in these market conditions.")
                            (ok "NO_PROFIT_OPPORTUNITY")))
            (ok "NOT_ENOUGH_ENERGY"))))

;; Reverse Path (CHA -> WELSH -> STX -> CHA)
(define-private (try-reverse-path (sender principal))
    (begin
        (if (is-eq (unwrap-panic (contract-call? .fatigue execute "BURN")) "ENERGY_BURNED")
            (match (contract-call? .univ2-path2 swap-4 (var-get amount-in) (var-get amount-in) .charisma-token .welshcorgicoin-token .wstx .charisma-token .univ2-share-fee-to)
                success (begin
                            (print "The adventurer successfully arbitraged the mystical marketplace!")
                            (update-profit (var-get amount-in))
                            (match (contract-call? .univ2-path2 do-swap u1000000 .wstx .charisma-token .univ2-share-fee-to)
                                s (print "With the profits, the adventurer swapped 1 STX to CHA.")
                                e (print "Swapping 1 STX to CHA after the successful arbitrage failed."))
                            (ok "ARBITRAGE_COMPLETE"))
                error   (begin
                            (print "The arbitrage attempt yielded no profit in these market conditions.")
                            (ok "NO_PROFIT_OPPORTUNITY")))
            (ok "NOT_ENOUGH_ENERGY"))))
       

;; Admin Functions
(define-public (set-contract-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set contract-uri new-uri))))

(define-public (set-amount-in (new-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set amount-in new-amount))))

(define-read-only (get-total-profit)
    (ok (var-get total-profit)))

(define-read-only (get-profit (principal principal))
    (ok (default-to u0 (map-get? profits principal))))
