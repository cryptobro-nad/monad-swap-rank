"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateWalletAddress } from "@/lib/wallet-address";

export function WalletInputForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = address.trim();

    if (!validateWalletAddress(trimmedAddress)) {
      setError("Please enter a valid EVM wallet address that starts with 0x.");
      return;
    }

    setError("");
    router.push(`/wallet/${trimmedAddress}`);
  }

  return (
    <form className="mt-10 max-w-2xl" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="wallet-address">
          Wallet address
        </label>
        <input
          id="wallet-address"
          type="text"
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
            if (error) {
              setError("");
            }
          }}
          placeholder="0x1234..."
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "wallet-address-error" : undefined}
          className="h-12 rounded-md border bg-white/80 px-4 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <Button type="submit" className="h-12 gap-2">
          Check Rank
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {error ? (
        <p
          id="wallet-address-error"
          className="mt-3 rounded-md border border-accent/40 bg-white/85 px-4 py-3 text-sm font-medium text-foreground shadow-sm"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
