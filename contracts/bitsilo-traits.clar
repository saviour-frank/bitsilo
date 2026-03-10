;; title: bitsilo-traits
;; version: 1.0.0
;; summary: Trait definitions for the BitSilo vault protocol
;; description: Defines the vault-trait interface that any BitSilo vault must implement

;; -----------------------------------------------
;; Vault Trait - any vault implementation must satisfy this interface
;; -----------------------------------------------
(define-trait vault-trait
  (
    ;; Deposit sBTC into the vault. Returns the number of shares minted.
    (deposit (uint) (response uint uint))

    ;; Withdraw sBTC from the vault by burning shares. Returns the sBTC amount.
    (withdraw (uint) (response uint uint))

    ;; Read-only: get the share balance of a principal
    (get-shares (principal) (response uint uint))

    ;; Read-only: get total sBTC held by the vault
    (get-total-sbtc () (response uint uint))

    ;; Read-only: get total shares outstanding
    (get-total-shares () (response uint uint))

    ;; Read-only: preview how much sBTC a given share amount is worth
    (preview-withdraw (uint) (response uint uint))
  )
)

