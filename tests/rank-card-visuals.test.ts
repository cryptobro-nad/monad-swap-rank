import { describe, expect, it } from "vitest";
import {
  RANK_CARD_VISUALS,
  getRankCardTagline,
  getRankCardVisual
} from "../lib/rank-card-visuals";
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
        tagline: expect.any(String),
        imagePath: expect.stringMatching(/^\/rank-images\/.+\.webp$/)
      });
      expect(RANK_CARD_VISUALS[rank].taglines.length).toBeGreaterThan(1);
    }
  });

  it("uses the approved tagline pools", () => {
    expect(RANK_CARD_VISUALS["No Swap Data"].taglines).toEqual([
      "No swaps, only aura.",
      "Observer mode activated.",
      "This wallet came to watch, not rotate.",
      "Still loading the degen arc.",
      "Zero swaps, maximum mystery."
    ]);
    expect(RANK_CARD_VISUALS["Heavy Nad"].taglines).toContain(
      "Rotating harder than a washing machine."
    );
    expect(RANK_CARD_VISUALS["Monad Monster"].taglines).toContain(
      "This wallet needs its own warning label."
    );
  });

  it("returns the same tagline for the same wallet and rank", () => {
    const wallet = "0xa4bB6472656E8D75A3590E4fDbE0d8C16C6d3369";

    expect(getRankCardTagline("Active Nad", wallet)).toBe(
      getRankCardTagline("Active Nad", wallet)
    );
  });

  it("can return different taglines for different wallets", () => {
    const firstWallet = "0x0000000000000000000000000000000000000001";
    const secondWallet = "0x0000000000000000000000000000000000000002";

    expect(getRankCardTagline("Active Nad", firstWallet)).not.toBe(
      getRankCardTagline("Active Nad", secondWallet)
    );
  });

  it("selects taglines from the correct rank pool", () => {
    const wallet = "0x0000000000000000000000000000000000000001";

    for (const rank of ranks) {
      expect(RANK_CARD_VISUALS[rank].taglines).toContain(
        getRankCardVisual(rank, wallet).tagline
      );
    }
  });

  it("uses a safe fallback when the wallet address is missing", () => {
    const visual = getRankCardVisual("Baby Nad");

    expect(visual.rank).toBe("Baby Nad");
    expect(RANK_CARD_VISUALS["Baby Nad"].taglines).toContain(visual.tagline);
  });
});
