from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse

import stripe
import config
import db
import stripe_service
from auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout")
async def create_subscription_checkout(user: dict = Depends(get_current_user)):
    """Create a Stripe checkout session for Pro subscription."""
    if user["tier"] == "pro":
        raise HTTPException(status_code=400, detail="Already subscribed to Pro")

    url = stripe_service.create_subscription_checkout(
        user_email=user["email"],
        success_url=f"{config.APP_URL}/dashboard?upgraded=1",
        cancel_url=f"{config.APP_URL}/settings",
    )
    if not url:
        raise HTTPException(status_code=500, detail="Could not create checkout session")

    return {"url": url}


@router.post("/portal")
async def create_portal_session(user: dict = Depends(get_current_user)):
    """Create a Stripe customer portal session for managing subscription."""
    if not user.get("stripe_customer_id"):
        raise HTTPException(status_code=400, detail="No active subscription")

    url = stripe_service.get_portal_url(
        customer_id=user["stripe_customer_id"],
        return_url=f"{config.APP_URL}/settings",
    )
    if not url:
        raise HTTPException(status_code=500, detail="Could not create portal session")

    return {"url": url}


@router.post("/webhook")
async def stripe_subscription_webhook(request: Request):
    """Handle Stripe subscription lifecycle events."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    if config.STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(payload, sig, config.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    else:
        event = stripe.Event.construct_from(
            stripe.util.json.loads(payload), stripe.api_key
        )

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        # Subscription checkout completed — activate Pro
        if data.get("mode") == "subscription":
            customer_id = data["customer"]
            subscription_id = data["subscription"]
            email = data.get("customer_email") or data.get("customer_details", {}).get("email")
            if email:
                db.execute(
                    "UPDATE users SET tier = 'pro', stripe_customer_id = ?, stripe_subscription_id = ? WHERE email = ?",
                    (customer_id, subscription_id, email),
                )

    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled — downgrade to free
        subscription_id = data["id"]
        db.execute(
            "UPDATE users SET tier = 'free', stripe_subscription_id = NULL WHERE stripe_subscription_id = ?",
            (subscription_id,),
        )

    elif event_type == "customer.subscription.updated":
        # Subscription updated — check if still active
        subscription_id = data["id"]
        status = data.get("status")
        if status in ("past_due", "unpaid", "canceled"):
            db.execute(
                "UPDATE users SET tier = 'free' WHERE stripe_subscription_id = ?",
                (subscription_id,),
            )
        elif status == "active":
            db.execute(
                "UPDATE users SET tier = 'pro' WHERE stripe_subscription_id = ?",
                (subscription_id,),
            )

    return JSONResponse({"received": True})
