;; Dungeon Crawler Contract
;;
;; This contract serves as the primary interface for user interactions within the Charisma protocol.
;; It acts as a central hub for executing actions across various interaction contracts, enabling
;; users to engage with multiple protocol components in a single transaction.
;;
;; Key Responsibilities:
;; 1. Action Execution: Coordinates the execution of actions on interaction contracts.
;; 2. Multi-Interaction Support: Allows users to execute up to eight different interactions in one transaction.
;; 3. Error Handling: Implements a "best-effort" approach, attempting all interactions even if some fail.
;;
;; Core Components:
;; - Interaction Execution: Provides functions to execute single or multiple interactions.
;; - Error Clobbering: Continues execution of subsequent interactions even if earlier ones fail.
;;
;; Integration with Charisma Ecosystem:
;; - Interaction Contracts: Executes actions on various protocol components through standardized interfaces.
;; - Dungeon Keeper: Relies on for interaction verification and privileged operations (indirectly through interactions).
;; - Token Contracts: Interacts with Experience, Energy, DMG, and Charisma token contracts indirectly through verified interactions.
;;
;; Key Functions:
;; - interact: Executes a single interaction with the specified action.
;; - explore: Executes up to eight different interactions in a single transaction.
;;
;; Security Features:
;; - Interaction Isolation: Each interaction is executed independently, preventing cascading failures.
;; - Non-Privileged Execution: The Dungeon Crawler itself does not perform sensitive operations, relying on properly verified interaction contracts.
;;
;; Error Handling Philosophy:
;; The Dungeon Crawler implements a "best-effort" approach to interaction execution:
;; - In single interactions, errors are propagated to the caller for handling.
;; - In multi-interaction calls, the contract attempts to execute all provided interactions, regardless of individual failures.
;; - This approach ensures maximum utility from each transaction while isolating failures.
;;
;; This contract is crucial for enabling flexible and robust user engagement with the Charisma protocol.
;; It provides a streamlined interface for executing complex sequences of interactions while maintaining
;; system integrity. The architecture supports the protocol's innovative approach to multi-faceted
;; blockchain interactions, allowing for complex operations to be performed in a single transaction.

(use-trait rulebook-trait .dao-traits-v9.rulebook-trait)
(use-trait interaction-trait .dao-traits-v9.interaction-trait)

(define-public (interact (rulebook <rulebook-trait>) (interaction <interaction-trait>) (action (string-ascii 32)))
  (contract-call? interaction execute rulebook action))

(define-public (explore
  (rulebook <rulebook-trait>)
  (interaction-1 (optional <interaction-trait>)) (action-1 (optional (string-ascii 32)))
  (interaction-2 (optional <interaction-trait>)) (action-2 (optional (string-ascii 32)))
  (interaction-3 (optional <interaction-trait>)) (action-3 (optional (string-ascii 32)))
  (interaction-4 (optional <interaction-trait>)) (action-4 (optional (string-ascii 32)))
  (interaction-5 (optional <interaction-trait>)) (action-5 (optional (string-ascii 32)))
  (interaction-6 (optional <interaction-trait>)) (action-6 (optional (string-ascii 32)))
  (interaction-7 (optional <interaction-trait>)) (action-7 (optional (string-ascii 32)))
  (interaction-8 (optional <interaction-trait>)) (action-8 (optional (string-ascii 32))))
  (let (
    (response-1 (match interaction-1 i1 (match (interact rulebook i1 (match action-1 a1 a1 "")) success success error error) ""))
    (response-2 (match interaction-2 i2 (match (interact rulebook i2 (match action-2 a2 a2 "")) success success error error) ""))
    (response-3 (match interaction-3 i3 (match (interact rulebook i3 (match action-3 a3 a3 "")) success success error error) ""))
    (response-4 (match interaction-4 i4 (match (interact rulebook i4 (match action-4 a4 a4 "")) success success error error) ""))
    (response-5 (match interaction-5 i5 (match (interact rulebook i5 (match action-5 a5 a5 "")) success success error error) ""))
    (response-6 (match interaction-6 i6 (match (interact rulebook i6 (match action-6 a6 a6 "")) success success error error) ""))
    (response-7 (match interaction-7 i7 (match (interact rulebook i7 (match action-7 a7 a7 "")) success success error error) ""))
    (response-8 (match interaction-8 i8 (match (interact rulebook i8 (match action-8 a8 a8 "")) success success error error) ""))
    (output {
      i1: {x: (match interaction-1 i1 (as-contract i1) .none), y: (match action-1 a1 a1 ""), z: response-1},
      i2: {x: (match interaction-2 i2 (as-contract i2) .none), y: (match action-2 a2 a2 ""), z: response-2},
      i3: {x: (match interaction-3 i3 (as-contract i3) .none), y: (match action-3 a3 a3 ""), z: response-3},
      i4: {x: (match interaction-4 i4 (as-contract i4) .none), y: (match action-4 a4 a4 ""), z: response-4},
      i5: {x: (match interaction-5 i5 (as-contract i5) .none), y: (match action-5 a5 a5 ""), z: response-5},
      i6: {x: (match interaction-6 i6 (as-contract i6) .none), y: (match action-6 a6 a6 ""), z: response-6},
      i7: {x: (match interaction-7 i7 (as-contract i7) .none), y: (match action-7 a7 a7 ""), z: response-7},
      i8: {x: (match interaction-8 i8 (as-contract i8) .none), y: (match action-8 a8 a8 ""), z: response-8},
    }))
    (print output)
    (ok output)))