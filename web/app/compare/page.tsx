import type { Metadata } from "next";
import Link from "next/link";
import StampwerkLogo from "@/components/StampwerkLogo";

export const metadata: Metadata = {
  title: "HoneyBook Alternative 2026 — Stampwerk vs Dubsado, Moxie, Bonsai",
  description:
    "Compare Stampwerk to HoneyBook, Dubsado, Moxie, and Bonsai. AI proposals, auto contracts, smart invoicing at $12/mo flat. See why freelancers are switching in 2026.",
  keywords: [
    "honeybook alternative",
    "honeybook alternative 2026",
    "dubsado alternative",
    "fiverr workspace alternative",
    "and.co alternative",
    "bonsai alternative",
    "moxie alternative",
    "freelancer invoicing tool",
    "freelancer proposal software",
    "cheap honeybook alternative",
    "AI proposal generator freelancer",
  ],
  openGraph: {
    title: "HoneyBook Alternative 2026 — Stampwerk Comparison",
    description:
      "Side-by-side: Stampwerk vs HoneyBook, Dubsado, Moxie, Bonsai. AI-native freelancer tool at $12/mo.",
    url: "https://stampwerk.com/compare",
  },
};

const FEATURES = [
  {
    feature: "AI Proposals",
    stampwerk: "LLM-powered (Llama 3.3 70B). Answer 5 questions, get a real proposal.",
    honeybook: "Template-fill. Users report it invents meeting times and prices.",
    dubsado: "No AI. Manual templates only.",
    moxie: "No AI. Template library.",
    bonsai: "No AI. Template library.",
  },
  {
    feature: "Contracts",
    stampwerk: "Auto-generated from accepted proposals. One-click e-sign.",
    honeybook: "Template-based. Separate from proposals.",
    dubsado: "Template-based. Powerful but complex setup.",
    moxie: "Template-based contracts.",
    bonsai: "Template-based. Decent library.",
  },
  {
    feature: "Invoicing",
    stampwerk: "Milestone billing. Stripe payment links. AI follow-up daemon.",
    honeybook: "Built-in payments. 2.9% + $0.30 processing.",
    dubsado: "Stripe/Square integration. Manual reminders.",
    moxie: "Stripe integration. Manual reminders.",
    bonsai: "Built-in. Locked behind $25/mo tier.",
  },
  {
    feature: "Follow-up Reminders",
    stampwerk: "Automatic 3-step AI escalation. Friendly, firm, final.",
    honeybook: "Manual reminder button.",
    dubsado: "Workflow automations (complex setup).",
    moxie: "Manual reminders.",
    bonsai: "Manual reminders.",
  },
  {
    feature: "Client Portal",
    stampwerk: "One shareable link. Project status, files, invoices.",
    honeybook: "Yes, built-in.",
    dubsado: "Yes, customizable (heavy setup).",
    moxie: "Yes, built-in.",
    bonsai: "Limited. Invoice/contract links only.",
  },
  {
    feature: "Onboarding",
    stampwerk: "Google sign-in. 30 seconds to first proposal.",
    honeybook: "Email signup. Guided setup wizard.",
    dubsado: "Email signup. Weeks to configure properly.",
    moxie: "Email signup. Moderate setup.",
    bonsai: "Email signup. Quick setup.",
  },
  {
    feature: "Pricing",
    stampwerk: "$0 free / $12 pro. No tiers.",
    honeybook: "$36/mo starter, $59 essentials, $129 premium.",
    dubsado: "$35/mo or $55/mo. No free tier.",
    moxie: "$12/mo starter, $40/mo pro.",
    bonsai: "$15/mo starter, $25 pro, $59 business.",
  },
];

const COMPETITORS = [
  {
    name: "HoneyBook",
    verdict: "The one that got greedy",
    pain: [
      "89% price hike in 2025. Loyalty discount expired Feb 2026.",
      "AI assistant invents data. Users report fabricated meeting times and prices.",
      "Starter tier ($36/mo) limits you to one project pipeline.",
      "$479M in funding. You are paying for their investors, not your features.",
    ],
    who: "Freelancers who need a full CRM with scheduling, forms, and team features.",
  },
  {
    name: "Dubsado",
    verdict: "The one that needs a consultant",
    pain: [
      "So complex that a cottage industry of $500-$3,500 setup specialists exists.",
      "No AI. Every proposal, contract, and email is manual.",
      "3.0 rebuild has been in progress for years. Uncertain roadmap.",
      "Minimum $35/mo with no free tier to test it.",
    ],
    who: "Photographers and wedding vendors who need deep workflow automation and will invest time to configure it.",
  },
  {
    name: "Bonsai",
    verdict: "The one Zoom bought",
    pain: [
      "Acquired by Zoom in 2025. Roadmap uncertainty.",
      "Invoicing locked behind $25/mo Professional tier.",
      "No AI features anywhere in the product.",
      "Tax + accounting features bloat the interface for simple freelancers.",
    ],
    who: "International freelancers who need tax prep and accounting baked in.",
  },
  {
    name: "Moxie",
    verdict: "The closest competitor",
    pain: [
      "Same $12/mo price point but zero AI. Template-based everything.",
      "No AI proposals, no AI follow-ups, no auto-generated contracts.",
      "Mobile app and virtual phone are strong, but not the core workflow.",
    ],
    who: "Mobile-first freelancers who want a virtual business phone and on-the-go invoicing.",
  },
  {
    name: "AND.CO / Fiverr Workspace",
    verdict: "The one that died",
    pain: [
      "Shut down March 1, 2026. Gone.",
      "No migration path. Users lost templates and client history.",
      "Fiverr decided freelancer tools were not worth maintaining.",
    ],
    who: "Nobody, anymore. If this was your tool, you need a new home.",
  },
];

const EVENTS = [
  {
    date: "Feb 2026",
    event: "HoneyBook loyalty discount expires",
    detail: "20% off for early adopters is gone. Full $59-$129/mo pricing hits.",
  },
  {
    date: "Mar 2026",
    event: "AND.CO / Fiverr Workspace shuts down",
    detail: "No migration path. Users scramble for alternatives.",
  },
  {
    date: "2025",
    event: "Bonsai acquired by Zoom",
    detail: "Product roadmap uncertain. Features may change or disappear.",
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <StampwerkLogo size={24} />
          <span className="font-heading text-xs text-stamp-600 tracking-wider">
            STAMPWERK
          </span>
        </Link>
        <Link
          href="/login"
          className="font-mono text-xs text-stamp-500 hover:text-stamp-700 uppercase tracking-[0.2em] transition-colors"
        >
          Sign In &#9654;
        </Link>
      </nav>

      {/* Hero */}
      <section className="bg-stamp-900 py-20 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs text-stamp-400 tracking-[0.3em] uppercase mb-6">
            Freelancer Tool Comparison 2026
          </p>
          <h1
            className="font-heading text-base md:text-lg lg:text-xl text-stamp-100 tracking-wider leading-relaxed"
            style={{ textShadow: "0 0 30px rgba(139,58,42,0.5)" }}
          >
            Three tools died in two months.<br />
            Here is what replaced them.
          </h1>
          <p className="text-stamp-300 text-base mt-6 max-w-xl mx-auto leading-relaxed">
            HoneyBook hiked prices 89%. AND.CO shut down. Bonsai got acquired.
            If you are comparing freelancer tools right now, this page saves you the research.
          </p>
        </div>
      </section>

      {/* What happened */}
      <section className="py-16 px-6 bg-kraft">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-heading text-sm text-ink-700 tracking-[0.25em] uppercase">
              What happened
            </p>
            <div className="h-px bg-ledger mt-3 max-w-[80px] mx-auto" />
          </div>

          <div className="space-y-4">
            {EVENTS.map((e) => (
              <div key={e.date} className="card p-5 flex items-start gap-4">
                <span className="font-mono text-xs text-stamp-600 tracking-wider whitespace-nowrap mt-0.5">
                  {e.date}
                </span>
                <div>
                  <p className="font-mono text-xs text-ink-900 font-semibold tracking-wide">
                    {e.event}
                  </p>
                  <p className="text-ink-500 text-sm mt-1">{e.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Price Comparison */}
      <section className="py-20 px-6 bg-stamp-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-heading text-sm text-stamp-400 tracking-[0.25em] uppercase">
              Monthly Cost
            </p>
            <h2
              className="font-heading text-sm md:text-base text-stamp-200 tracking-wider mt-3"
              style={{ textShadow: "0 0 20px rgba(139,58,42,0.4)" }}
            >
              What you actually pay
            </h2>
            <div className="h-px bg-stamp-700 mt-5 max-w-[80px] mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "HoneyBook", price: "$59", sub: "essentials tier", highlight: false },
              { name: "Dubsado", price: "$35", sub: "no free tier", highlight: false },
              { name: "Bonsai", price: "$25", sub: "to unlock invoicing", highlight: false },
              { name: "Moxie", price: "$12", sub: "no AI included", highlight: false },
              { name: "Stampwerk", price: "$12", sub: "AI included. Done.", highlight: true },
            ].map((t) => (
              <div
                key={t.name}
                className={`rounded-arcade p-5 text-center ${
                  t.highlight
                    ? "bg-stamp-50 border-2 border-stamp-600 shadow-hard"
                    : "bg-paper border border-ledger"
                }`}
              >
                <p className="font-mono text-xs text-ink-500 tracking-wider mb-2">
                  {t.name}
                </p>
                <p
                  className={`font-heading text-lg tracking-wider ${
                    t.highlight ? "text-stamp-600" : "text-ink-800"
                  }`}
                >
                  {t.price}
                </p>
                <p className="font-mono text-xs text-ink-400 mt-1">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature-by-Feature */}
      <section className="py-20 px-6 bg-parchment">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-heading text-sm text-ink-700 tracking-[0.25em] uppercase">
              Feature by Feature
            </p>
            <h2 className="font-heading text-sm md:text-base text-ink-900 tracking-wider mt-3">
              What each tool actually does
            </h2>
            <div className="h-px bg-ledger mt-5 max-w-[80px] mx-auto" />
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block card p-0 overflow-hidden">
            <div className="bg-stamp-800 px-4 py-3 grid grid-cols-6 gap-3">
              {["Feature", "Stampwerk", "HoneyBook", "Dubsado", "Moxie", "Bonsai"].map(
                (h) => (
                  <span
                    key={h}
                    className="font-heading text-xs text-stamp-400 tracking-wider"
                  >
                    {h}
                  </span>
                )
              )}
            </div>
            {FEATURES.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-6 gap-3 px-4 py-3 border-b border-dashed border-ledger last:border-0 ${
                  i % 2 === 0 ? "bg-paper" : "bg-parchment"
                }`}
              >
                <span className="font-mono text-xs text-ink-900 font-semibold tracking-wide">
                  {row.feature}
                </span>
                <span className="text-xs text-stamp-700 font-medium leading-snug">
                  {row.stampwerk}
                </span>
                <span className="text-xs text-ink-500 leading-snug">
                  {row.honeybook}
                </span>
                <span className="text-xs text-ink-500 leading-snug">
                  {row.dubsado}
                </span>
                <span className="text-xs text-ink-500 leading-snug">
                  {row.moxie}
                </span>
                <span className="text-xs text-ink-500 leading-snug">
                  {row.bonsai}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-6">
            {FEATURES.map((row) => (
              <div key={row.feature} className="card p-5">
                <p className="font-heading text-xs text-ink-900 tracking-[0.15em] uppercase mb-4">
                  {row.feature}
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="font-mono text-xs text-stamp-600 tracking-wider w-20 shrink-0 mt-0.5">
                      Stampwerk
                    </span>
                    <span className="text-xs text-stamp-700 font-medium leading-snug">
                      {row.stampwerk}
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-mono text-xs text-ink-400 tracking-wider w-20 shrink-0 mt-0.5">
                      HoneyBook
                    </span>
                    <span className="text-xs text-ink-500 leading-snug">{row.honeybook}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-mono text-xs text-ink-400 tracking-wider w-20 shrink-0 mt-0.5">
                      Dubsado
                    </span>
                    <span className="text-xs text-ink-500 leading-snug">{row.dubsado}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-mono text-xs text-ink-400 tracking-wider w-20 shrink-0 mt-0.5">
                      Moxie
                    </span>
                    <span className="text-xs text-ink-500 leading-snug">{row.moxie}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="font-mono text-xs text-ink-400 tracking-wider w-20 shrink-0 mt-0.5">
                      Bonsai
                    </span>
                    <span className="text-xs text-ink-500 leading-snug">{row.bonsai}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Breakdowns */}
      <section className="py-20 px-6 bg-paper">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-heading text-sm text-ink-700 tracking-[0.25em] uppercase">
              The honest breakdown
            </p>
            <h2 className="font-heading text-sm md:text-base text-ink-900 tracking-wider mt-3">
              Every tool has a catch
            </h2>
            <div className="h-px bg-ledger mt-5 max-w-[80px] mx-auto" />
          </div>

          <div className="space-y-8">
            {COMPETITORS.map((c) => (
              <div key={c.name} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading text-xs text-ink-900 tracking-[0.15em] uppercase">
                    {c.name}
                  </h3>
                  <span className="font-mono text-xs text-stamp-500 tracking-wider">
                    {c.verdict}
                  </span>
                </div>
                <ul className="space-y-2 mb-4">
                  {c.pain.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-void-red mt-1 text-xs">&#9632;</span>
                      <span className="text-sm text-ink-600 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-dashed border-ledger pt-3">
                  <p className="text-xs text-ink-400">
                    <span className="font-mono text-xs tracking-wider text-ink-500">
                      Best for:{" "}
                    </span>
                    {c.who}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stampwerk pitch */}
      <section className="py-20 px-6 bg-stamp-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs text-stamp-400 tracking-[0.3em] uppercase mb-6">
            Where Stampwerk fits
          </p>
          <h2
            className="font-heading text-sm md:text-base text-stamp-100 tracking-wider leading-relaxed"
            style={{ textShadow: "0 0 20px rgba(139,58,42,0.4)" }}
          >
            You send proposals, contracts, and invoices.<br />
            AI should write them. Not you.
          </h2>
          <p className="text-stamp-300 text-sm mt-6 max-w-lg mx-auto leading-relaxed">
            Stampwerk is not trying to be HoneyBook. No CRM. No scheduling. No forms.
            Four things, done right: AI proposals, auto contracts, smart invoicing, client portal.
            If that is 80% of what you use, this is your tool.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-12 text-left">
            {[
              {
                label: "30 seconds",
                desc: "Google sign-in to first proposal. No setup wizard. No onboarding call.",
              },
              {
                label: "$12/mo flat",
                desc: "No tiers. No per-user pricing. No surprise charges at invoice time.",
              },
              {
                label: "AI that works",
                desc: "Real LLM proposals, not template fill. Follow-ups that send themselves.",
              },
            ].map((card) => (
              <div key={card.label} className="rounded-arcade bg-stamp-800 p-5">
                <p
                  className="font-heading text-xs text-crt-amber tracking-wider mb-2"
                  style={{ textShadow: "0 0 8px rgba(255,176,0,0.3)" }}
                >
                  {card.label}
                </p>
                <p className="text-stamp-300 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/login" className="btn-insert-coin inline-block">
              START FREE
            </Link>
            <p className="font-mono text-xs text-stamp-500 mt-5 tracking-[0.2em]">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stamp-900 border-t border-stamp-800 py-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <StampwerkLogo size={20} />
          <span className="font-heading text-xs uppercase tracking-[0.25em] text-stamp-600">
            Stampwerk
          </span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Link
            href="/"
            className="font-mono text-xs text-stamp-600 hover:text-stamp-400 tracking-wider transition-colors"
          >
            Home
          </Link>
          <span className="text-stamp-800">|</span>
          <Link
            href="/compare"
            className="font-mono text-xs text-stamp-600 hover:text-stamp-400 tracking-wider transition-colors"
          >
            Compare
          </Link>
        </div>
        <p className="font-mono text-xs text-stamp-700 tracking-wider">
          &copy; {new Date().getFullYear()} &nbsp;&#9632;&nbsp; For freelancers, by freelancers
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
