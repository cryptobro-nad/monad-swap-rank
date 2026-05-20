import { NextResponse } from "next/server";
import { getMockWalletRankResult } from "@/lib/mock-wallet-result";
import { validateWalletAddress } from "@/lib/wallet-address";

type WalletRouteContext = {
  params: Promise<{
    address: string;
  }>;
};

export async function GET(_request: Request, { params }: WalletRouteContext) {
  const { address } = await params;
  const walletAddress = decodeURIComponent(address).trim();

  if (!validateWalletAddress(walletAddress)) {
    return NextResponse.json(
      {
        error: "Please enter a valid EVM wallet address that starts with 0x."
      },
      { status: 400 }
    );
  }

  return NextResponse.json(getMockWalletRankResult(walletAddress));
}
