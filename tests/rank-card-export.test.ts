import { describe, expect, it } from "vitest";
import {
  canSharePngFile,
  getRankCardFileName,
  RANK_CARD_EXPORT_MIME_TYPE
} from "../lib/rank-card-export";

describe("rank card export helpers", () => {
  it("builds stable PNG filenames from rank names", () => {
    expect(getRankCardFileName("No Swap Data")).toBe(
      "monad-swap-rank-no-swap-data.png"
    );
    expect(getRankCardFileName("Monad Monster")).toBe(
      "monad-swap-rank-monad-monster.png"
    );
  });

  it("detects whether the browser can share PNG files", () => {
    const file = new File(["card"], "card.png", {
      type: RANK_CARD_EXPORT_MIME_TYPE
    });

    expect(
      canSharePngFile(
        {
          canShare: (data) => data.files?.[0] === file
        },
        file
      )
    ).toBe(true);
    expect(canSharePngFile(undefined, file)).toBe(false);
    expect(
      canSharePngFile(
        {
          canShare: () => {
            throw new Error("unsupported");
          }
        },
        file
      )
    ).toBe(false);
  });
});
