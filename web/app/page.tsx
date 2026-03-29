import Link from "next/link";
import CRTScreen from "@/components/CRTScreen";

const SERVICES = [
  { title: "AI PROPOSALS", description: "Answer 5 questions. AI writes a branded proposal with scope, deliverables, and pricing.", icon: "\uD83D\uDCDC" },
  { title: "AUTO CONTRACTS", description: "Client accepts? Contract generates automatically. One-click signature, done.", icon: "\uD83E\uDD1D" },
  { title: "SMART INVOICING", description: "Milestone billing with Stripe payment links. AI follow-ups chase overdue payments for you.", icon: "\uD83D\uDCB0" },
  { title: "CLIENT PORTAL", description: "One link gives your client everything: project status, files, invoices, milestones.", icon: "\uD83D\uDEAA" },
  { title: "BILINGUAL", description: "English and Spanish. AI generates proposals, contracts, and follow-ups in either language.", icon: "\uD83C\uDF0E" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Dark Arcade Section ── */}
      <div className="bg-stamp-900 pb-16">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <h1 className="font-heading text-base text-stamp-300 tracking-wider" style={{ textShadow: "0 0 10px rgba(139,58,42,0.5)" }}>
            STAMPWERK
          </h1>
          <Link href="/login" className="font-mono text-xs text-stamp-400 hover:text-stamp-200 uppercase tracking-wider">
            Sign In
          </Link>
        </nav>

        {/* Title */}
        <div className="text-center pt-8 pb-12 px-6">
          <h2 className="font-heading text-2xl md:text-3xl text-stamp-200 tracking-wider" style={{ textShadow: "0 0 20px rgba(139,58,42,0.4)" }}>
            STAMPWERK
          </h2>
          <p className="font-mono text-xs text-stamp-500 mt-3 tracking-[0.3em] uppercase">
            Freelancer Battle Station
          </p>
        </div>

        {/* CRT TV */}
        <CRTScreen slides={SERVICES} autoPlayMs={4500} />

        {/* Browse hint */}
        <p className="text-center font-mono text-[10px] text-stamp-600 mt-6 tracking-wider">
          USE &#9664; &#9654; TO BROWSE SERVICES
        </p>
      </div>

      {/* ── Light Pricing Section ── */}
      <div className="bg-parchment py-20 px-6">
        <div className="max-w-lg mx-auto">
          {/* Score-style pricing */}
          <div className="font-mono text-sm text-ink-700 space-y-2 mb-10">
            <div className="flex justify-between border-b border-dashed border-ledger pb-1">
              <span className="uppercase tracking-wider">Subscription</span>
              <span className="font-bold text-ink-900 text-lg">$12/MO</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-ledger pb-1">
              <span className="uppercase tracking-wider">Clients</span>
              <span className="text-ink-500">UNLIMITED</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-ledger pb-1">
              <span className="uppercase tracking-wider">Proposals</span>
              <span className="text-ink-500">UNLIMITED</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-ledger pb-1">
              <span className="uppercase tracking-wider">Invoices</span>
              <span className="text-ink-500">UNLIMITED</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase tracking-wider">Tiers</span>
              <span className="text-stamp-600 font-bold">NONE</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/login" className="btn-insert-coin inline-block">
              PRESS START
            </Link>
            <p className="font-mono text-[10px] text-ink-400 mt-4 tracking-wider animate-blink">
              FREE TRIAL &mdash; NO CREDIT CARD
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-stamp-900 py-8 text-center">
        <div className="empty-stamp mx-auto rotate-[-4deg]" style={{ padding: "6px 16px", borderColor: "#5C2419" }}>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stamp-600">Stampwerk</span>
        </div>
        <p className="text-[10px] text-stamp-700 mt-3 font-mono">&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
