import json
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import get_current_user, generate_share_token
from models import ProposalWizard, ProposalOut, MessageResponse
import db
import ai
import email_service

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.post("/generate", response_model=MessageResponse)
async def generate_proposal(body: ProposalWizard, user: dict = Depends(get_current_user)):
    """Generate an AI proposal from wizard inputs."""
    # Verify project belongs to user
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (body.project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get client info for the proposal
    client = db.query(
        "SELECT * FROM clients WHERE id = ?",
        (project["client_id"],), one=True
    )

    # Check for existing draft proposals on this project
    existing = db.query(
        "SELECT MAX(version) as max_v FROM proposals WHERE project_id = ?",
        (body.project_id,), one=True
    )
    version = (existing["max_v"] or 0) + 1

    # Generate AI proposal
    content = ai.generate_proposal(
        freelancer_name=user["name"] or user["business_name"] or user["email"],
        client_name=client["name"],
        project_type=body.project_type,
        scope_description=body.scope_description,
        timeline=body.timeline,
        budget_range=body.budget_range,
    )

    share_token = generate_share_token()
    proposal_id = db.execute(
        """INSERT INTO proposals
           (project_id, user_id, version, project_type, scope_description,
            timeline, budget_range, content_json, share_token)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (body.project_id, user["id"], version, body.project_type,
         body.scope_description, body.timeline, body.budget_range,
         json.dumps(content), share_token)
    )

    # Update project total if AI provided a price
    if content.get("total_price") and content["total_price"] > 0:
        db.execute(
            "UPDATE projects SET total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (content["total_price"], body.project_id)
        )

    return {"message": "Proposal generated", "id": proposal_id}


@router.get("", response_model=list[ProposalOut])
async def list_proposals(
    project_id: int | None = None,
    user: dict = Depends(get_current_user)
):
    """List proposals for the current user."""
    sql = "SELECT * FROM proposals WHERE user_id = ?"
    params = [user["id"]]
    if project_id:
        sql += " AND project_id = ?"
        params.append(project_id)
    sql += " ORDER BY created_at DESC"
    return db.query(sql, tuple(params))


@router.get("/{proposal_id}", response_model=ProposalOut)
async def get_proposal(proposal_id: int, user: dict = Depends(get_current_user)):
    """Get a specific proposal."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE id = ? AND user_id = ?",
        (proposal_id, user["id"]), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal


@router.post("/{proposal_id}/send", response_model=MessageResponse)
async def send_proposal(proposal_id: int, user: dict = Depends(get_current_user)):
    """Send a proposal to the client via email."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE id = ? AND user_id = ?",
        (proposal_id, user["id"]), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["status"] not in ("draft",):
        raise HTTPException(status_code=400, detail="Proposal already sent")

    project = db.query("SELECT * FROM projects WHERE id = ?", (proposal["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    # Send email
    email_service.send_proposal_notification(
        to_email=client["email"],
        freelancer_name=user["name"] or user["business_name"] or user["email"],
        project_name=project["name"],
        share_token=proposal["share_token"],
    )

    # Update status
    db.execute(
        "UPDATE proposals SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (proposal_id,)
    )

    # Update project status
    db.execute(
        "UPDATE projects SET status = 'proposed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'draft'",
        (proposal["project_id"],)
    )

    return {"message": "Proposal sent to client"}


@router.post("/{proposal_id}/regenerate", response_model=MessageResponse)
async def regenerate_proposal(proposal_id: int, user: dict = Depends(get_current_user)):
    """Regenerate the AI content for a draft proposal."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE id = ? AND user_id = ?",
        (proposal_id, user["id"]), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["status"] != "draft":
        raise HTTPException(status_code=400, detail="Can only regenerate draft proposals")

    project = db.query("SELECT * FROM projects WHERE id = ?", (proposal["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    content = ai.generate_proposal(
        freelancer_name=user["name"] or user["business_name"] or user["email"],
        client_name=client["name"],
        project_type=proposal["project_type"],
        scope_description=proposal["scope_description"],
        timeline=proposal["timeline"],
        budget_range=proposal["budget_range"],
    )

    db.execute(
        "UPDATE proposals SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (json.dumps(content), proposal_id)
    )

    return {"message": "Proposal regenerated"}


# ── Public Client-Facing Routes ──

@router.get("/view/{share_token}")
async def view_proposal(share_token: str, request: Request):
    """Public: View a proposal by share token (no auth required)."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE share_token = ?",
        (share_token,), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    # Mark as viewed
    if proposal["status"] == "sent" and not proposal["viewed_at"]:
        db.execute(
            "UPDATE proposals SET status = 'viewed', viewed_at = CURRENT_TIMESTAMP WHERE id = ?",
            (proposal["id"],)
        )

    # Get freelancer and project info
    user = db.query("SELECT * FROM users WHERE id = ?", (proposal["user_id"],), one=True)
    project = db.query("SELECT * FROM projects WHERE id = ?", (proposal["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    content = json.loads(proposal["content_json"])

    return {
        "proposal": {
            "id": proposal["id"],
            "version": proposal["version"],
            "status": proposal["status"],
            "content": content,
            "created_at": proposal["created_at"],
        },
        "freelancer": {
            "name": user["name"],
            "business_name": user["business_name"],
            "brand_color": user["brand_color"],
        },
        "project": {
            "name": project["name"],
        },
        "client": {
            "name": client["name"],
        },
    }


@router.post("/view/{share_token}/accept")
async def accept_proposal(share_token: str, request: Request):
    """Public: Accept a proposal (consent-click signature)."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE share_token = ?",
        (share_token,), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["status"] not in ("sent", "viewed"):
        raise HTTPException(status_code=400, detail="Proposal cannot be accepted in current state")

    # Record consent
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    project = db.query("SELECT * FROM projects WHERE id = ?", (proposal["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    db.execute(
        """UPDATE proposals SET
           status = 'accepted', accepted_at = CURRENT_TIMESTAMP,
           client_name = ?, client_ip = ?, client_user_agent = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (client["name"], client_ip, user_agent, proposal["id"])
    )

    # Move project to active
    db.execute(
        "UPDATE projects SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (proposal["project_id"],)
    )

    return {"message": "Proposal accepted", "status": "accepted"}


@router.post("/view/{share_token}/decline")
async def decline_proposal(share_token: str):
    """Public: Decline a proposal."""
    proposal = db.query(
        "SELECT * FROM proposals WHERE share_token = ?",
        (share_token,), one=True
    )
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["status"] not in ("sent", "viewed"):
        raise HTTPException(status_code=400, detail="Proposal cannot be declined in current state")

    db.execute(
        "UPDATE proposals SET status = 'declined', declined_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (proposal["id"],)
    )

    return {"message": "Proposal declined", "status": "declined"}
