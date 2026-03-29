from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from models import ClientCreate, ClientUpdate, ClientOut, MessageResponse
import db

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post("", response_model=MessageResponse)
async def create_client(body: ClientCreate, user: dict = Depends(get_current_user)):
    """Create a new client."""
    # Check for duplicate email under this user
    existing = db.query(
        "SELECT id FROM clients WHERE user_id = ? AND email = ?",
        (user["id"], body.email), one=True
    )
    if existing:
        raise HTTPException(status_code=409, detail="Client with this email already exists")

    client_id = db.execute(
        """INSERT INTO clients (user_id, name, email, company, phone, notes)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user["id"], body.name, body.email, body.company, body.phone, body.notes)
    )
    return {"message": "Client created", "id": client_id}


@router.get("", response_model=list[ClientOut])
async def list_clients(user: dict = Depends(get_current_user)):
    """List all clients for the current user."""
    rows = db.query(
        "SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],)
    )
    return rows


@router.get("/{client_id}", response_model=ClientOut)
async def get_client(client_id: int, user: dict = Depends(get_current_user)):
    """Get a specific client."""
    client = db.query(
        "SELECT * FROM clients WHERE id = ? AND user_id = ?",
        (client_id, user["id"]), one=True
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.patch("/{client_id}", response_model=ClientOut)
async def update_client(client_id: int, body: ClientUpdate, user: dict = Depends(get_current_user)):
    """Update a client."""
    client = db.query(
        "SELECT * FROM clients WHERE id = ? AND user_id = ?",
        (client_id, user["id"]), one=True
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return client

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [client_id, user["id"]]
    db.execute(
        f"UPDATE clients SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
        tuple(values)
    )
    return db.query("SELECT * FROM clients WHERE id = ?", (client_id,), one=True)


@router.delete("/{client_id}", response_model=MessageResponse)
async def delete_client(client_id: int, user: dict = Depends(get_current_user)):
    """Delete a client and all associated data."""
    client = db.query(
        "SELECT * FROM clients WHERE id = ? AND user_id = ?",
        (client_id, user["id"]), one=True
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Check for active projects
    active = db.query(
        "SELECT COUNT(*) as c FROM projects WHERE client_id = ? AND status IN ('proposed', 'active')",
        (client_id,)
    )[0]["c"]
    if active > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete client with {active} active project(s). Archive projects first."
        )

    db.execute("DELETE FROM clients WHERE id = ? AND user_id = ?", (client_id, user["id"]))
    return {"message": "Client deleted"}


@router.get("/{client_id}/summary")
async def client_summary(client_id: int, user: dict = Depends(get_current_user)):
    """Get a client summary with project/invoice stats."""
    client = db.query(
        "SELECT * FROM clients WHERE id = ? AND user_id = ?",
        (client_id, user["id"]), one=True
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    stats = db.query("""
        SELECT
            COUNT(*) as total_projects,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
            SUM(total_amount) as total_value,
            SUM(paid_amount) as total_paid
        FROM projects WHERE client_id = ? AND user_id = ?
    """, (client_id, user["id"]), one=True)

    invoice_stats = db.query("""
        SELECT
            COUNT(*) as total_invoices,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
            SUM(CASE WHEN status IN ('sent', 'overdue') THEN 1 ELSE 0 END) as outstanding_invoices,
            COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN total ELSE 0 END), 0) as outstanding_amount
        FROM invoices i
        JOIN projects p ON i.project_id = p.id
        WHERE p.client_id = ? AND i.user_id = ?
    """, (client_id, user["id"]), one=True)

    return {
        "client": client,
        "projects": stats,
        "invoices": invoice_stats,
    }
