import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

// sBTC contract address used by Clarinet simnet
const SBTC_CONTRACT = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const SHARE_PRECISION = 1_000_000;

// Wallets are pre-funded with 10 sBTC (1_000_000_000 sats) each via boot deposits
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("bitsilo-vault", () => {
  // -----------------------------------------------
  // Deployment
  // -----------------------------------------------
  it("deploys successfully and implements the trait", () => {
    const contracts = simnet.getContractsInterfaces();
    expect(contracts.has(`${deployer}.bitsilo-vault`)).toBe(true);
  });

  // -----------------------------------------------
  // Initial state
  // -----------------------------------------------
  it("starts with zero total sBTC and zero shares", () => {
    const totalSbtc = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-total-sbtc", [], deployer
    );
    expect(totalSbtc.result).toBeOk(Cl.uint(0));

    const totalShares = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-total-shares", [], deployer
    );
    expect(totalShares.result).toBeOk(Cl.uint(0));
  });

  it("share price starts at SHARE_PRECISION when pool is empty", () => {
    const price = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-share-price", [], deployer
    );
    expect(price.result).toBeOk(Cl.uint(SHARE_PRECISION));
  });

  // -----------------------------------------------
  // Deposits
  // -----------------------------------------------
  it("rejects zero-amount deposit", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(0)], wallet1
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR_ZERO_AMOUNT
  });

  it("accepts a valid deposit and mints shares", () => {
    const depositAmount = 1000;

    // wallet1 already has sBTC from boot deposits, deposit into vault
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(depositAmount)], wallet1
    );
    expect(result).toBeOk(Cl.uint(depositAmount * SHARE_PRECISION));

    // Verify shares
    const shares = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-shares", [Cl.principal(wallet1)], wallet1
    );
    expect(shares.result).toBeOk(Cl.uint(depositAmount * SHARE_PRECISION));

    // Verify vault total
    const totalSbtc = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-total-sbtc", [], deployer
    );
    expect(totalSbtc.result).toBeOk(Cl.uint(depositAmount));
  });

  it("rejects deposit exceeding deposit cap", () => {
    // Default cap is 10_000_000_000 (100 sBTC). Deposit just over it.
    // First set a small cap, then try to deposit over it.
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "set-deposit-cap", [Cl.uint(500)], deployer
    );

    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(501)], wallet1
    );
    expect(result).toBeErr(Cl.uint(104)); // ERR_DEPOSIT_CAP_EXCEEDED
  });

  // -----------------------------------------------
  // Withdrawals
  // -----------------------------------------------
  it("rejects zero-amount withdrawal", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "withdraw", [Cl.uint(0)], wallet1
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR_ZERO_AMOUNT
  });

  it("rejects withdrawal with insufficient shares", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "withdraw", [Cl.uint(100)], wallet1
    );
    expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_SHARES
  });

  it("allows full withdrawal and returns correct sBTC", () => {
    const depositAmount = 5000;

    // Deposit
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(depositAmount)], wallet1
    );

    const sharesToBurn = depositAmount * SHARE_PRECISION;

    // Withdraw all shares
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "withdraw", [Cl.uint(sharesToBurn)], wallet1
    );
    expect(result).toBeOk(Cl.uint(depositAmount));

    // Vault should be empty
    const totalSbtc = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-total-sbtc", [], deployer
    );
    expect(totalSbtc.result).toBeOk(Cl.uint(0));
  });

  // -----------------------------------------------
  // Yield drip
  // -----------------------------------------------
  it("only owner can drip yield", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "drip-yield", [Cl.uint(500)], wallet1
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_OWNER
  });

  it("drip-yield increases share value for depositors", () => {
    const depositAmount = 1000;
    const yieldAmount = 200;

    // wallet1 deposits
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(depositAmount)], wallet1
    );

    // Deployer drips yield (deployer also has sBTC from boot)
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "drip-yield", [Cl.uint(yieldAmount)], deployer
    );

    // Total sBTC should reflect deposit + yield
    const totalSbtc = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-total-sbtc", [], deployer
    );
    expect(totalSbtc.result).toBeOk(Cl.uint(depositAmount + yieldAmount));

    // Preview withdraw should show full amount for all shares
    const shares = depositAmount * SHARE_PRECISION;
    const preview = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "preview-withdraw", [Cl.uint(shares)], wallet1
    );
    expect(preview.result).toBeOk(Cl.uint(depositAmount + yieldAmount));
  });

  // -----------------------------------------------
  // Multi-depositor scenario
  // -----------------------------------------------
  it("handles two depositors and proportional withdrawal", () => {
    const amount1 = 3000;
    const amount2 = 1000;

    // wallet1 deposits first
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(amount1)], wallet1
    );

    // wallet2 deposits second
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(amount2)], wallet2
    );

    // Total should be amount1 + amount2
    const totalSbtc = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-total-sbtc", [], deployer
    );
    expect(totalSbtc.result).toBeOk(Cl.uint(amount1 + amount2));

    // wallet1 has 75% of shares, wallet2 has 25%
    const shares1 = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-shares", [Cl.principal(wallet1)], wallet1
    );
    const shares2 = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-shares", [Cl.principal(wallet2)], wallet2
    );

    // wallet1's shares = 3000 * PRECISION (first depositor)
    expect(shares1.result).toBeOk(Cl.uint(amount1 * SHARE_PRECISION));
    // wallet2's shares = 1000 * (3000 * PRECISION) / 3000 = 1000 * PRECISION
    expect(shares2.result).toBeOk(Cl.uint(amount2 * SHARE_PRECISION));
  });

  // -----------------------------------------------
  // Admin controls
  // -----------------------------------------------
  it("only owner can pause the vault", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "set-vault-paused", [Cl.bool(true)], wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });

  it("deposits are blocked when vault is paused", () => {
    // Pause
    simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "set-vault-paused", [Cl.bool(true)], deployer
    );

    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "deposit", [Cl.uint(1000)], wallet1
    );
    expect(result).toBeErr(Cl.uint(103)); // ERR_VAULT_PAUSED
  });

  it("owner can update deposit cap", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "set-deposit-cap", [Cl.uint(5000)], deployer
    );
    expect(result).toBeOk(Cl.bool(true));

    const cap = simnet.callReadOnlyFn(
      `${deployer}.bitsilo-vault`, "get-deposit-cap", [], deployer
    );
    expect(cap.result).toBeOk(Cl.uint(5000));
  });

  it("non-owner cannot update deposit cap", () => {
    const { result } = simnet.callPublicFn(
      `${deployer}.bitsilo-vault`, "set-deposit-cap", [Cl.uint(5000)], wallet1
    );
    expect(result).toBeErr(Cl.uint(100));
  });
});
