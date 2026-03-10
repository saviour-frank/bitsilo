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