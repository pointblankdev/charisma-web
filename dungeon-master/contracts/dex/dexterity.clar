;; Dexterity - Minimal implementation for swaps

;; Traits
(use-trait ft-plus-trait .charisma-traits-v1.ft-plus-trait)
(use-trait rulebook-trait .charisma-traits-v1.rulebook-trait)

;; Constants 
(define-constant ERR_INSUFFICIENT_AMOUNT (err u403))

;; Core swap function
(define-public (swap 
    (rulebook <rulebook-trait>)
    (index <ft-plus-trait>)    
    (forward bool)      
    (amt-in uint)       
    (amt-out-min uint))  
  (begin
    (asserts! (> amt-in u0) ERR_INSUFFICIENT_AMOUNT)
    (try! (pay-to-play rulebook))
    (contract-call? index swap forward amt-in amt-out-min)))

;; Core quote function
(define-read-only (quote 
    (index <ft-plus-trait>)
    (forward bool)
    (amt-in uint)
    (apply-fee bool))
  (contract-call? index quote forward amt-in apply-fee))

;; Protocol fee
(define-private (pay-to-play (rulebook <rulebook-trait>))
  (begin
    (asserts! (match (contract-call? .charisma-rulebook-registry authorize rulebook)
      success true error false) ERR_UNAUTHORIZED)
    (unwrap! (contract-call? rulebook pay-to-play) ERR_UNAUTHORIZED)
    (ok true)))