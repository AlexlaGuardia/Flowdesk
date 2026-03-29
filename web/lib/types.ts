export interface User {
  id: number;
  email: string;
  name: string | null;
  business_name: string | null;
  brand_color: string;
  logo_path: string | null;
  tier: string;
  onboarded: number;
  created_at: string;
}

export interface Client {
  id: number;
  user_id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed" | "invoiced";
  completed_at: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  client_id: number;
  name: string;
  description: string | null;
  status: "draft" | "proposed" | "active" | "completed" | "archived";
  total_amount: number;
  paid_amount: number;
  start_date: string | null;
  due_date: string | null;
  share_token: string;
  milestones: Milestone[];
  client: Client | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: number;
  project_id: number;
  user_id: number;
  version: number;
  project_type: string;
  scope_description: string;
  timeline: string;
  budget_range: string;
  client_name: string;
  content_json: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  share_token: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  project_id: number;
  user_id: number;
  invoice_number: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "void";
  due_date: string;
  share_token: string;
  stripe_checkout_session: string | null;
  followup_stage: number;
  items: InvoiceItem[];
  project: Project | null;
  client: Client | null;
  created_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
}

export interface Contract {
  id: number;
  project_id: number;
  user_id: number;
  proposal_id: number;
  content_json: string;
  content: Record<string, unknown>;
  status: "draft" | "sent" | "viewed" | "signed" | "voided";
  share_token: string;
  signed_at: string | null;
  signer_name: string | null;
  project: Project | null;
  client: Client | null;
  created_at: string;
}

export interface DashboardStats {
  projects: {
    total: number;
    drafts: number;
    proposed: number;
    active: number;
    completed: number;
    total_value: number;
    total_paid: number;
  };
  invoices: {
    total: number;
    paid: number;
    outstanding: number;
    revenue: number;
    outstanding_amount: number;
  };
  client_count: number;
}
