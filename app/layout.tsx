import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CKBProvider from "@/components/CKBProvider"


export const metadata: Metadata = {
  title: "ContestLedger — Win. Create. Get Paid. On-chain.",
  description:
    "The decentralized contest platform where rewards are locked in escrow, votes happen at the speed of light, and winners are proven forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text antialiased">
        <CKBProvider>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        </CKBProvider>
      </body>
    </html>
  );
}
