import { describe, expect, it } from "vitest";
import { validateWalletAddress } from "../lib/wallet-address";

describe("validateWalletAddress", () => {
  const validAddress = "0x1234567890abcdef1234567890ABCDEF12345678";

  it("passes a valid EVM address", () => {
    expect(validateWalletAddress(validAddress)).toBe(true);
  });

  it("fails empty input", () => {
    expect(validateWalletAddress("")).toBe(false);
  });

  it("fails when 0x is missing", () => {
    expect(validateWalletAddress("1234567890abcdef1234567890ABCDEF12345678")).toBe(
      false
    );
  });

  it("fails when the address is too short", () => {
    expect(validateWalletAddress("0x1234567890abcdef1234567890ABCDEF1234567")).toBe(
      false
    );
  });

  it("fails when the address is too long", () => {
    expect(
      validateWalletAddress("0x1234567890abcdef1234567890ABCDEF123456789")
    ).toBe(false);
  });

  it("fails when the address contains invalid characters", () => {
    expect(validateWalletAddress("0x1234567890abcdef1234567890ABCDEF1234567g")).toBe(
      false
    );
  });

  it("trims leading and trailing whitespace around a valid address", () => {
    expect(validateWalletAddress(`  ${validAddress}  `)).toBe(true);
  });
});
