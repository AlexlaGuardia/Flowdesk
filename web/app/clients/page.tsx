"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { api } from "@/lib/api";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", notes: "" });

  const loadClients = () => api.get<Client[]>("/clients").then(setClients);
  useEffect(() => { loadClients(); }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", company: "", phone: "", notes: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.patch(`/clients/${editingId}`, form);
    } else {
      await api.post("/clients", form);
    }
    resetForm();
    loadClients();
  };

  const handleEdit = (c: Client) => {
    setForm({ name: c.name, email: c.email, company: c.company || "", phone: c.phone || "", notes: c.notes || "" });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this client?")) return;
    await api.delete(`/clients/${id}`);
    loadClients();
  };

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-sm text-ink-500 mt-1">{clients.length} total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary px-4 py-2 text-sm"
        >
          Add Client
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSave} className="card p-5 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Name *</label>
              <input
                type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Email *</label>
              <input
                type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Company</label>
              <input
                type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input
                type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label-field">Notes</label>
            <textarea
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-4 py-2 text-sm">
              {editingId ? "Update" : "Add Client"}
            </button>
            <button type="button" onClick={resetForm} className="text-sm text-ink-500 hover:text-ink-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Client list */}
      {clients.length === 0 ? (
        <div className="empty-stamp">
          <p className="empty-stamp-text">No clients yet. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="card divide-y divide-ledger/50">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-kraft">
              <div>
                <p className="font-medium text-ink-900">{c.name}</p>
                <p className="text-sm text-ink-500">{c.email}{c.company ? ` · ${c.company}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(c)} className="text-sm text-stamp-600 hover:text-stamp-700">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="text-sm text-void-red hover:text-void-red">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
