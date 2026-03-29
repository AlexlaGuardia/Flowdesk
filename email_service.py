import resend
import config

resend.api_key = config.RESEND_API_KEY


def send_magic_link(to_email: str, token: str):
    """Send a magic login link."""
    link = f"{config.APP_URL}/auth/verify?token={token}"
    if not config.RESEND_API_KEY:
        print(f"[DEV] Magic link for {to_email}: {link}")
        return
    resend.Emails.send({
        "from": f"{config.APP_NAME} <{config.FROM_EMAIL}>",
        "to": [to_email],
        "subject": f"Sign in to {config.APP_NAME}",
        "html": f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 8px;">{config.APP_NAME}</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Click below to sign in. This link expires in {config.MAGIC_LINK_EXPIRY_MINUTES} minutes.</p>
            <a href="{link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Sign In</a>
            <p style="color: #9ca3af; margin-top: 24px; font-size: 13px;">If you didn't request this, ignore this email.</p>
        </div>
        """,
    })


def send_proposal_notification(to_email: str, freelancer_name: str, project_name: str, share_token: str):
    """Notify client that a proposal is ready for review."""
    link = f"{config.APP_URL}/p/{share_token}"
    if not config.RESEND_API_KEY:
        print(f"[DEV] Proposal link for {to_email}: {link}")
        return
    resend.Emails.send({
        "from": f"{config.APP_NAME} <{config.FROM_EMAIL}>",
        "to": [to_email],
        "subject": f"Proposal from {freelancer_name}: {project_name}",
        "html": f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #1f2937;">{freelancer_name} sent you a proposal</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Review the proposal for <strong>{project_name}</strong>.</p>
            <a href="{link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Proposal</a>
        </div>
        """,
    })


def send_invoice_notification(to_email: str, freelancer_name: str, invoice_number: str, total: float, share_token: str):
    """Notify client of a new invoice."""
    link = f"{config.APP_URL}/i/{share_token}"
    if not config.RESEND_API_KEY:
        print(f"[DEV] Invoice link for {to_email}: {link}")
        return
    resend.Emails.send({
        "from": f"{config.APP_NAME} <{config.FROM_EMAIL}>",
        "to": [to_email],
        "subject": f"Invoice {invoice_number} from {freelancer_name} — ${total:.2f}",
        "html": f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #1f2937;">Invoice from {freelancer_name}</h2>
            <p style="color: #6b7280;">Invoice <strong>{invoice_number}</strong> for <strong>${total:.2f}</strong></p>
            <a href="{link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View & Pay</a>
        </div>
        """,
    })


def send_followup(to_email: str, subject: str, body_html: str):
    """Send a follow-up email for overdue invoices."""
    if not config.RESEND_API_KEY:
        print(f"[DEV] Follow-up to {to_email}: {subject}")
        return
    resend.Emails.send({
        "from": f"{config.APP_NAME} <{config.FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": body_html,
    })
