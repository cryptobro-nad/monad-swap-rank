import { describe, expect, it } from "vitest";
import { RANK_CARD_VISUALS, getRankCardVisual } from "../lib/rank-card-visuals";
import type { RankName } from "../lib/ranking";

const ranks: RankName[] = [
  "No Swap Data",
  "Baby Nad",
  "Curious Nad",
  "Active Nad",
  "Heavy Nad",
  "Whale Nad",
  "Monad Monster"
];

describe("rank card visuals", () => {
  it("maps every rank to a real uploaded rank image path", () => {
    expect(Object.keys(RANK_CARD_VISUALS).sort()).toEqual([...ranks].sort());

    for (const rank of ranks) {
      expect(getRankCardVisual(rank)).toMatchObject({
        rank,
        imagePath: expect.stringMatching(/^\/rank-images\/.+\.webp$/)
      });
    }
  });

  it("uses the approved tagline copy", () => {
    expect(getRankCardVisual("No Swap Data").tagline).toBe(
      "No swaps, only aura."
    );
    expect(getRankCardVisual("Heavy Nad").tagline).toBe(
      "Rotating harder than a washing machine."
    );
    expect(getRankCardVisual("Monad Monster").tagline).toBe(
      "This wallet needs its own warning label."
    );
  });
});
