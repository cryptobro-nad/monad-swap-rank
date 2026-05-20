"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareResultButtonProps = {
  resultText: string;
};

export function ShareResultButton({ resultText }: ShareResultButtonProps) {
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
      <Button type="button" className="h-12 gap-2" onClick={handleShare}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Copy / Share Result
      </Button>
      {message ? (
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
