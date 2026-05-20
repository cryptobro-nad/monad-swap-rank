export function validateWalletAddress(address: string): boolean {
  if (typeof address !== "string") {
    return false;
  }

  const trimmedAddress = address.trim();

  return /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress);
}
