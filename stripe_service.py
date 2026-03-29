import stripe
import config

stripe.api_key = config.STRIPE_SECRET_KEY


def create_checkout_session(
    invoice_id: int,
    invoice_number: str,
    amount_cents: int,
    freelancer_name: str,
    client_email: str,
    success_url: str,
    cancel_url: str,
) -> str | None:
    """Create a Stripe checkout session for invoice payment. Returns session URL."""
    if not config.STRIPE_SECRET_KEY:
        print(f"[DEV] Stripe checkout for {invoice_number}: ${amount_cents/100:.2f}")
        return None

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"Invoice {invoice_number}",
                        "description": f"Payment to {freelancer_name}",
                    },
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=client_email,
            metadata={
                "invoice_id": str(invoice_id),
                "invoice_number": invoice_number,
            },
        )
        return session.url
    except Exception as e:
        print(f"[Stripe] Checkout creation failed: {e}")
        return None


def create_subscription_checkout(
    user_email: str,
    success_url: str,
    cancel_url: str,
) -> str | None:
    """Create a checkout session for Stampwerk Pro subscription."""
    if not config.STRIPE_SECRET_KEY or not config.STRIPE_PRICE_ID:
        print(f"[DEV] Subscription checkout for {user_email}")
        return None

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": config.STRIPE_PRICE_ID,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user_email,
        )
        return session.url
    except Exception as e:
        print(f"[Stripe] Subscription checkout failed: {e}")
        return None


def get_portal_url(customer_id: str, return_url: str) -> str | None:
    """Create a Stripe customer portal session for managing subscription."""
    if not config.STRIPE_SECRET_KEY or not customer_id:
        return None

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return session.url
    except Exception as e:
        print(f"[Stripe] Portal session failed: {e}")
        return None
