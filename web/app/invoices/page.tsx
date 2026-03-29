"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { Invoice, Project, Client } from "@/lib/types";

export default function InvoicesPage() {
  return <Suspense><InvoicesInner /></Suspense>;
}

function InvoicesInner() {
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("project_id");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: projectFilter || "", due_date: "", items: [{ description: "", quantity: "1", unit_price: "" }] });

  const loadInvoices = () => {
    const params = projectFilter ? { project_id: projectFilter } : undefined;
    api.get<Invoice[]>("/invoices", params).then(setInvoices);
  };

  useEffect(() => { loadInvoices(); }, [projectFilter]);
  useEffect(() => {
    api.get<Project[]>("/projects").then(setProjects);
    api.get<Client[]>("/clients").then(setClients);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { description: "", quantity: "1", unit_price: "" }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, field: string, value: string) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, items });
  };

  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price) || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/invoices", {
      project_id: Number(form.project_id),
      due_date: form.due_date,
      items: form.items.map((item, i) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        sort_order: i,
      })),
    });
    setShowForm(false);
    setForm({ project_id: "", due_date: "", items: [{ description: "", quantity: "1", unit_price: "" }] });
    loadInvoices();
  };

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.filter((i) => ["sent", "overdue", "viewed"].includes(i.status)).reduce((s, i) => s + i.total, 0);

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="text-sm text-ink-500 mt-1">{invoices.length} total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 text-sm"
        >
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color="green" />
        <StatCard label="Outstanding" value={`$${totalOutstanding.toFixed(2)}`} color="amber" />
        <StatCard label="Invoices Sent" value={invoices.length} color="gray" />
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Project *</label>
              <select
                required value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Due date *</label>
              <input
                type="date" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label className="label-field mb-2">Line Items</label>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text" required placeholder="Description" value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="number" min="1" required placeholder="Qty" value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="input-field w-16"
                  />
                  <input
                    type="number" step="0.01" required placeholder="Price" value={item.unit_price}
                    onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                    className="input-field w-24"
                  />
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-void-red hover:text-void-red text-sm px-2">X</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 text-xs text-stamp-600 hover:text-stamp-700">+ Add line item</button>
            <p className="mt-2 text-right text-sm font-medium font-mono text-ink-900">Subtotal: ${subtotal.toFixed(2)}</p>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-4 py-2 text-sm">
              Create Invoice
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-500 hover:text-ink-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div className="empty-stamp">
          <p className="empty-stamp-text">No invoices yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ledger/50">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center justify-between p-4 hover:bg-kraft block"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink-900">{inv.invoice_number}</p>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-sm text-ink-500 mt-0.5">
                  Due {new Date(inv.due_date).toLocaleDateString()}
                </p>
              </div>
              <p className="text-lg font-bold font-mono text-ink-900">${inv.total.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
