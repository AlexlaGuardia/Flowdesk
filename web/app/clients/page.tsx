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
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Client
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              {editingId ? "Update" : "Add Client"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Client list */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No clients yet. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.email}{c.company ? ` · ${c.company}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(c)} className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="text-sm text-red-500 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
