"""Tier enforcement for free vs Pro users."""

from fastapi import HTTPException
import db

FREE_PROPOSALS_PER_MONTH = 5
FREE_INVOICES_PER_MONTH = 5


def _count_this_month(table: str, user_id: int) -> int:
    """Count records created this calendar month for a user."""
    row = db.query(
        f"SELECT COUNT(*) as c FROM {table} WHERE user_id = ? AND created_at >= date('now', 'start of month')",
        (user_id,),
        one=True,
    )
    return row["c"] if row else 0


def check_proposal_limit(user: dict):
    """Raise 403 if free user has hit monthly proposal limit."""
    if user["tier"] == "pro":
        return
    count = _count_this_month("proposals", user["id"])
    if count >= FREE_PROPOSALS_PER_MONTH:
        raise HTTPException(
            status_code=403,
            detail=f"Free plan limit: {FREE_PROPOSALS_PER_MONTH} proposals/month. Upgrade to Pro for unlimited.",
        )


def check_invoice_limit(user: dict):
    """Raise 403 if free user has hit monthly invoice limit."""
    if user["tier"] == "pro":
        return
    count = _count_this_month("invoices", user["id"])
    if count >= FREE_INVOICES_PER_MONTH:
        raise HTTPException(
            status_code=403,
            detail=f"Free plan limit: {FREE_INVOICES_PER_MONTH} invoices/month. Upgrade to Pro for unlimited.",
        )
