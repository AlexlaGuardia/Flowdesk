# FlowDesk — AI Freelancer Business Tool

## What
$12/mo HoneyBook alternative for solo freelancers. AI proposals, auto-contracts, smart invoicing, client portal.

## Stack
- Python 3.11+, FastAPI, SQLite, Pydantic
- Groq (Llama 3.3 70B) for AI proposal/follow-up generation
- Stripe for payments (client payments + FlowDesk subscription)
- Resend for transactional email
- WeasyPrint for PDF generation
- PM2 for process management

## Key Files
- main.py — FastAPI app entry (port 8600)
- db.py — SQLite schema + helpers
- auth.py — Magic link authentication (JWT sessions)
- ai.py — Groq integration for proposals + follow-ups
- client_routes.py — Client CRUD
- project_routes.py — Project + milestone management
- proposal_routes.py — AI proposal generation + management
- contract_routes.py — Contract generation + e-signature
- invoice_routes.py — Invoicing + Stripe payment links
- portal_routes.py — Public client-facing share links
- followup_worker.py — Background follow-up daemon

## Database
- flowdesk.db — All data (users, clients, projects, proposals, contracts, invoices, files)

## Conventions
- Routes go in *_routes.py files
- Business logic in service modules (*_service.py)
- All client-facing pages use share tokens (no auth required)
- AI prompts live in ai.py, not scattered across routes

## Build & Test
```bash
pm2 restart flowdesk --update-env
curl -s http://localhost:8600/health | jq .
pm2 logs flowdesk --lines 30
```

## Roadmap
See /root/PBOARD_ROADMAP_PB09.md
