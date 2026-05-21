"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareResultButtonProps = {
  resultText: string;
  label?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  messageClassName?: string;
};

export function ShareResultButton({
  resultText,
  label = "Copy / Share Result",
  variant,
  className,
  messageClassName
}: ShareResultButtonProps) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Monad Swap Rank",
          text: resultText
        });
        setMessage("Shared result.");
        return;
      }

      await navigator.clipboard.writeText(resultText);
      setMessage("Copied result text.");
    } catch {
      setMessage("Copy or share was cancelled.");
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        className={cn("h-12 gap-2", className)}
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
      {message ? (
        <p
          className={cn(
            "mt-2 text-sm font-medium text-muted-foreground",
            messageClassName
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
