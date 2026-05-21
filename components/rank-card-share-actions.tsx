"use client";

import { useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { ShareableRankCard } from "@/components/shareable-rank-card";
import { ShareResultButton } from "@/components/share-result-button";
import { Button } from "@/components/ui/button";
import {
  canSharePngFile,
  getRankCardFileName,
  RANK_CARD_EXPORT_MIME_TYPE
} from "@/lib/rank-card-export";
import type { RankCardVisual } from "@/lib/rank-card-visuals";

type RankCardShareActionsProps = {
  visual: RankCardVisual;
  shareText: string;
};

const EXPORT_SCALE = 2;
type PendingAction = "share" | "download" | null;

export function RankCardShareActions({
  visual,
  shareText
}: RankCardShareActionsProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function handleShareCard() {
    setPendingAction("share");
    setStatusMessage("");

    try {
      const { file } = await createRankCardImageFile(cardRef.current, visual);

      if (navigator.share && canSharePngFile(navigator, file)) {
        await navigator.share({
          title: "Monad Swap Rank",
          text: shareText,
          files: [file]
        });
        setStatusMessage("Shared card image.");
        return;
      }

      const copiedText = await copyShareTextFallback(shareText);
      setStatusMessage(
        copiedText
          ? "Copied share text."
          : "Image sharing is not supported here. Copy the share text instead."
      );
    } catch {
      const copiedText = await copyShareTextFallback(shareText);
      setStatusMessage(
        copiedText
          ? "Copied share text."
          : "Could not share the card image. Copy the share text instead."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDownloadCard() {
    setPendingAction("download");
    setStatusMessage("");

    try {
      const { blob, fileName } = await createRankCardImageFile(
        cardRef.current,
        visual
      );
      downloadBlob(blob, fileName);
      setStatusMessage("Downloaded card PNG.");
    } catch {
      setStatusMessage("Could not download the card image. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section aria-label="Share rank card">
      <ShareableRankCard ref={cardRef} visual={visual} />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
        <Button
          type="button"
          className="h-12 gap-2"
          onClick={handleShareCard}
          disabled={pendingAction !== null}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {pendingAction === "share" ? "Preparing Card" : "Share Card"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 border-white/15 bg-white/[0.08] text-white hover:bg-white/15 hover:text-white"
          onClick={handleDownloadCard}
          disabled={pendingAction !== null}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {pendingAction === "download" ? "Preparing Card" : "Download Card"}
        </Button>

        <ShareResultButton
          resultText={shareText}
          label="Copy Share Text"
          variant="outline"
          className="border-white/15 bg-white/[0.08] text-white hover:bg-white/15 hover:text-white"
          messageClassName="text-white/68"
        />
      </div>
      {statusMessage ? (
        <p className="mt-2 text-sm font-medium text-white/68">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}

async function createRankCardImageFile(
  cardElement: HTMLElement | null,
  visual: RankCardVisual
): Promise<{ blob: Blob; file: File; fileName: string }> {
  if (!cardElement) {
    throw new Error("Missing rank card element.");
  }

  const blob = await renderRankCardToPngBlob(cardElement, visual);
  const fileName = getRankCardFileName(visual.rank);
  const file = new File([blob], fileName, {
    type: RANK_CARD_EXPORT_MIME_TYPE
  });

  return { blob, file, fileName };
}

async function renderRankCardToPngBlob(
  cardElement: HTMLElement,
  visual: RankCardVisual
): Promise<Blob> {
  const rect = cardElement.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width));
  const height = Math.max(400, Math.round(rect.height));
  const canvas = document.createElement("canvas");
  canvas.width = width * EXPORT_SCALE;
  canvas.height = height * EXPORT_SCALE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.scale(EXPORT_SCALE, EXPORT_SCALE);
  await drawRankCard(context, visual, width, height);

  return await canvasToBlob(canvas);
}

async function drawRankCard(
  context: CanvasRenderingContext2D,
  visual: RankCardVisual,
  width: number,
  height: number
) {
  context.fillStyle = "#12051f";
  context.fillRect(0, 0, width, height);

  const image = await loadImage(visual.imagePath);
  drawImageCover(context, image, width, height);
  drawOverlays(context, width, height);
  drawBranding(context, width);
  drawRankText(context, visual, width, height);
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;
  const drawWidth = imageRatio > canvasRatio ? height * imageRatio : width;
  const drawHeight = imageRatio > canvasRatio ? height : width / imageRatio;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function drawOverlays(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const verticalGradient = context.createLinearGradient(0, 0, 0, height);
  verticalGradient.addColorStop(0, "rgba(9, 3, 19, 0.2)");
  verticalGradient.addColorStop(0.46, "rgba(9, 3, 19, 0.58)");
  verticalGradient.addColorStop(1, "rgba(9, 3, 19, 0.94)");
  context.fillStyle = verticalGradient;
  context.fillRect(0, 0, width, height);

  const purpleGlow = context.createRadialGradient(
    width * 0.18,
    height * 0.18,
    0,
    width * 0.18,
    height * 0.18,
    Math.min(width, height) * 0.55
  );
  purpleGlow.addColorStop(0, "rgba(146, 82, 255, 0.5)");
  purpleGlow.addColorStop(1, "rgba(146, 82, 255, 0)");
  context.fillStyle = purpleGlow;
  context.fillRect(0, 0, width, height);

  const greenGlow = context.createRadialGradient(
    width * 0.82,
    height * 0.12,
    0,
    width * 0.82,
    height * 0.12,
    Math.min(width, height) * 0.48
  );
  greenGlow.addColorStop(0, "rgba(29, 185, 148, 0.24)");
  greenGlow.addColorStop(1, "rgba(29, 185, 148, 0)");
  context.fillStyle = greenGlow;
  context.fillRect(0, 0, width, height);
}

function drawBranding(context: CanvasRenderingContext2D, width: number) {
  const padding = getCardPadding(width);
  const pillWidth = 178;
  const pillHeight = 34;

  drawRoundedRect(context, padding, padding, pillWidth, pillHeight, 6);
  context.fillStyle = "rgba(0, 0, 0, 0.3)";
  context.fill();
  context.strokeStyle = "rgba(255, 255, 255, 0.2)";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "rgba(255, 255, 255, 0.86)";
  context.font = "700 12px Arial, sans-serif";
  context.textBaseline = "middle";
  context.fillText("MONAD SWAP RANK", padding + 14, padding + pillHeight / 2);
}

function drawRankText(
  context: CanvasRenderingContext2D,
  visual: RankCardVisual,
  width: number,
  height: number
) {
  const padding = getCardPadding(width);
  const maxTextWidth = Math.min(width - padding * 2, 760);
  const rankFontSize = clamp(width * 0.115, 48, 96);
  const taglineFontSize = clamp(width * 0.055, 24, 42);
  const taglineLines = wrapText(
    context,
    visual.tagline,
    `700 ${taglineFontSize}px Arial, sans-serif`,
    maxTextWidth
  );
  const taglineLineHeight = taglineFontSize * 1.18;
  const taglineHeight = taglineLines.length * taglineLineHeight;
  const rankY = height - padding - taglineHeight - rankFontSize * 1.1;

  context.shadowColor = "rgba(0, 0, 0, 0.9)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 4;
  context.fillStyle = "#ffffff";
  context.textBaseline = "alphabetic";
  context.font = `900 ${rankFontSize}px Arial Black, Arial, sans-serif`;
  context.fillText(visual.rank, padding, rankY);

  context.font = `700 ${taglineFontSize}px Arial, sans-serif`;
  for (const [index, line] of taglineLines.entries()) {
    context.fillText(
      line,
      padding,
      height - padding - taglineHeight + taglineLineHeight * (index + 0.78)
    );
  }

  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;
}

function getCardPadding(width: number): number {
  return width >= 640 ? 32 : 20;
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number
): string[] {
  context.font = font;

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Rank image could not load."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG export failed."));
        return;
      }

      resolve(blob);
    }, RANK_CARD_EXPORT_MIME_TYPE);
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyShareTextFallback(shareText: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) {
      return false;
    }

    await navigator.clipboard.writeText(shareText);
    return true;
  } catch {
    return false;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
