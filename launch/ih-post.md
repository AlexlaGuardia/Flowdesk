# Indie Hackers Post — Stampwerk

## Title
Three freelancer tools died in two months. I built the replacement.

## Body

HoneyBook hiked prices 89% and the loyalty discount expired Feb 2026. AND.CO shut down March 1. Bonsai got acquired by Zoom.

Three displacement events in sixty days. I was one of the displaced freelancers paying $29/mo for HoneyBook and using exactly two features: proposals and invoice reminders.

So I built Stampwerk.

**What it does:**
- Answer 5 questions, AI writes a full proposal (Llama 3.3 70B via Groq, not template-fill)
- Client accepts the proposal, a contract auto-generates
- Sign the contract, milestones create Stripe invoices
- Overdue? A 3-step daemon sends escalating follow-ups automatically

**Stack:** FastAPI + Next.js + SQLite + Groq (Llama 3.3 70B) + Stripe + Resend

**Pricing:** Free tier (5 proposals, 5 invoices/mo). Pro is $12/mo flat. No tiers, no per-seat, no surprises.

The part nobody else has: the AI follow-up daemon. Every other tool makes you manually hit "send reminder." Stampwerk sends a friendly nudge at 3 days, a firmer reminder at 7, and a final notice at 14. Configurable per client.

Live at stampwerk.com. Built solo over a weekend + evenings.

Would love feedback from other indie makers, especially on:
1. Does the AI proposal flow actually save time vs templates?
2. Is $12/mo the right price for this?
3. The retro arcade UI — love it or hate it?

## Tags
- SaaS
- Launch
- Freelance
- AI

## Notes
- Post in "Launch" or "Product" section
- Keep it builder-voice, not marketing-voice
- IH audience respects transparency about what's NOT built yet (no mobile, no QB sync, no PDF export)
