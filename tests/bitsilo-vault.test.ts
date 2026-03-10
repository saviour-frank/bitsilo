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