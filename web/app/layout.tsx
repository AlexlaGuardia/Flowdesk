import type { Metadata } from "next";
import { Press_Start_2P, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Stampwerk — AI Freelancer Tool | HoneyBook Alternative at $12/mo",
  description:
    "AI proposals, contracts, invoicing, and client portal for freelancers. The HoneyBook alternative that does the 80% that matters — for $12/mo flat. No tiers, no setup consultants.",
  icons: { icon: "/favicon.svg" },
  keywords: [
    "honeybook alternative",
    "freelancer invoicing tool",
    "AI proposal generator",
    "dubsado alternative",
    "freelancer business tool",
    "freelance proposal software",
    "client portal freelancer",
    "cheap honeybook alternative 2026",
  ],
  openGraph: {
    title: "Stampwerk — Stop Overpaying for Freelancer Tools",
    description:
      "AI writes your proposals. Contracts auto-generate. Invoices chase themselves. $12/mo flat — not $59.",
    url: "https://stampwerk.com",
    siteName: "Stampwerk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stampwerk — AI Freelancer Tool at $12/mo",
    description:
      "AI proposals, auto contracts, smart invoicing. The HoneyBook alternative built for freelancers who hate bloat.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${plexSans.variable} ${plexMono.variable} font-body`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
