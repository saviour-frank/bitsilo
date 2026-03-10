;; title: bitsilo-vault
;; version: 1.0.0
;; summary: sBTC Micro-Yield Vault - deposit sBTC, receive shares, earn yield
;; description: A non-custodial vault that accepts sBTC deposits, issues
;;   proportional shares, and allows the owner to drip yield. Users withdraw
;;   their pro-rata share of sBTC at any time.

;; -----------------------------------------------
;; Traits
;; -----------------------------------------------
(impl-trait .bitsilo-traits.vault-trait)

;; -----------------------------------------------
;; Constants
;; -----------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)

;; Error codes
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_ZERO_AMOUNT (err u101))
(define-constant ERR_INSUFFICIENT_SHARES (err u102))
(define-constant ERR_VAULT_PAUSED (err u103))
(define-constant ERR_DEPOSIT_CAP_EXCEEDED (err u104))
(define-constant ERR_TRANSFER_FAILED (err u105))

;; Precision multiplier for share calculations (prevents rounding to zero)
(define-constant SHARE_PRECISION u1000000)

;; -----------------------------------------------
;; Data Variables
;; -----------------------------------------------
(define-data-var total-sbtc uint u0)
(define-data-var total-shares uint u0)
(define-data-var vault-paused bool false)
(define-data-var deposit-cap uint u10000000000) ;; 100 sBTC in sats (8 decimals)

;; -----------------------------------------------
;; Data Maps
;; -----------------------------------------------
(define-map user-shares principal uint)

;; -----------------------------------------------
;; Private Functions
;; -----------------------------------------------

;; Calculate shares to mint for a given sBTC deposit
(define-private (calculate-shares-to-mint (sbtc-amount uint))
  (let
    (
      (current-total-sbtc (var-get total-sbtc))
      (current-total-shares (var-get total-shares))
    )
    (if (is-eq current-total-shares u0)
      ;; First deposit: 1:1 ratio with precision multiplier
      (* sbtc-amount SHARE_PRECISION)
      ;; Subsequent deposits: proportional to existing pool
      (/ (* sbtc-amount current-total-shares) current-total-sbtc)
    )
  )
)

;; Calculate sBTC to return for a given share amount
(define-private (calculate-sbtc-for-shares (share-amount uint))
  (let
    (
      (current-total-sbtc (var-get total-sbtc))
      (current-total-shares (var-get total-shares))
    )
    (if (is-eq current-total-shares u0)
      u0
      (/ (* share-amount current-total-sbtc) current-total-shares)
    )
  )
)

;; Transfer sBTC out of the vault (contract context) to a recipient
(define-private (transfer-sbtc-out (amount uint) (recipient principal))
  (as-contract?
    ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token" amount))
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      transfer amount current-contract recipient none))
  )
)

;; -----------------------------------------------
;; Public Functions
;; -----------------------------------------------

;; Deposit sBTC into the vault.
;; Transfers sBTC from the sender to the vault contract, mints shares.
(define-public (deposit (sbtc-amount uint))
  (let
    (
      (sender tx-sender)
      (shares-to-mint (calculate-shares-to-mint sbtc-amount))
      (current-user-shares (default-to u0 (map-get? user-shares sender)))
      (new-total-sbtc (+ (var-get total-sbtc) sbtc-amount))
    )
    ;; Guards
    (asserts! (not (var-get vault-paused)) ERR_VAULT_PAUSED)
    (asserts! (> sbtc-amount u0) ERR_ZERO_AMOUNT)
    (asserts! (<= new-total-sbtc (var-get deposit-cap)) ERR_DEPOSIT_CAP_EXCEEDED)

    ;; Transfer sBTC from sender to this contract
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      transfer sbtc-amount sender current-contract none))

    ;; Update state
    (var-set total-sbtc new-total-sbtc)
    (var-set total-shares (+ (var-get total-shares) shares-to-mint))
    (map-set user-shares sender (+ current-user-shares shares-to-mint))

    (print {event: "deposit", sender: sender, sbtc-amount: sbtc-amount, shares-minted: shares-to-mint})
    (ok shares-to-mint)
  )
)

;; Withdraw sBTC from the vault by burning shares.
;; Burns the specified shares and returns proportional sBTC.
(define-public (withdraw (share-amount uint))
  (let
    (
      (sender tx-sender)
      (current-user-shares (default-to u0 (map-get? user-shares sender)))
      (sbtc-to-return (calculate-sbtc-for-shares share-amount))
    )
    ;; Guards
    (asserts! (> share-amount u0) ERR_ZERO_AMOUNT)
    (asserts! (>= current-user-shares share-amount) ERR_INSUFFICIENT_SHARES)

    ;; Transfer sBTC from vault contract back to sender
    (try! (transfer-sbtc-out sbtc-to-return sender))

    ;; Update state
    (var-set total-sbtc (- (var-get total-sbtc) sbtc-to-return))
    (var-set total-shares (- (var-get total-shares) share-amount))
    (map-set user-shares sender (- current-user-shares share-amount))

    (print {event: "withdraw", sender: sender, shares-burned: share-amount, sbtc-returned: sbtc-to-return})
    (ok sbtc-to-return)
  )
)

;; -----------------------------------------------
;; Owner-only Functions
;; -----------------------------------------------

;; Drip yield: owner deposits additional sBTC to increase the value of all shares
(define-public (drip-yield (sbtc-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (asserts! (> sbtc-amount u0) ERR_ZERO_AMOUNT)

    ;; Transfer sBTC from owner to vault
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      transfer sbtc-amount tx-sender current-contract none))

    ;; Increase total sBTC without minting new shares -- everyone's shares grow
    (var-set total-sbtc (+ (var-get total-sbtc) sbtc-amount))

    (print {event: "drip-yield", amount: sbtc-amount, new-total-sbtc: (var-get total-sbtc)})
    (ok true)
  )
)

;; Pause / unpause the vault
(define-public (set-vault-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set vault-paused paused)
    (print {event: "set-paused", paused: paused})
    (ok true)
  )
)

;; Update the deposit cap
(define-public (set-deposit-cap (new-cap uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set deposit-cap new-cap)
    (print {event: "set-deposit-cap", new-cap: new-cap})
    (ok true)
  )
)

;; -----------------------------------------------
;; Read-Only Functions
;; -----------------------------------------------

(define-read-only (get-shares (who principal))
  (ok (default-to u0 (map-get? user-shares who)))
)

(define-read-only (get-total-sbtc)
  (ok (var-get total-sbtc))
)

(define-read-only (get-total-shares)
  (ok (var-get total-shares))
)

(define-read-only (preview-withdraw (share-amount uint))
  (ok (calculate-sbtc-for-shares share-amount))
)

(define-read-only (get-deposit-cap)
  (ok (var-get deposit-cap))
)

(define-read-only (is-paused)
  (ok (var-get vault-paused))
)

(define-read-only (get-share-price)
  (let
    (
      (current-total-sbtc (var-get total-sbtc))
      (current-total-shares (var-get total-shares))
    )
    (if (is-eq current-total-shares u0)
      (ok SHARE_PRECISION)
      (ok (/ (* current-total-sbtc SHARE_PRECISION) current-total-shares))
    )
  )
)

