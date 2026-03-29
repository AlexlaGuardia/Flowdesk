from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from models import (
    ProjectCreate, ProjectUpdate, ProjectOut, MilestoneOut,
    MilestoneCreate, MilestoneUpdate, ClientOut, MessageResponse
)
import db

router = APIRouter(prefix="/projects", tags=["projects"])


def _enrich_project(project: dict) -> dict:
    """Add milestones and client info to a project."""
    milestones = db.query(
        "SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at",
        (project["id"],)
    )
    client = db.query(
        "SELECT * FROM clients WHERE id = ?",
        (project["client_id"],), one=True
    )
    project["milestones"] = milestones
    project["client"] = client
    return project


@router.post("", response_model=MessageResponse)
async def create_project(body: ProjectCreate, user: dict = Depends(get_current_user)):
    """Create a new project with optional milestones."""
    # Verify client belongs to user
    client = db.query(
        "SELECT id FROM clients WHERE id = ? AND user_id = ?",
        (body.client_id, user["id"]), one=True
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    project_id = db.execute(
        """INSERT INTO projects (user_id, client_id, name, description, total_amount, start_date, due_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (user["id"], body.client_id, body.name, body.description,
         body.total_amount, body.start_date, body.due_date)
    )

    # Create milestones if provided
    if body.milestones:
        for ms in body.milestones:
            db.execute(
                """INSERT INTO milestones (project_id, name, description, amount, due_date)
                   VALUES (?, ?, ?, ?, ?)""",
                (project_id, ms.name, ms.description, ms.amount, ms.due_date)
            )

    return {"message": "Project created", "id": project_id}


@router.get("", response_model=list[ProjectOut])
async def list_projects(
    status: str | None = None,
    client_id: int | None = None,
    user: dict = Depends(get_current_user)
):
    """List projects with optional filters."""
    sql = "SELECT * FROM projects WHERE user_id = ?"
    params = [user["id"]]

    if status:
        sql += " AND status = ?"
        params.append(status)
    if client_id:
        sql += " AND client_id = ?"
        params.append(client_id)

    sql += " ORDER BY created_at DESC"
    rows = db.query(sql, tuple(params))
    return [_enrich_project(r) for r in rows]


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: int, user: dict = Depends(get_current_user)):
    """Get a specific project with milestones and client."""
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _enrich_project(project)


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: int, body: ProjectUpdate, user: dict = Depends(get_current_user)):
    """Update a project."""
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return _enrich_project(project)

    # Validate status transitions
    if "status" in updates:
        valid_transitions = {
            "draft": ["proposed", "active", "archived"],
            "proposed": ["active", "draft", "archived"],
            "active": ["completed", "archived"],
            "completed": ["archived"],
            "archived": ["draft"],
        }
        current = project["status"]
        new = updates["status"]
        if new not in valid_transitions.get(current, []):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from '{current}' to '{new}'"
            )

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [project_id, user["id"]]
    db.execute(
        f"UPDATE projects SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
        tuple(values)
    )

    updated = db.query("SELECT * FROM projects WHERE id = ?", (project_id,), one=True)
    return _enrich_project(updated)


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(project_id: int, user: dict = Depends(get_current_user)):
    """Delete a project (only if draft or archived)."""
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project["status"] not in ("draft", "archived"):
        raise HTTPException(
            status_code=409,
            detail="Can only delete draft or archived projects"
        )

    db.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", (project_id, user["id"]))
    return {"message": "Project deleted"}


# ── Milestones ──

@router.post("/{project_id}/milestones", response_model=MessageResponse)
async def add_milestone(project_id: int, body: MilestoneCreate, user: dict = Depends(get_current_user)):
    """Add a milestone to a project."""
    project = db.query(
        "SELECT id FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ms_id = db.execute(
        """INSERT INTO milestones (project_id, name, description, amount, due_date)
           VALUES (?, ?, ?, ?, ?)""",
        (project_id, body.name, body.description, body.amount, body.due_date)
    )
    return {"message": "Milestone added", "id": ms_id}


@router.patch("/{project_id}/milestones/{milestone_id}", response_model=MilestoneOut)
async def update_milestone(
    project_id: int, milestone_id: int,
    body: MilestoneUpdate, user: dict = Depends(get_current_user)
):
    """Update a milestone."""
    # Verify ownership
    project = db.query(
        "SELECT id FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ms = db.query(
        "SELECT * FROM milestones WHERE id = ? AND project_id = ?",
        (milestone_id, project_id), one=True
    )
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return ms

    # If completing a milestone, set completed_at
    if updates.get("status") == "completed":
        updates["completed_at"] = "CURRENT_TIMESTAMP"

    set_parts = []
    values = []
    for k, v in updates.items():
        if v == "CURRENT_TIMESTAMP":
            set_parts.append(f"{k} = CURRENT_TIMESTAMP")
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_clause = ", ".join(set_parts)
    values += [milestone_id, project_id]
    db.execute(
        f"UPDATE milestones SET {set_clause} WHERE id = ? AND project_id = ?",
        tuple(values)
    )

    return db.query("SELECT * FROM milestones WHERE id = ?", (milestone_id,), one=True)


@router.delete("/{project_id}/milestones/{milestone_id}", response_model=MessageResponse)
async def delete_milestone(
    project_id: int, milestone_id: int,
    user: dict = Depends(get_current_user)
):
    """Delete a milestone."""
    project = db.query(
        "SELECT id FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ms = db.query(
        "SELECT * FROM milestones WHERE id = ? AND project_id = ?",
        (milestone_id, project_id), one=True
    )
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")

    if ms["status"] == "invoiced":
        raise HTTPException(status_code=409, detail="Cannot delete an invoiced milestone")

    db.execute("DELETE FROM milestones WHERE id = ? AND project_id = ?", (milestone_id, project_id))
    return {"message": "Milestone deleted"}


# ── Dashboard Stats ──

@router.get("/stats/overview")
async def project_stats(user: dict = Depends(get_current_user)):
    """Get dashboard overview stats."""
    projects = db.query("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
            SUM(CASE WHEN status = 'proposed' THEN 1 ELSE 0 END) as proposed,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            COALESCE(SUM(total_amount), 0) as total_value,
            COALESCE(SUM(paid_amount), 0) as total_paid
        FROM projects WHERE user_id = ?
    """, (user["id"],), one=True)

    invoices = db.query("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
            SUM(CASE WHEN status IN ('sent', 'overdue') THEN 1 ELSE 0 END) as outstanding,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as revenue,
            COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN total ELSE 0 END), 0) as outstanding_amount
        FROM invoices WHERE user_id = ?
    """, (user["id"],), one=True)

    client_count = db.query(
        "SELECT COUNT(*) as c FROM clients WHERE user_id = ?",
        (user["id"],)
    )[0]["c"]

    return {
        "projects": projects,
        "invoices": invoices,
        "client_count": client_count,
    }
