import json
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import get_current_user, generate_share_token
from models import InvoiceCreate, InvoiceOut, MessageResponse
from tier import check_invoice_limit
import db
import config
import stripe_service
import email_service

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _next_invoice_number(user_id: int) -> str:
    """Generate the next invoice number for a user (SW-001, SW-002...)."""
    result = db.query(
        "SELECT COUNT(*) as c FROM invoices WHERE user_id = ?",
        (user_id,), one=True
    )
    num = (result["c"] or 0) + 1
    return f"SW-{num:03d}"


@router.post("", response_model=MessageResponse)
async def create_invoice(body: InvoiceCreate, user: dict = Depends(get_current_user)):
    """Create a new invoice with line items."""
    check_invoice_limit(user)
    # Verify project belongs to user
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (body.project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify milestone if provided
    if body.milestone_id:
        ms = db.query(
            "SELECT * FROM milestones WHERE id = ? AND project_id = ?",
            (body.milestone_id, body.project_id), one=True
        )
        if not ms:
            raise HTTPException(status_code=404, detail="Milestone not found")
        if ms["status"] == "invoiced":
            raise HTTPException(status_code=409, detail="Milestone already invoiced")

    # Calculate totals from line items
    subtotal = sum(item.quantity * item.unit_price for item in body.items)
    total = subtotal  # No tax in MVP

    invoice_number = _next_invoice_number(user["id"])
    share_token = generate_share_token()

    invoice_id = db.execute(
        """INSERT INTO invoices
           (project_id, user_id, milestone_id, invoice_number, subtotal, total,
            notes, due_date, share_token)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (body.project_id, user["id"], body.milestone_id, invoice_number,
         subtotal, total, body.notes, body.due_date, share_token)
    )

    # Insert line items
    for i, item in enumerate(body.items):
        db.execute(
            """INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount, sort_order)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (invoice_id, item.description, item.quantity, item.unit_price,
             item.quantity * item.unit_price, i)
        )

    # Mark milestone as invoiced
    if body.milestone_id:
        db.execute(
            "UPDATE milestones SET status = 'invoiced' WHERE id = ?",
            (body.milestone_id,)
        )

    return {"message": f"Invoice {invoice_number} created", "id": invoice_id}


@router.get("", response_model=list[InvoiceOut])
async def list_invoices(
    project_id: int | None = None,
    status: str | None = None,
    user: dict = Depends(get_current_user)
):
    """List invoices with optional filters."""
    sql = "SELECT * FROM invoices WHERE user_id = ?"
    params = [user["id"]]
    if project_id:
        sql += " AND project_id = ?"
        params.append(project_id)
    if status:
        sql += " AND status = ?"
        params.append(status)
    sql += " ORDER BY created_at DESC"
    return db.query(sql, tuple(params))


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: int, user: dict = Depends(get_current_user)):
    """Get an invoice with line items."""
    invoice = db.query(
        "SELECT * FROM invoices WHERE id = ? AND user_id = ?",
        (invoice_id, user["id"]), one=True
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    items = db.query(
        "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order",
        (invoice_id,)
    )
    project = db.query("SELECT * FROM projects WHERE id = ?", (invoice["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    return {**invoice, "items": items, "project": project, "client": client}


@router.post("/{invoice_id}/send", response_model=MessageResponse)
async def send_invoice(invoice_id: int, user: dict = Depends(get_current_user)):
    """Send an invoice to the client. Creates Stripe checkout and sends email."""
    invoice = db.query(
        "SELECT * FROM invoices WHERE id = ? AND user_id = ?",
        (invoice_id, user["id"]), one=True
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice["status"] not in ("draft",):
        raise HTTPException(status_code=400, detail="Invoice already sent")

    project = db.query("SELECT * FROM projects WHERE id = ?", (invoice["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    # Create Stripe checkout session
    share_url = f"{config.APP_URL}/i/{invoice['share_token']}"
    checkout_url = stripe_service.create_checkout_session(
        invoice_id=invoice["id"],
        invoice_number=invoice["invoice_number"],
        amount_cents=int(invoice["total"] * 100),
        freelancer_name=user["name"] or user["business_name"] or user["email"],
        client_email=client["email"],
        success_url=f"{share_url}?paid=true",
        cancel_url=share_url,
    )

    # Update invoice
    db.execute(
        """UPDATE invoices SET
           status = 'sent', sent_at = CURRENT_TIMESTAMP,
           stripe_payment_link = ?,
           next_followup_at = datetime('now', '+3 days'),
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (checkout_url, invoice_id)
    )

    # Send email
    email_service.send_invoice_notification(
        to_email=client["email"],
        freelancer_name=user["name"] or user["business_name"] or user["email"],
        invoice_number=invoice["invoice_number"],
        total=invoice["total"],
        share_token=invoice["share_token"],
    )

    return {"message": f"Invoice {invoice['invoice_number']} sent to {client['email']}"}


@router.post("/{invoice_id}/mark-paid", response_model=MessageResponse)
async def mark_paid(invoice_id: int, user: dict = Depends(get_current_user)):
    """Manually mark an invoice as paid (for cash/check/external payments)."""
    invoice = db.query(
        "SELECT * FROM invoices WHERE id = ? AND user_id = ?",
        (invoice_id, user["id"]), one=True
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice["status"] == "paid":
        raise HTTPException(status_code=400, detail="Already paid")

    _mark_invoice_paid(invoice_id, invoice["project_id"], invoice["total"])
    return {"message": f"Invoice {invoice['invoice_number']} marked as paid"}


@router.post("/{invoice_id}/void", response_model=MessageResponse)
async def void_invoice(invoice_id: int, user: dict = Depends(get_current_user)):
    """Void an invoice."""
    invoice = db.query(
        "SELECT * FROM invoices WHERE id = ? AND user_id = ?",
        (invoice_id, user["id"]), one=True
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice["status"] == "paid":
        raise HTTPException(status_code=400, detail="Cannot void a paid invoice")

    db.execute(
        "UPDATE invoices SET status = 'void', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (invoice_id,)
    )
    return {"message": f"Invoice {invoice['invoice_number']} voided"}


# ── Public Client-Facing Routes ──

@router.get("/view/{share_token}")
async def view_invoice(share_token: str):
    """Public: View an invoice by share token (no auth required)."""
    invoice = db.query(
        "SELECT * FROM invoices WHERE share_token = ?",
        (share_token,), one=True
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Mark as viewed
    if invoice["status"] == "sent" and not invoice["viewed_at"]:
        db.execute(
            "UPDATE invoices SET status = 'viewed', viewed_at = CURRENT_TIMESTAMP WHERE id = ?",
            (invoice["id"],)
        )

    items = db.query(
        "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order",
        (invoice["id"],)
    )
    user = db.query("SELECT * FROM users WHERE id = ?", (invoice["user_id"],), one=True)
    project = db.query("SELECT * FROM projects WHERE id = ?", (invoice["project_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    return {
        "invoice": {
            "id": invoice["id"],
            "invoice_number": invoice["invoice_number"],
            "subtotal": invoice["subtotal"],
            "tax_rate": invoice["tax_rate"],
            "tax_amount": invoice["tax_amount"],
            "total": invoice["total"],
            "notes": invoice["notes"],
            "status": invoice["status"],
            "due_date": invoice["due_date"],
            "created_at": invoice["created_at"],
            "stripe_payment_link": invoice["stripe_payment_link"],
        },
        "items": items,
        "freelancer": {
            "name": user["name"],
            "business_name": user["business_name"],
            "brand_color": user["brand_color"],
        },
        "project": {"name": project["name"]},
        "client": {"name": client["name"]},
    }


# ── Stripe Webhook ──

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events for payment confirmation."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if config.STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            import stripe
            event = stripe.Webhook.construct_event(
                payload, sig_header, config.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    else:
        import json as json_mod
        event = json_mod.loads(payload)

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        invoice_id = session.get("metadata", {}).get("invoice_id")
        if invoice_id:
            invoice = db.query("SELECT * FROM invoices WHERE id = ?", (int(invoice_id),), one=True)
            if invoice and invoice["status"] != "paid":
                _mark_invoice_paid(
                    int(invoice_id),
                    invoice["project_id"],
                    invoice["total"],
                    stripe_payment_intent=session.get("payment_intent"),
                    stripe_checkout_session=session.get("id"),
                )

    return {"received": True}


# ── Helpers ──

def _mark_invoice_paid(
    invoice_id: int,
    project_id: int,
    amount: float,
    stripe_payment_intent: str = None,
    stripe_checkout_session: str = None,
):
    """Mark an invoice as paid and update project paid_amount."""
    db.execute(
        """UPDATE invoices SET
           status = 'paid', paid_at = CURRENT_TIMESTAMP,
           stripe_payment_intent = COALESCE(?, stripe_payment_intent),
           stripe_checkout_session = COALESCE(?, stripe_checkout_session),
           next_followup_at = NULL,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (stripe_payment_intent, stripe_checkout_session, invoice_id)
    )

    # Update project paid amount
    db.execute(
        """UPDATE projects SET
           paid_amount = paid_amount + ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (amount, project_id)
    )

    # Check if project is fully paid → mark completed
    project = db.query("SELECT * FROM projects WHERE id = ?", (project_id,), one=True)
    if project and project["paid_amount"] >= project["total_amount"] and project["total_amount"] > 0:
        db.execute(
            "UPDATE projects SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (project_id,)
        )
