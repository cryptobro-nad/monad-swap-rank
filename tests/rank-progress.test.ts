import { describe, expect, it } from "vitest";
import { getNextRankProgress } from "../lib/rank-progress";

describe("getNextRankProgress", () => {
  it("calculates distance and progress toward the next rank", () => {
    expect(getNextRankProgress(40_000)).toMatchObject({
      currentRank: "Heavy Nad",
      nextRank: "Whale Nad",
      nextRankThresholdUsd: 100_000,
      amountNeededUsd: 60_000,
      displayCopy: "$60,000 left to reach Whale Nad."
    });
    expect(getNextRankProgress(40_000).progressPercentage).toBeCloseTo(33.33, 2);
  });

  it("uses first-swap copy for wallets with no swap data", () => {
    expect(getNextRankProgress(0)).toMatchObject({
      currentRank: "No Swap Data",
      nextRank: "Baby Nad",
      nextRankThresholdUsd: 0,
      amountNeededUsd: 0,
      progressPercentage: 0,
      displayCopy: "Make your first swap to start your Nad journey."
    });
  });

  it("uses final boss copy for Monad Monster", () => {
    const progress = getNextRankProgress(1_000_000);

    expect(progress).toMatchObject({
      currentRank: "Monad Monster",
      amountNeededUsd: 0,
      progressPercentage: 100,
      displayCopy: "You reached the final boss tier."
    });
    expect(progress.nextRank).toBeUndefined();
    expect(progress.nextRankThresholdUsd).toBeUndefined();
  });

  it("avoids negative values for invalid or negative volume", () => {
    expect(getNextRankProgress(-250)).toMatchObject({
      currentRank: "No Swap Data",
      amountNeededUsd: 0,
      progressPercentage: 0
    });
  });

  it("uses existing rank boundaries for next-rank thresholds", () => {
    expect(getNextRankProgress(99.99)).toMatchObject({
      currentRank: "Baby Nad",
      nextRank: "Curious Nad",
      nextRankThresholdUsd: 100
    });
    expect(getNextRankProgress(100)).toMatchObject({
      currentRank: "Curious Nad",
      nextRank: "Active Nad",
      nextRankThresholdUsd: 1_000
    });
    expect(getNextRankProgress(999_999.99)).toMatchObject({
      currentRank: "Whale Nad",
      nextRank: "Monad Monster",
      nextRankThresholdUsd: 1_000_000
    });
  });
});
