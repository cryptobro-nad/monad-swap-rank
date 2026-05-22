import {
  formatUsd,
  getRankFromVolume,
  RANK_MINIMUM_VOLUME_USD,
  RANK_ORDER,
  type RankName
} from "./ranking";

export type NextRankProgress = {
  currentRank: RankName;
  nextRank?: RankName;
  nextRankThresholdUsd?: number;
  amountNeededUsd: number;
  progressPercentage: number;
  displayCopy: string;
};

export function getNextRankProgress(volumeUsd: number): NextRankProgress {
  const safeVolumeUsd = Number.isFinite(volumeUsd) && volumeUsd > 0 ? volumeUsd : 0;
  const currentRank = getRankFromVolume(safeVolumeUsd).rank;
  const currentRankIndex = RANK_ORDER.indexOf(currentRank);
  const nextRank = RANK_ORDER[currentRankIndex + 1];

  if (currentRank === "No Swap Data") {
    return {
      currentRank,
      nextRank,
      nextRankThresholdUsd: RANK_MINIMUM_VOLUME_USD["Baby Nad"],
      amountNeededUsd: 0,
      progressPercentage: 0,
      displayCopy: "Make your first swap to start your Nad journey."
    };
  }

  if (!nextRank) {
    return {
      currentRank,
      amountNeededUsd: 0,
      progressPercentage: 100,
      displayCopy: "You reached the final boss tier."
    };
  }

  const currentRankThresholdUsd = RANK_MINIMUM_VOLUME_USD[currentRank];
  const nextRankThresholdUsd = RANK_MINIMUM_VOLUME_USD[nextRank];
  const amountNeededUsd = Math.max(nextRankThresholdUsd - safeVolumeUsd, 0);
  const progressPercentage = getProgressPercentage(
    safeVolumeUsd,
    currentRankThresholdUsd,
    nextRankThresholdUsd
  );

  return {
    currentRank,
    nextRank,
    nextRankThresholdUsd,
    amountNeededUsd,
    progressPercentage,
    displayCopy: `You are around ${formatUsd(amountNeededUsd)} away from ${nextRank}.`
  };
}

function getProgressPercentage(
  volumeUsd: number,
  currentRankThresholdUsd: number,
  nextRankThresholdUsd: number
): number {
  const rankRangeUsd = nextRankThresholdUsd - currentRankThresholdUsd;

  if (rankRangeUsd <= 0) {
    return 0;
  }

  const progress = ((volumeUsd - currentRankThresholdUsd) / rankRangeUsd) * 100;

  return Math.min(Math.max(progress, 0), 100);
}
