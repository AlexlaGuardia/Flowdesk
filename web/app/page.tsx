import Link from "next/link";
import CRTScreen from "@/components/CRTScreen";
import StampwerkLogo from "@/components/StampwerkLogo";

const SERVICES = [
  { title: "AI PROPOSALS", description: "Answer 5 questions. AI writes a branded proposal with scope, deliverables, and pricing.", icon: "📜" },
  { title: "AUTO CONTRACTS", description: "Client accepts? Contract generates automatically. One-click signature, done.", icon: "🤝" },
  { title: "SMART INVOICING", description: "Milestone billing with Stripe payment links. AI follow-ups chase overdue payments for you.", icon: "💰" },
  { title: "CLIENT PORTAL", description: "One link gives your client everything: project status, files, invoices, milestones.", icon: "🚪" },
  { title: "BILINGUAL", description: "English and Spanish. AI generates proposals, contracts, and follow-ups in either language.", icon: "🌎" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Dark Arcade Section ── */}
      <div className="bg-stamp-900 pb-20">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-stamp-800">
          <div className="flex items-center gap-2.5">
            <StampwerkLogo size={24} />
            <span className="font-heading text-[10px] text-stamp-500 tracking-wider">
              STAMPWERK
            </span>
          </div>
          <Link
            href="/login"
            className="font-mono text-[10px] text-stamp-400 hover:text-stamp-200 uppercase tracking-[0.2em] transition-colors"
          >
            Sign In &#9654;
          </Link>
        </nav>

        {/* Hero */}
        <div className="text-center pt-14 pb-10 px-6">
          <h1
            className="font-heading text-2xl md:text-3xl text-stamp-200 tracking-wider leading-relaxed"
            style={{ textShadow: "0 0 30px rgba(139,58,42,0.5), 0 0 60px rgba(139,58,42,0.2)" }}
          >
            STAMPWERK
          </h1>
          <p className="font-mono text-[10px] text-stamp-500 mt-4 tracking-[0.35em] uppercase">
            Stop chasing clients. Start getting paid.
          </p>
          {/* Decorative pixel rule */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="h-px w-12 bg-stamp-700" />
            <div className="w-1.5 h-1.5 bg-stamp-600 rounded-sm rotate-45" />
            <div className="h-px w-12 bg-stamp-700" />
          </div>
        </div>

        {/* CRT TV */}
        <CRTScreen slides={SERVICES} autoPlayMs={4500} />

        {/* Browse hint */}
        <p className="text-center font-mono text-[9px] text-stamp-700 mt-5 tracking-[0.25em]">
          &#9664; &#9654; TO BROWSE &nbsp;|&nbsp; AUTO-ADVANCES
        </p>
      </div>

      {/* ── Pricing Section ── */}
      <div className="bg-parchment py-20 px-6">
        <div className="max-w-lg mx-auto">

          {/* Score table header */}
          <div className="text-center mb-8">
            <p className="font-heading text-[9px] text-ink-400 tracking-[0.25em] uppercase">
              Pricing
            </p>
            <div className="h-px bg-ledger mt-3" />
          </div>

          {/* Score-style pricing table */}
          <div className="card p-0 overflow-hidden mb-10">
            {/* Table header bar */}
            <div className="bg-stamp-900 px-5 py-2.5 flex items-center justify-between">
              <span className="font-heading text-[8px] text-stamp-400 tracking-wider">WHAT YOU GET</span>
              <span className="font-heading text-[8px] text-crt-amber tracking-wider">$12 / MO</span>
            </div>
            {/* Rows */}
            {[
              { label: "Clients", value: "UNLIMITED", highlight: false },
              { label: "Proposals", value: "UNLIMITED", highlight: false },
              { label: "Invoices", value: "UNLIMITED", highlight: false },
              { label: "Contracts", value: "UNLIMITED", highlight: false },
              { label: "Tiers", value: "NONE — FLAT", highlight: true },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3 font-mono text-sm border-b border-dashed border-ledger last:border-0 ${i % 2 === 0 ? "bg-paper" : "bg-parchment"}`}
              >
                <span className="uppercase tracking-wider text-ink-700 text-xs">{row.label}</span>
                <span className={`font-bold text-xs tracking-wider ${row.highlight ? "text-stamp-600" : "text-ink-500"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/login" className="btn-insert-coin inline-block">
              PRESS START
            </Link>
            <p className="font-mono text-[9px] text-ink-400 mt-5 tracking-[0.2em] animate-blink">
              FREE TRIAL &mdash; NO CREDIT CARD
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-stamp-900 border-t border-stamp-800 py-10 text-center">
        <div className="empty-stamp mx-auto" style={{ padding: "8px 20px", borderColor: "#5C2419", display: "inline-block" }}>
          <span className="font-heading text-[8px] uppercase tracking-[0.25em] text-stamp-600">Stampwerk</span>
        </div>
        <p className="font-mono text-[9px] text-stamp-700 mt-4 tracking-wider">
          &copy; {new Date().getFullYear()} &nbsp;&#9632;&nbsp; FOR FREELANCERS, BY FREELANCERS
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-stamp-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-stamp-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-ledger-green animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
