import { describe, expect, it } from "vitest";
import { DISCLAIMER } from "../lib/constants";
import { getAppStatus } from "../lib/foundation";

describe("app foundation", () => {
  it("identifies the app", () => {
    expect(getAppStatus().name).toBe("Monad Swap Rank");
  });

  it("keeps deferred features disabled in task one", () => {
    expect(getAppStatus()).toMatchObject({
      hasRealApiIntegration: false,
      hasDatabase: false,
      hasRedis: false,
      hasWalletConnect: false,
      hasLeaderboard: false
    });
  });

  it("includes the required disclaimer boundaries", () => {
    expect(DISCLAIMER).toContain("estimated swap volume");
    expect(DISCLAIMER).toContain("not financial advice");
    expect(DISCLAIMER).toContain("not an official Monad ranking");
  });
});
