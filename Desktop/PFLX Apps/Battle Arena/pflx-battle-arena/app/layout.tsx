import type { Metadata } from "next";
import "./globals.css";
import PflxBridge from "./components/PflxBridge";

export const metadata: Metadata = {
  title: "PFLX Battle Arena",
  description: "Enter the arena. Wager XC. Prove your skills. Claim victory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pflx-darker text-gray-200">
        {/* Animated grid background */}
        <div className="arena-grid-bg" />
        {/* Scan line overlay */}
        <div className="scan-overlay" />
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
        {/* Cross-app PFLX message bridge */}
        <PflxBridge />
      </body>
    </html>
  );
}
