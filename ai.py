import json
from groq import Groq
import config

client = Groq(api_key=config.GROQ_API_KEY) if config.GROQ_API_KEY else None


PROPOSAL_SYSTEM_PROMPT = """You are an expert freelance proposal writer. Generate professional, persuasive proposals that win clients.

You will receive project details and must generate a structured proposal in JSON format.

Your output MUST be valid JSON with this exact structure:
{
    "executive_summary": "2-3 sentence overview of what you'll deliver and why you're the right choice",
    "scope_of_work": ["Clear description of each work item"],
    "deliverables": ["Specific, tangible deliverable 1", "Deliverable 2"],
    "timeline_breakdown": [
        {"phase": "Phase name", "duration": "e.g. Week 1-2", "tasks": "What happens in this phase"}
    ],
    "pricing_table": [
        {"item": "Description", "amount": 1500.00}
    ],
    "total_price": 3000.00,
    "terms": "Payment terms, revision policy, and other conditions",
    "valid_until": "30 days from today"
}

Guidelines:
- Be specific and professional, not generic
- Break the timeline into realistic phases
- Pricing should fall within the client's budget range
- Include 1-2 rounds of revisions in scope
- Terms should mention payment schedule (e.g., 50% upfront, 50% on completion)
- Keep the executive summary warm but professional — this is a freelancer, not a corporation
- Total deliverables should match the scope items"""


def generate_proposal(
    freelancer_name: str,
    client_name: str,
    project_type: str,
    scope_description: str,
    timeline: str,
    budget_range: str,
) -> dict:
    """Generate a proposal using Groq/Llama from wizard inputs."""
    if not client:
        return _fallback_proposal(project_type, scope_description, timeline, budget_range)

    user_prompt = f"""Generate a proposal for the following project:

Freelancer: {freelancer_name}
Client: {client_name}
Project Type: {project_type}
Scope: {scope_description}
Timeline: {timeline}
Budget Range: {budget_range}

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
