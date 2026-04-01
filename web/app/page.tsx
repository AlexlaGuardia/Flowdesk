import Link from "next/link";
import StampwerkLogo from "@/components/StampwerkLogo";

const FEATURES = [
  {
    icon: "📜",
    title: "AI Proposals",
    desc: "Answer 5 questions. Get a branded proposal with scope, deliverables, and pricing in 2 minutes — not 2 hours.",
  },
  {
    icon: "🤝",
    title: "Auto Contracts",
    desc: "Client accepts your proposal? A contract generates instantly. One-click e-signature. No templates, no fiddling.",
  },
  {
    icon: "💰",
    title: "Smart Invoicing",
    desc: "Milestone billing with Stripe payment links. Overdue? AI sends a 3-step follow-up sequence so you don't have to.",
  },
  {
    icon: "🚪",
    title: "Client Portal",
    desc: "One link gives your client everything: project status, files, invoices, milestones. Professional. Simple.",
  },
];

const COMPARISON = [
  { name: "HoneyBook", price: "$36–129/mo", ai: false, note: "89% price hike in 2025" },
  { name: "Dubsado", price: "$35–55/mo", ai: false, note: "Needs $500+ setup consultant" },
  { name: "Bonsai", price: "$15–59/mo", ai: false, note: "Invoicing locked at $25+" },
  { name: "Moxie", price: "$12–40/mo", ai: false, note: "No AI, template-based" },
  { name: "Stampwerk", price: "$12/mo flat", ai: true, note: "AI-native, unlimited, done" },
];

const STEPS = [
  { num: "01", title: "Sign in", desc: "Google or magic link. 30-second onboarding." },
  { num: "02", title: "AI generates", desc: "Answer 5 questions. AI writes your proposal, contract, and invoice." },
  { num: "03", title: "Client pays", desc: "Share a link. Client views, signs, and pays — all in one flow." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <StampwerkLogo size={24} />
          <span className="font-heading text-[10px] text-stamp-600 tracking-wider">
            STAMPWERK
          </span>
        </div>
        <Link
          href="/login"
          className="font-mono text-[10px] text-stamp-500 hover:text-stamp-700 uppercase tracking-[0.2em] transition-colors"
        >
          Sign In &#9654;
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-stamp-900 py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[10px] text-stamp-400 tracking-[0.3em] uppercase mb-6">
            For freelancers tired of overpaying
          </p>
          <h1
            className="font-heading text-xl md:text-2xl lg:text-3xl text-stamp-100 tracking-wider leading-relaxed"
            style={{ textShadow: "0 0 30px rgba(139,58,42,0.5)" }}
          >
            HoneyBook charges $59/mo.<br />
            You use 10% of it.
          </h1>
          <p className="text-stamp-300 text-base md:text-lg mt-6 max-w-xl mx-auto leading-relaxed">
            Stampwerk does the 80% that matters — AI proposals, contracts, invoicing, client portal — for <span className="text-crt-amber font-semibold">$12/mo flat</span>. No tiers. No setup consultants. No templates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/login" className="btn-insert-coin inline-block">
              START FREE
            </Link>
            <span className="font-mono text-[9px] text-stamp-500 tracking-[0.15em]">
              No credit card required
            </span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-parchment">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-heading text-[9px] text-ink-400 tracking-[0.25em] uppercase">
              How It Works
            </p>
            <div className="h-px bg-ledger mt-3 max-w-[80px] mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-arcade bg-stamp-900 mb-5">
                  <span
                    className="font-heading text-[11px] text-stamp-300 tracking-wider"
                    style={{ textShadow: "0 0 8px rgba(229,174,159,0.3)" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3 className="font-heading text-[10px] text-ink-900 tracking-[0.15em] uppercase mb-2">
                  {step.title}
                </h3>
                <p className="text-ink-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-paper">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-heading text-[9px] text-ink-400 tracking-[0.25em] uppercase">
              Everything You Need
            </p>
            <p className="text-ink-500 text-sm mt-3 max-w-md mx-auto">
              AI does the writing. You do the work you love.
            </p>
            <div className="h-px bg-ledger mt-5 max-w-[80px] mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <h3 className="font-heading text-[9px] text-ink-900 tracking-[0.15em] uppercase mb-2">
                      {f.title}
                    </h3>
                    <p className="text-ink-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="py-20 px-6 bg-stamp-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-heading text-[9px] text-stamp-400 tracking-[0.25em] uppercase">
              Stop Overpaying
            </p>
            <h2
              className="font-heading text-sm md:text-base text-stamp-200 tracking-wider mt-3"
              style={{ textShadow: "0 0 20px rgba(139,58,42,0.4)" }}
            >
              How Stampwerk Compares
            </h2>
            <div className="h-px bg-stamp-700 mt-5 max-w-[80px] mx-auto" />
          </div>

          <div className="card p-0 overflow-hidden">
            {/* Table header */}
            <div className="bg-stamp-800 px-5 py-3 grid grid-cols-12 gap-2 items-center">
              <span className="font-heading text-[8px] text-stamp-400 tracking-wider col-span-3">Tool</span>
              <span className="font-heading text-[8px] text-stamp-400 tracking-wider col-span-3 text-center">Price</span>
              <span className="font-heading text-[8px] text-stamp-400 tracking-wider col-span-2 text-center">AI?</span>
              <span className="font-heading text-[8px] text-stamp-400 tracking-wider col-span-4">Catch</span>
            </div>
            {COMPARISON.map((row, i) => {
              const isStampwerk = row.name === "Stampwerk";
              return (
                <div
                  key={row.name}
                  className={`grid grid-cols-12 gap-2 items-center px-5 py-3 border-b border-dashed border-ledger last:border-0 ${
                    isStampwerk
                      ? "bg-stamp-50"
                      : i % 2 === 0
                        ? "bg-paper"
                        : "bg-parchment"
                  }`}
                >
                  <span className={`col-span-3 font-mono text-xs tracking-wider ${isStampwerk ? "text-stamp-600 font-bold" : "text-ink-700"}`}>
                    {row.name}
                  </span>
                  <span className={`col-span-3 font-mono text-xs text-center ${isStampwerk ? "text-stamp-600 font-bold" : "text-ink-500"}`}>
                    {row.price}
                  </span>
                  <span className={`col-span-2 text-center text-sm ${row.ai ? "text-ledger-green" : "text-void-red"}`}>
                    {row.ai ? "Yes" : "No"}
                  </span>
                  <span className={`col-span-4 text-xs ${isStampwerk ? "text-stamp-600 font-semibold" : "text-ink-400"}`}>
                    {row.note}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Built By ── */}
      <section className="py-16 px-6 bg-kraft">
        <div className="max-w-2xl mx-auto text-center">
          <div className="empty-stamp mx-auto mb-6" style={{ padding: "12px 24px", borderColor: "#C9BFA8", display: "inline-block", rotate: "0deg" }}>
            <span className="font-heading text-[8px] uppercase tracking-[0.25em] text-ink-500">Built by a freelancer</span>
          </div>
          <p className="text-ink-700 text-sm leading-relaxed max-w-lg mx-auto">
            I got tired of paying $59/mo for software I barely used, then spending hours writing proposals from scratch.
            So I built Stampwerk — the tool I wish existed when I started freelancing.
            AI writes your proposals. You focus on doing great work.
          </p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-6 bg-parchment">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <p className="font-heading text-[9px] text-ink-400 tracking-[0.25em] uppercase">
              Pricing
            </p>
            <div className="h-px bg-ledger mt-3 max-w-[80px] mx-auto" />
          </div>

          {/* Free vs Pro */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Free */}
            <div className="card p-6 text-center">
              <p className="font-heading text-[9px] text-ink-400 tracking-[0.2em] uppercase mb-2">Free</p>
              <p className="font-heading text-lg text-ink-900 tracking-wider mb-4">$0</p>
              <ul className="text-left text-sm text-ink-500 space-y-2">
                <li className="flex items-start gap-2"><span className="text-ledger-green mt-0.5">&#9632;</span> 5 AI proposals/mo</li>
                <li className="flex items-start gap-2"><span className="text-ledger-green mt-0.5">&#9632;</span> 5 invoices/mo</li>
                <li className="flex items-start gap-2"><span className="text-ledger-green mt-0.5">&#9632;</span> Client portal</li>
                <li className="flex items-start gap-2"><span className="text-ledger-green mt-0.5">&#9632;</span> Contracts + e-sign</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="card p-6 text-center border-stamp-600">
              <p className="font-heading text-[9px] text-stamp-500 tracking-[0.2em] uppercase mb-2">Pro</p>
              <p className="font-heading text-lg text-stamp-600 tracking-wider mb-1">$12<span className="text-[10px] text-ink-400">/mo</span></p>
              <p className="font-mono text-[9px] text-ink-400 tracking-wider mb-4">One price. That&apos;s it.</p>
              <ul className="text-left text-sm text-ink-500 space-y-2">
                <li className="flex items-start gap-2"><span className="text-stamp-500 mt-0.5">&#9632;</span> Unlimited proposals</li>
                <li className="flex items-start gap-2"><span className="text-stamp-500 mt-0.5">&#9632;</span> Unlimited invoices</li>
                <li className="flex items-start gap-2"><span className="text-stamp-500 mt-0.5">&#9632;</span> Unlimited contracts</li>
                <li className="flex items-start gap-2"><span className="text-stamp-500 mt-0.5">&#9632;</span> AI follow-up sequences</li>
                <li className="flex items-start gap-2"><span className="text-stamp-500 mt-0.5">&#9632;</span> Priority AI generation</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/login" className="btn-insert-coin inline-block">
              START FREE
            </Link>
            <p className="font-mono text-[9px] text-ink-400 mt-5 tracking-[0.2em]">
              No credit card &mdash; upgrade when you&apos;re ready
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stamp-900 border-t border-stamp-800 py-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <StampwerkLogo size={20} />
          <span className="font-heading text-[8px] uppercase tracking-[0.25em] text-stamp-600">
            Stampwerk
          </span>
        </div>
        <p className="font-mono text-[9px] text-stamp-700 tracking-wider">
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
