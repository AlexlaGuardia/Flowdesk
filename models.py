from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional
from datetime import datetime


class FlexModel(BaseModel):
    """Base model that ignores extra fields from DB rows."""
    model_config = ConfigDict(extra="ignore")


# ── Auth ──

class MagicLinkRequest(BaseModel):
    email: EmailStr


class TokenResponse(FlexModel):
    access_token: str
    token_type: str = "bearer"


# ── Users ──

class UserOut(FlexModel):
    id: int
    email: str
    name: str
    business_name: str
    brand_color: str
    logo_path: Optional[str] = None
    tier: str
    onboarded: bool
    created_at: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    business_name: Optional[str] = None
    brand_color: Optional[str] = None


# ── Clients ──

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    company: Optional[str] = ""
    phone: Optional[str] = ""
    notes: Optional[str] = ""


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class ClientOut(FlexModel):
    id: int
    user_id: int
    name: str
    email: str
    company: str
    phone: str
    notes: str
    created_at: str
    updated_at: str


# ── Projects ──

class MilestoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = ""
    amount: float = 0
    due_date: Optional[str] = None


class MilestoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[str] = None


class MilestoneOut(FlexModel):
    id: int
    project_id: int
    name: str
    description: str
    amount: float
    status: str
    due_date: Optional[str]
    completed_at: Optional[str]
    created_at: str


class ProjectCreate(BaseModel):
    client_id: int
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = ""
    total_amount: Optional[float] = 0
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    milestones: Optional[list[MilestoneCreate]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None


class ProjectOut(FlexModel):
    id: int
    user_id: int
    client_id: int
    name: str
    description: str
    status: str
    total_amount: float
    paid_amount: float
    start_date: Optional[str]
    due_date: Optional[str]
    share_token: Optional[str] = None
    created_at: str
    updated_at: str
    milestones: list[MilestoneOut] = []
    client: Optional[ClientOut] = None


# ── Proposals ──

class ProposalWizard(BaseModel):
    """The 5-question wizard input for AI proposal generation."""
    project_id: int
    project_type: str = Field(..., description="Type of project (e.g., 'website redesign', 'brand identity')")
    scope_description: str = Field(..., description="What the client needs done")
    timeline: str = Field(..., description="Expected timeline (e.g., '4 weeks', '2 months')")
    budget_range: str = Field(..., description="Budget range (e.g., '$2,000-3,000')")


class ProposalContent(BaseModel):
    """Structured AI-generated proposal content."""
    executive_summary: str = ""
    scope_of_work: list[str] = []
    deliverables: list[str] = []
    timeline_breakdown: list[dict] = []
    pricing_table: list[dict] = []
    total_price: float = 0
    terms: str = ""
    valid_until: str = ""


class ProposalOut(FlexModel):
    id: int
    project_id: int
    version: int
    project_type: str
    scope_description: str
    timeline: str
    budget_range: str
    content_json: str
    status: str
    share_token: Optional[str]
    sent_at: Optional[str]
    viewed_at: Optional[str]
    accepted_at: Optional[str]
    created_at: str


# ── Invoices ──

class InvoiceItemCreate(BaseModel):
    description: str
    quantity: float = 1
    unit_price: float


class InvoiceCreate(BaseModel):
    project_id: int
    milestone_id: Optional[int] = None
    due_date: Optional[str] = None
    notes: Optional[str] = ""
    items: list[InvoiceItemCreate] = []


class InvoiceOut(FlexModel):
    id: int
    project_id: int
    invoice_number: str
    subtotal: float
    tax_rate: float
    tax_amount: float
    total: float
    notes: str
    status: str
    due_date: Optional[str]
    share_token: Optional[str]
    sent_at: Optional[str]
    paid_at: Optional[str]
    followup_stage: int
    created_at: str


# ── Generic ──

class MessageResponse(FlexModel):
    message: str
    id: Optional[int] = None
