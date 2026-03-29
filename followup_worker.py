"""
Stampwerk Follow-Up Worker
Runs as a background daemon (PM2). Checks for overdue invoices and sends
AI-generated follow-up emails on a 3-stage escalation:
  Stage 1 (3 days overdue): Friendly reminder
  Stage 2 (7 days overdue): Firm follow-up
  Stage 3 (14 days overdue): Final notice

Run: python3 followup_worker.py
PM2: pm2 start followup_worker.py --name stampwerk-followup --interpreter python3
"""

import time
import traceback
from datetime import datetime, timezone

import db
import ai
import email_service
import config

CYCLE_INTERVAL = 3600  # Check every hour
STAGE_DAYS = {1: 3, 2: 7, 3: 14}


def check_overdue_invoices():
    """Find invoices that need follow-up and send AI-generated emails."""
    now = datetime.now(timezone.utc)

    # Find invoices where next_followup_at has passed
    invoices = db.query("""
        SELECT i.*, p.name as project_name, p.client_id
        FROM invoices i
        JOIN projects p ON i.project_id = p.id
        WHERE i.status IN ('sent', 'viewed', 'overdue')
          AND i.next_followup_at IS NOT NULL
          AND i.next_followup_at <= datetime('now')
          AND i.followup_stage < 3
    """)

    if not invoices:
        return 0

    sent = 0
    for inv in invoices:
        try:
            next_stage = inv["followup_stage"] + 1
            if next_stage > 3:
                continue

            user = db.query("SELECT * FROM users WHERE id = ?", (inv["user_id"],), one=True)
            client = db.query("SELECT * FROM clients WHERE id = ?", (inv["client_id"],), one=True)

            if not user or not client:
                continue

            # Calculate days overdue
            if inv["due_date"]:
                due = datetime.strptime(inv["due_date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                days_overdue = max(0, (now - due).days)
            else:
                # If no due date, use sent_at + stage days
                days_overdue = STAGE_DAYS[next_stage]

            freelancer_name = user["name"] or user["business_name"] or user["email"]

            # Generate AI follow-up email
            email_content = ai.generate_followup(
                freelancer_name=freelancer_name,
                client_name=client["name"],
                invoice_number=inv["invoice_number"],
                amount=inv["total"],
                days_overdue=days_overdue,
                stage=next_stage,
            )

            # Send the email
            email_service.send_followup(
                to_email=client["email"],
                subject=email_content["subject"],
                body_html=email_content["body"],
            )

            # Log the follow-up
            db.execute(
                "INSERT INTO followups (invoice_id, stage, subject, body) VALUES (?, ?, ?, ?)",
                (inv["id"], next_stage, email_content["subject"], email_content["body"])
            )

            # Schedule next follow-up or mark as done
            if next_stage < 3:
                next_days = STAGE_DAYS[next_stage + 1] - STAGE_DAYS[next_stage]
                db.execute(
                    """UPDATE invoices SET
                       followup_stage = ?, status = 'overdue',
                       next_followup_at = datetime('now', '+' || ? || ' days'),
                       updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?""",
                    (next_stage, next_days, inv["id"])
                )
            else:
                # Stage 3 is the last — no more follow-ups
                db.execute(
                    """UPDATE invoices SET
                       followup_stage = 3, status = 'overdue',
                       next_followup_at = NULL,
                       updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?""",
                    (inv["id"],)
                )

            sent += 1
            print(f"[followup] Stage {next_stage} sent for {inv['invoice_number']} to {client['email']}")

        except Exception as e:
            print(f"[followup] Error processing invoice {inv['id']}: {e}")
            traceback.print_exc()

    return sent


def mark_overdue():
    """Mark invoices past due date as overdue."""
    db.execute("""
        UPDATE invoices SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
        WHERE status IN ('sent', 'viewed')
          AND due_date IS NOT NULL
          AND due_date < date('now')
    """)


def run():
    """Main daemon loop."""
    print(f"[followup] Worker started. Cycle: {CYCLE_INTERVAL}s")
    db.init_db()

    while True:
        try:
            mark_overdue()
            sent = check_overdue_invoices()
            if sent > 0:
                print(f"[followup] Sent {sent} follow-up(s)")
        except Exception as e:
            print(f"[followup] Cycle error: {e}")
            traceback.print_exc()

        time.sleep(CYCLE_INTERVAL)


if __name__ == "__main__":
    run()
