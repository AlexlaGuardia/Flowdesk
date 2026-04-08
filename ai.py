import json
from groq import Groq
import config

client = Groq(api_key=config.GROQ_API_KEY) if config.GROQ_API_KEY else None


INDUSTRY_HINTS = {
    "web": {"tone": "technical but accessible", "terms": "staging site for review, browser/device testing included", "phases": ["Discovery & Wireframes", "Design Mockups", "Development", "Testing & Launch"]},
    "design": {"tone": "creative and visual", "terms": "mood board approval before execution, source files included", "phases": ["Creative Brief & Mood Board", "Concept Development", "Refinement", "Final Delivery"]},
    "brand": {"tone": "strategic and creative", "terms": "brand guidelines document included, logo in all standard formats", "phases": ["Brand Discovery", "Concept Exploration", "Identity Refinement", "Brand Package Delivery"]},
    "photo": {"tone": "warm and professional", "terms": "shot list approved in advance, edited selects delivered within 2 weeks", "phases": ["Pre-Production & Planning", "Shoot Day(s)", "Editing & Selection", "Final Delivery"]},
    "video": {"tone": "warm and professional", "terms": "storyboard approval before filming, 2 rounds of edit revisions", "phases": ["Pre-Production & Script", "Production / Filming", "Post-Production & Editing", "Final Delivery"]},
    "write": {"tone": "clear and strategic", "terms": "outline approval before drafting, SEO keywords agreed upfront", "phases": ["Research & Outline", "First Draft", "Revisions", "Final Copy & Formatting"]},
    "market": {"tone": "data-driven and strategic", "terms": "monthly reporting included, KPIs defined at kickoff", "phases": ["Audit & Strategy", "Campaign Setup", "Execution & Optimization", "Reporting & Handoff"]},
    "consult": {"tone": "authoritative but approachable", "terms": "findings delivered as actionable report, follow-up call included", "phases": ["Discovery & Assessment", "Analysis", "Recommendations", "Presentation & Handoff"]},
}

def _detect_industry(project_type: str, scope: str) -> dict:
    """Match project inputs to an industry for tone and structure hints."""
    text = f"{project_type} {scope}".lower()
    # Check specific industries before broad ones (photo before web, brand before design)
    if any(w in text for w in ["photo", "headshot", "portrait", "shoot", "product photo", "real estate photo"]):
        return INDUSTRY_HINTS["photo"]
    if any(w in text for w in ["video", "film", "animation", "motion", "reel"]):
        return INDUSTRY_HINTS["video"]
    if any(w in text for w in ["brand", "logo", "identity", "rebrand"]):
        return INDUSTRY_HINTS["brand"]
    if any(w in text for w in ["website", "web app", "landing page", "frontend", "backend", "api", "saas", "ecommerce"]):
        return INDUSTRY_HINTS["web"]
    if any(w in text for w in ["design", "ui", "ux", "graphic", "illustration", "flyer", "poster"]):
        return INDUSTRY_HINTS["design"]
    if any(w in text for w in ["copy", "writing", "blog", "article", "content", "seo", "email"]):
        return INDUSTRY_HINTS["write"]
    if any(w in text for w in ["marketing", "social media", "ads", "campaign", "ppc", "seo strategy"]):
        return INDUSTRY_HINTS["market"]
    if any(w in text for w in ["consult", "audit", "strategy", "advisory", "review"]):
        return INDUSTRY_HINTS["consult"]
    return {"tone": "professional and clear", "terms": "2 rounds of revisions included", "phases": ["Discovery", "Execution", "Review", "Delivery"]}


PROPOSAL_SYSTEM_PROMPT = """You are a senior freelance proposal writer who has helped win over $2M in contracts across design, development, photography, marketing, and consulting.

You will receive project details and industry context. Generate a structured proposal in JSON format that a real client would accept.

Your output MUST be valid JSON with this exact structure:
{
    "executive_summary": "2-3 sentences. Lead with the client's problem, then your solution, then why you specifically.",
    "scope_of_work": ["Each item starts with an action verb. Be specific about what's included AND what's not."],
    "deliverables": ["Tangible, countable items the client receives. Not vague outcomes."],
    "timeline_breakdown": [
        {"phase": "Phase name", "duration": "e.g. Week 1-2", "tasks": "Specific activities, not generic filler"}
    ],
    "pricing_table": [
        {"item": "Specific line item tied to a deliverable", "amount": 1500.00}
    ],
    "total_price": 3000.00,
    "terms": "Payment schedule, revision policy, and what happens if scope changes",
    "valid_until": "30 days from today"
}

WINNING PROPOSAL TACTICS (follow these):
1. Executive summary: Name the client's specific problem in sentence 1. Don't start with "I" or "We".
2. Scope: Use action verbs (Design, Build, Deliver, Configure, Test). Each item = one clear commitment.
3. Deliverables: Countable nouns only. "5 page designs" not "design work". "1 brand guidelines PDF" not "brand materials".
4. Timeline: Realistic phases with what the CLIENT does too (approvals, feedback windows).
5. Pricing: Break budget into 3-5 logical line items. Never one lump sum. Each ties to a deliverable.
6. Terms: Always include deposit structure, revision count, and a scope-change clause.
7. Tone: Confident but not arrogant. You're a skilled partner, not a vendor begging for work.

EXAMPLE — Web Development Proposal:
{
    "executive_summary": "Your current site loads in 6+ seconds and isn't converting mobile visitors. This proposal covers a complete redesign on Next.js with performance as the priority, targeting sub-2-second loads and a mobile-first layout that guides visitors to book a consultation.",
    "scope_of_work": ["Audit existing site performance and analytics", "Design 5 responsive page layouts (Home, About, Services, Portfolio, Contact)", "Develop in Next.js with Tailwind CSS", "Configure hosting, SSL, and DNS cutover", "Test across Chrome, Safari, Firefox on desktop and mobile"],
    "deliverables": ["5 page designs (Figma)", "Fully developed Next.js site", "Hosting configuration on Vercel", "30-minute handoff call with CMS walkthrough"],
    "timeline_breakdown": [
        {"phase": "Discovery & Wireframes", "duration": "Week 1", "tasks": "Site audit, wireframe 5 pages, client approval on layout direction"},
        {"phase": "Design", "duration": "Week 2", "tasks": "High-fidelity mockups in Figma, 1 round of feedback"},
        {"phase": "Development", "duration": "Week 3-4", "tasks": "Build in Next.js, integrate CMS, responsive testing"},
        {"phase": "Launch", "duration": "Week 5", "tasks": "Staging review, DNS cutover, post-launch check"}
    ],
    "pricing_table": [
        {"item": "Discovery & wireframes", "amount": 500},
        {"item": "UI design (5 pages)", "amount": 1200},
        {"item": "Development & CMS integration", "amount": 2000},
        {"item": "Testing, launch & handoff", "amount": 300}
    ],
    "total_price": 4000,
    "terms": "50% deposit to begin ($2,000). Remaining 50% due at launch. Includes 2 rounds of design revisions. Additional revisions at $75/hr. Scope changes beyond this document require a written change order.",
    "valid_until": "30 days from proposal date"
}

EXAMPLE — Brand Identity Proposal:
{
    "executive_summary": "You're launching a premium skincare line but don't have a visual identity that matches the quality of your products. This proposal covers a complete brand identity system — logo, color palette, typography, and a guidelines document your team can use across every touchpoint.",
    "scope_of_work": ["Conduct brand discovery session (45 min call)", "Research competitor visual positioning", "Design 3 logo concepts with rationale", "Develop full color palette and typography system", "Create brand guidelines document (PDF)"],
    "deliverables": ["3 logo concepts (round 1)", "1 refined logo in 6 formats (SVG, PNG, EPS, favicon, social, print)", "Color palette with hex/RGB/CMYK values", "Typography pairing with usage rules", "24-page brand guidelines PDF"],
    "timeline_breakdown": [
        {"phase": "Brand Discovery", "duration": "Week 1", "tasks": "Discovery call, competitor audit, mood board for client approval"},
        {"phase": "Concept Development", "duration": "Week 2", "tasks": "3 distinct logo directions with color/type exploration"},
        {"phase": "Refinement", "duration": "Week 3", "tasks": "Client selects 1 direction, 2 rounds of refinement"},
        {"phase": "Brand Package", "duration": "Week 4", "tasks": "Final files, guidelines document, handoff"}
    ],
    "pricing_table": [
        {"item": "Brand discovery & research", "amount": 400},
        {"item": "Logo design (3 concepts + refinement)", "amount": 1800},
        {"item": "Color & typography system", "amount": 500},
        {"item": "Brand guidelines document", "amount": 300}
    ],
    "total_price": 3000,
    "terms": "50% deposit to begin ($1,500). Remaining 50% due on delivery of brand package. Includes 2 rounds of logo revisions after concept selection. Additional concepts beyond initial 3 at $400 each.",
    "valid_until": "30 days from proposal date"
}"""


def generate_proposal(
    freelancer_name: str,
    client_name: str,
    project_type: str,
    scope_description: str,
    timeline: str,
    budget_range: str,
    business_name: str = "",
) -> dict:
    """Generate a proposal using Groq/Llama from wizard inputs."""
    if not client:
        return _fallback_proposal(project_type, scope_description, timeline, budget_range)

    industry = _detect_industry(project_type, scope_description)
    from_line = f"{freelancer_name}"
    if business_name:
        from_line += f" ({business_name})"

    user_prompt = f"""Generate a proposal for the following project:

From: {from_line}
To: {client_name}
Project Type: {project_type}
Scope: {scope_description}
Timeline: {timeline}
Budget Range: {budget_range}

Industry context:
- Tone: {industry['tone']}
- Suggested phases: {', '.join(industry['phases'])}
- Terms hint: {industry['terms']}

Adapt the proposal structure to this specific industry. Use the suggested phases as a starting point but adjust to fit the actual scope. Pricing MUST fall within the stated budget range — break it into 3-5 line items that add up to a total within that range.

Generate the proposal JSON now."""

    try:
        response = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=[
                {"role": "system", "content": PROPOSAL_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"[AI] Proposal generation failed: {e}")
        return _fallback_proposal(project_type, scope_description, timeline, budget_range)


FOLLOWUP_SYSTEM_PROMPT = """You are writing a payment follow-up email on behalf of a freelancer. The tone depends on the stage:

Stage 1 (Friendly Reminder): Warm, casual. "Just checking in" energy. Assume it was an oversight.
Stage 2 (Firm Follow-up): Professional and direct. Clear about the overdue amount and deadline.
Stage 3 (Final Notice): Serious but not threatening. States consequences (pause work, late fees) matter-of-factly.

Output JSON: {"subject": "Email subject line", "body": "Email body in HTML"}

Keep emails short (3-5 sentences max). Include the invoice amount and number. Be human, not corporate."""


def generate_followup(
    freelancer_name: str,
    client_name: str,
    invoice_number: str,
    amount: float,
    days_overdue: int,
    stage: int,
) -> dict:
    """Generate a follow-up email for an overdue invoice."""
    if not client:
        return _fallback_followup(freelancer_name, client_name, invoice_number, amount, stage)

    user_prompt = f"""Write a Stage {stage} follow-up email:

From: {freelancer_name}
To: {client_name}
Invoice: {invoice_number}
Amount: ${amount:.2f}
Days Overdue: {days_overdue}

Generate the email JSON now."""

    try:
        response = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=[
                {"role": "system", "content": FOLLOWUP_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"[AI] Follow-up generation failed: {e}")
        return _fallback_followup(freelancer_name, client_name, invoice_number, amount, stage)


CONTRACT_SYSTEM_PROMPT = """You are a freelance contract writer. Generate a professional service agreement based on an accepted proposal.

Output valid JSON with this structure:
{
    "preamble": "One paragraph establishing the agreement between the parties",
    "scope_of_work": "Professional description of the work to be performed",
    "deliverables_clause": "Clear clause listing all deliverables and acceptance criteria",
    "timeline_clause": "Timeline expectations and milestone dates",
    "payment_clause": "Payment schedule, amounts, methods, and late payment terms",
    "revisions_clause": "How many revisions are included and how extras are handled",
    "ip_clause": "Intellectual property transfer terms (transfer on full payment)",
    "confidentiality_clause": "Mutual NDA covering project details",
    "termination_clause": "How either party can end the agreement and payment for completed work",
    "liability_clause": "Limitation of liability to total project fee"
}

Guidelines:
- Professional but readable — not dense legalese
- Specific to this project (use real names, amounts, dates)
- Protect both parties fairly
- Keep each clause to 2-4 sentences"""


def generate_contract(
    freelancer_name: str,
    business_name: str,
    client_name: str,
    client_company: str,
    project_name: str,
    scope: list[str],
    deliverables: list[str],
    timeline: list[dict],
    total_price: float,
    payment_terms: str,
) -> dict:
    """Generate professional contract language using AI."""
    if not client:
        return _fallback_contract(
            freelancer_name, client_name, project_name,
            scope, deliverables, total_price
        )

    user_prompt = f"""Generate a service agreement for:

Freelancer: {freelancer_name} ({business_name})
Client: {client_name} ({client_company})
Project: {project_name}
Scope: {'; '.join(scope)}
Deliverables: {'; '.join(deliverables)}
Timeline: {json.dumps(timeline)}
Total Price: ${total_price:,.2f}
Payment Terms: {payment_terms}

Generate the contract JSON now."""

    try:
        response = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=[
                {"role": "system", "content": CONTRACT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.5,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"[AI] Contract generation failed: {e}")
        return _fallback_contract(
            freelancer_name, client_name, project_name,
            scope, deliverables, total_price
        )


def _fallback_contract(
    freelancer: str, client_name: str, project: str,
    scope: list, deliverables: list, total: float
) -> dict:
    """Fallback contract clauses when AI is unavailable."""
    return {
        "preamble": f"This Service Agreement is entered into between {freelancer} (\"Freelancer\") and {client_name} (\"Client\") for the project \"{project}\".",
        "scope_of_work": "; ".join(scope) if scope else "As described in the accepted proposal.",
        "deliverables_clause": f"Freelancer shall deliver: {'; '.join(deliverables) if deliverables else 'as outlined in proposal'}. Client has 7 business days to review each deliverable.",
        "timeline_clause": "Work shall proceed according to the timeline outlined in the accepted proposal.",
        "payment_clause": f"Total project fee: ${total:,.2f}. 50% due upon signing, 50% upon completion. Late payments incur 1.5% monthly fee after 30 days.",
        "revisions_clause": "Two rounds of revisions are included. Additional revisions billed at the agreed hourly rate.",
        "ip_clause": "All intellectual property rights transfer to Client upon receipt of full payment. Freelancer retains portfolio display rights.",
        "confidentiality_clause": "Both parties agree to keep confidential any proprietary information shared during this project.",
        "termination_clause": "Either party may terminate with 7 days written notice. Client pays for all work completed to date.",
        "liability_clause": f"Freelancer's total liability shall not exceed the project fee of ${total:,.2f}.",
    }


def _fallback_proposal(project_type: str, scope: str, timeline: str, budget: str) -> dict:
    """Fallback proposal when AI is unavailable."""
    return {
        "executive_summary": f"This proposal outlines the plan for your {project_type} project. We'll deliver high-quality work within your timeline and budget.",
        "scope_of_work": [scope],
        "deliverables": [f"Completed {project_type}", "Source files", "Documentation"],
        "timeline_breakdown": [
            {"phase": "Phase 1: Discovery & Planning", "duration": "Week 1", "tasks": "Requirements gathering, research, planning"},
            {"phase": "Phase 2: Execution", "duration": timeline, "tasks": "Core work and deliverable creation"},
            {"phase": "Phase 3: Review & Delivery", "duration": "Final week", "tasks": "Client review, revisions, final delivery"},
        ],
        "pricing_table": [
            {"item": project_type, "amount": 0}
        ],
        "total_price": 0,
        "terms": "50% deposit required to begin. Remaining 50% due on project completion. Includes 2 rounds of revisions.",
        "valid_until": "30 days from proposal date",
    }


def _fallback_followup(freelancer: str, client: str, inv_num: str, amount: float, stage: int) -> dict:
    """Fallback follow-up when AI is unavailable."""
    templates = {
        1: {
            "subject": f"Quick reminder: Invoice {inv_num}",
            "body": f"<p>Hi {client},</p><p>Just a friendly reminder that invoice {inv_num} for ${amount:.2f} is now past due. If you've already sent payment, please disregard this note!</p><p>Best,<br>{freelancer}</p>",
        },
        2: {
            "subject": f"Follow-up: Invoice {inv_num} is overdue",
            "body": f"<p>Hi {client},</p><p>I wanted to follow up regarding invoice {inv_num} for ${amount:.2f}, which is now overdue. Could you let me know the expected payment date?</p><p>Thanks,<br>{freelancer}</p>",
        },
        3: {
            "subject": f"Final notice: Invoice {inv_num}",
            "body": f"<p>Hi {client},</p><p>This is a final notice regarding invoice {inv_num} for ${amount:.2f}. I'll need to pause any ongoing work until this is resolved. Please get in touch at your earliest convenience.</p><p>Regards,<br>{freelancer}</p>",
        },
    }
    return templates.get(stage, templates[1])
