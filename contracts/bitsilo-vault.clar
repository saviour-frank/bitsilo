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