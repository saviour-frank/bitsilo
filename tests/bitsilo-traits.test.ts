import { describe, expect, it } from "vitest";

describe("bitsilo-traits", () => {
  it("deploys successfully", () => {
    // The traits contract should deploy without errors.
    const contracts = simnet.getContractsInterfaces();
    expect(contracts.has(`${simnet.deployer}.bitsilo-traits`)).toBe(true);
  });
});
