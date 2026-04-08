# Indie Hackers Post — Critik

## Title
I built an AI code security scanner after Copilot shipped SQL injections into production

## Body

53% of AI-generated code has security issues. 35 new CVEs in March 2026 alone from AI-assisted code. A startup called Moltbook just exposed 1.5M API keys because their vibe-coded Supabase config had no row-level security.

Snyk charges $25+/mo. GitHub CodeQL only works on public repos. OpenAI's scanner is locked to their ecosystem.

So I built Critik. Open source. Two-pass scanning: regex + AST first pass catches the obvious stuff (hardcoded secrets, SQL injection patterns, XSS sinks), then an AI review pass (Llama 3.3 70B via Groq) reads full file context to catch the subtle issues that pattern matching misses.

**What it does:**
- `pip install critik && critik scan` — zero config
- VS Code extension with inline diagnostics
- GitHub Action for CI/CD
- Pre-commit hook
- Watch mode for continuous scanning
- Custom YAML rules

**Stack:** Python + Groq (Llama 3.3 70B) + Tree-sitter AST parsing

**Pricing:** Free tier covers most needs. Pro at $9/mo for teams.

The two-pass architecture is the key insight. Pattern matching alone has too many false positives. AI alone hallucinates findings. Combining them — regex narrows the search space, AI confirms with context — gets you accurate results on cheap infrastructure.

Live at critik.dev. VS Code Marketplace: search "critik". PyPI: `pip install critik`.

Looking for feedback:
1. What languages/frameworks should I prioritize next?
2. Is $9/mo the right price for Pro, or should it be free forever with a team tier?
3. Anyone running this against their own vibe-coded projects?

## Tags
- Security
- Developer Tools
- Open Source
- AI
