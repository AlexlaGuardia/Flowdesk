import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent

# App
APP_URL = os.getenv("APP_URL", "http://localhost:8600")
APP_NAME = os.getenv("APP_NAME", "Stampwerk")
PORT = int(os.getenv("PORT", "8600"))

# Database
DB_PATH = BASE_DIR / "flowdesk.db"

# Auth
JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret-change-me")
MAGIC_LINK_SECRET = os.getenv("MAGIC_LINK_SECRET", "dev-magic-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 72
MAGIC_LINK_EXPIRY_MINUTES = 15

# Email (Resend)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "hello@stampwerk.com")

# AI (Groq)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")

# File uploads
UPLOAD_DIR = BASE_DIR / "uploads"
MAX_UPLOAD_SIZE_MB = 25
