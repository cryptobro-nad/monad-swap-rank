import type { RankName } from "./ranking";

export const RANK_CARD_EXPORT_MIME_TYPE = "image/png";

type ShareCapability = {
  canShare?: (data: { files?: File[] }) => boolean;
};

export function getRankCardFileName(rank: RankName): string {
  const slug = rank
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `monad-swap-rank-${slug}.png`;
}

export function canSharePngFile(
  navigatorLike: ShareCapability | undefined,
  file: File
): boolean {
  try {
    return Boolean(
      navigatorLike?.canShare?.({
        files: [file]
      })
    );
  } catch {
    return false;
  }
}
