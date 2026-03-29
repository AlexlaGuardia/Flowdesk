import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-indigo-600">FlowDesk</h1>
        <Link
          href="/login"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
          Stop chasing clients.
          <br />
          <span className="text-indigo-600">Start getting paid.</span>
        </h2>
        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto">
          Answer 5 questions. AI generates a branded proposal. Client signs, contract auto-generates, invoices follow up automatically. All for $12/mo.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { title: "AI Proposals", desc: "Answer 5 questions, get a branded proposal with pricing table. No templates, no fiddling." },
          { title: "Auto Contracts", desc: "Client accepts proposal? Contract generates automatically. One-click signature." },
          { title: "Smart Invoicing", desc: "Milestone-based invoices with Stripe payment links. AI follow-ups for overdue payments." },
        ].map((f) => (
          <div key={f.title} className="text-center">
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <p className="text-sm font-medium text-indigo-600">Simple pricing</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">$12<span className="text-lg text-gray-400">/mo</span></p>
          <p className="mt-2 text-sm text-gray-500">Everything included. No tiers. No surprises.</p>
          <Link
            href="/login"
            className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        FlowDesk &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
