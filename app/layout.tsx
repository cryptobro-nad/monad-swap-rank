import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monad Swap Rank",
  description: "Estimate a Monad wallet rank from swap volume."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
