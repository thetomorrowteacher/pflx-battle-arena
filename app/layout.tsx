import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import PflxBridge from "./components/PflxBridge";
import PflxIframeGuard from "./components/PflxIframeGuard";
import RoleGuard from "./components/RoleGuard";
import CloudSaveToast from "./components/CloudSaveToast";

export const metadata: Metadata = {
  title: "PFLX Battle Arena",
  description: "Enter the arena. Wager XC. Prove your skills. Claim victory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        PFLX shared sub-app bootstrap — must run before the page renders so
        the cohort access gate can block this app's UI from drawing when the
        player isn't allowed in. Two scripts in order: (1) declare the app
        key so the bootstrap knows what it's gating, (2) load the shared
        bootstrap from the pathway-portal CDN so every sub-app stays in
        lock-step with the platform-side gate spec.
      */}
      <Script id="pflx-app-key" strategy="beforeInteractive">
        {`window.PFLX_APP_KEY = 'arena';`}
      </Script>
      <Script
        src="https://pflx-pathway-portal.vercel.app/pflx-app-bootstrap.js"
        strategy="beforeInteractive"
      />
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
        <PflxIframeGuard />
        <RoleGuard />
        <CloudSaveToast />
      </body>
    </html>
  );
}
