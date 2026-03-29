import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import get_current_user, generate_share_token
from models import MessageResponse
import db
import ai
import email_service

router = APIRouter(prefix="/contracts", tags=["contracts"])


def _generate_contract_content(proposal: dict, project: dict, freelancer: dict, client_data: dict) -> dict:
    """Generate contract content from an accepted proposal using AI."""
    proposal_content = json.loads(proposal["content_json"])

    # Generate AI contract clauses
    clauses = ai.generate_contract(
        freelancer_name=freelancer["name"] or freelancer["business_name"] or freelancer["email"],
        business_name=freelancer["business_name"] or freelancer["name"],
        client_name=client_data["name"],
        client_company=client_data["company"] or client_data["name"],
        project_name=project["name"],
        scope=proposal_content.get("scope_of_work", []),
        deliverables=proposal_content.get("deliverables", []),
        timeline=proposal_content.get("timeline_breakdown", []),
        total_price=proposal_content.get("total_price", project["total_amount"]),
        payment_terms=proposal_content.get("terms", "50% upfront, 50% on completion"),
    )

    return {
        "title": f"Service Agreement — {project['name']}",
        "date": datetime.now(timezone.utc).strftime("%B %d, %Y"),
        "parties": {
            "freelancer": {
                "name": freelancer["name"],
                "business_name": freelancer["business_name"],
                "email": freelancer["email"],
            },
            "client": {
                "name": client_data["name"],
                "company": client_data["company"],
                "email": client_data["email"],
            },
        },
        "project": {
            "name": project["name"],
            "description": project["description"],
        },
        "scope_of_work": proposal_content.get("scope_of_work", []),
        "deliverables": proposal_content.get("deliverables", []),
        "timeline": proposal_content.get("timeline_breakdown", []),
        "pricing": {
            "items": proposal_content.get("pricing_table", []),
            "total": proposal_content.get("total_price", project["total_amount"]),
        },
        "clauses": clauses,
    }


@router.post("/from-proposal/{proposal_id}", response_model=MessageResponse)
async def create_from_proposal(proposal_id: int, user: dict = Depends(get_current_user)):
    """Auto-generate a contract from an accepted proposal."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE id = ? AND user_id = ?",
        (proposal_id, user["id"]), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal["status"] != "accepted":
        raise HTTPException(status_code=400, detail="Proposal must be accepted before creating a contract")

    # Check if contract already exists for this proposal
    existing = db.query(
        "SELECT id FROM contracts WHERE proposal_id = ? AND status != 'voided'",
        (proposal_id,), one=True
    )
    if existing:
        raise HTTPException(status_code=409, detail="Contract already exists for this proposal")

    project = db.query("SELECT * FROM projects WHERE id = ?", (proposal["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    content = _generate_contract_content(proposal, project, user, client)
    share_token = generate_share_token()

    contract_id = db.execute(
        """INSERT INTO contracts
           (project_id, user_id, proposal_id, content_json, share_token)
           VALUES (?, ?, ?, ?, ?)""",
        (proposal["project_id"], user["id"], proposal_id,
         json.dumps(content), share_token)
    )

    return {"message": "Contract generated from proposal", "id": contract_id}


@router.get("")
async def list_contracts(
    project_id: int | None = None,
    user: dict = Depends(get_current_user)
):
    """List contracts for the current user."""
    sql = "SELECT * FROM contracts WHERE user_id = ?"
    params = [user["id"]]
    if project_id:
        sql += " AND project_id = ?"
        params.append(project_id)
    sql += " ORDER BY created_at DESC"
    return db.query(sql, tuple(params))


@router.get("/{contract_id}")
async def get_contract(contract_id: int, user: dict = Depends(get_current_user)):
    """Get a specific contract with parsed content."""
    contract = db.query(
        "SELECT * FROM contracts WHERE id = ? AND user_id = ?",
        (contract_id, user["id"]), one=True
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    project = db.query("SELECT * FROM projects WHERE id = ?", (contract["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    return {
        **contract,
        "content": json.loads(contract["content_json"]),
        "project": project,
        "client": client,
    }


@router.post("/{contract_id}/send", response_model=MessageResponse)
async def send_contract(contract_id: int, user: dict = Depends(get_current_user)):
    """Send a contract to the client for signature."""
    contract = db.query(
        "SELECT * FROM contracts WHERE id = ? AND user_id = ?",
        (contract_id, user["id"]), one=True
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract["status"] != "draft":
        raise HTTPException(status_code=400, detail="Contract already sent")

    project = db.query("SELECT * FROM projects WHERE id = ?", (contract["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    # Send email with contract link
    email_service.send_contract_notification(
        to_email=client["email"],
        freelancer_name=user["name"],
        project_name=project["name"],
        share_token=contract["share_token"],
    )

    db.execute(
        "UPDATE contracts SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (contract_id,)
    )

    return {"message": f"Contract sent to {client['email']}"}


# ── Public Client-Facing Routes ──

@router.get("/view/{share_token}")
async def view_contract(share_token: str):
    """Public: View a contract by share token (no auth required)."""
    contract = db.query(
        "SELECT * FROM contracts WHERE share_token = ?",
        (share_token,), one=True
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Mark as viewed
    if contract["status"] == "sent" and not contract["viewed_at"]:
        db.execute(
            "UPDATE contracts SET status = 'viewed', viewed_at = CURRENT_TIMESTAMP WHERE id = ?",
            (contract["id"],)
        )

    user = db.query("SELECT * FROM users WHERE id = ?", (contract["user_id"],), one=True)
    project = db.query("SELECT * FROM projects WHERE id = ?", (contract["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)
    content = json.loads(contract["content_json"])

    return {
        "contract": {
            "id": contract["id"],
            "status": contract["status"],
            "content": content,
            "signed_at": contract["signed_at"],
            "signer_name": contract["signer_name"],
            "created_at": contract["created_at"],
        },
        "freelancer": {
            "name": user["name"],
            "business_name": user["business_name"],
            "brand_color": user["brand_color"],
        },
        "project": {"name": project["name"]},
        "client": {"name": client["name"], "email": client["email"]},
    }


@router.post("/view/{share_token}/sign")
async def sign_contract(share_token: str, request: Request):
    """Public: Sign a contract (consent-click + IP + user agent)."""
    contract = db.query(
        "SELECT * FROM contracts WHERE share_token = ?",
        (share_token,), one=True
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract["status"] not in ("sent", "viewed"):
        raise HTTPException(status_code=400, detail="Contract cannot be signed in current state")

    project = db.query("SELECT * FROM projects WHERE id = ?", (contract["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    db.execute(
        """UPDATE contracts SET
           status = 'signed', signed_at = CURRENT_TIMESTAMP,
           signer_name = ?, signer_email = ?,
           signer_ip = ?, signer_user_agent = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (client["name"], client["email"], client_ip, user_agent, contract["id"])
    )

    return {"message": "Contract signed", "status": "signed"}


@router.post("/{contract_id}/void", response_model=MessageResponse)
async def void_contract(contract_id: int, user: dict = Depends(get_current_user)):
    """Void a contract."""
    contract = db.query(
        "SELECT * FROM contracts WHERE id = ? AND user_id = ?",
        (contract_id, user["id"]), one=True
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract["status"] == "signed":
        raise HTTPException(status_code=400, detail="Cannot void a signed contract")

    db.execute(
        "UPDATE contracts SET status = 'voided', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (contract_id,)
    )
    return {"message": "Contract voided"}
