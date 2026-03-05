"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Account = {
  id: string;
  name: string;
};

type CustomerInvoice = {
  id: string;
  code: string;
  invoice_type: "survey" | "project";
  business_unit: "cctv" | "web" | "maintenance";
  account_id: string;
  account_name: string;
  project_id: string | null;
  project_name: string | null;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "partial" | "paid" | "cancelled";
  total_amount: number;
  notes: string | null;
};

export default function CustomerInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<"all" | "draft" | "sent" | "partial" | "paid">("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    invoice_type: "project" as "survey" | "project",
    business_unit: "cctv" as "cctv" | "web" | "maintenance",
    account_id: "",
    project_id: "",
    total_amount: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    notes: "",
  });

  const refresh = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .schema("finance")
      .from("customer_invoices")
      .select(`
        *,
        accounts(name),
        projects(name)
      `)
      .order("created_at", { ascending: false });

    if (err) throw err;
    setInvoices(
      (data || []).map((d: any) => ({
        ...d,
        account_name: d.accounts?.name,
        project_name: d.projects?.name,
      }))
    );
    setLoading(false);
  };

  const loadAccounts = async () => {
    const { data, error: err } = await supabase
      .schema("core")
      .from("accounts")
      .select("id, name")
      .order("name");

    if (err) return;
    setAccounts(data || []);
  };

  useEffect(() => {
    refresh();
    loadAccounts();
  }, []);

  const createInvoice = async () => {
    setError(null);
    try {
      const total_amount = Number(createForm.total_amount);
      if (!Number.isFinite(total_amount) || total_amount <= 0) {
        throw new Error("Total amount must be > 0");
      }

      const { data: codeData, error: codeErr } = await supabase.rpc(
        "core.generate_transaction_code",
        { p_prefix: "CI", p_date: new Date().toISOString() }
      );

      if (codeErr) throw codeErr;

      const { error } = await supabase.schema("finance").from("customer_invoices").insert({
        code: codeData,
        invoice_type: createForm.invoice_type,
        business_unit: createForm.business_unit,
        account_id: createForm.account_id,
        project_id: createForm.project_id || null,
        total_amount,
        issue_date: createForm.issue_date,
        due_date: createForm.due_date || null,
        notes: createForm.notes || null,
        status: "draft",
      });

      if (error) throw error;

      setShowCreateModal(false);
      setCreateForm({
        invoice_type: "project",
        business_unit: "cctv",
        account_id: "",
        project_id: "",
        total_amount: "",
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: "",
        notes: "",
      });
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create invoice");
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .schema("finance")
        .from("customer_invoices")
        .update({ status: "sent" })
        .eq("id", invoiceId);

      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send invoice");
    }
  };

  const cancelInvoice = async (invoiceId: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .schema("finance")
        .from("customer_invoices")
        .update({ status: "cancelled" })
        .eq("id", invoiceId);

      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to cancel invoice");
    }
  };

  const filtered = invoices.filter((inv) => filter === "all" || inv.status === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Invoices</h1>
          <p className="text-sm text-slate-400">Create and manage customer invoices</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          >
            + New Invoice
          </button>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {["all", "draft", "sent", "partial", "paid"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === s
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400">No invoices found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-slate-500">{inv.code}</div>
                  <div className="text-sm text-slate-100 mt-1">
                    Customer: <span className="text-slate-300">{inv.account_name}</span>
                  </div>
                  {inv.project_name && (
                    <div className="text-xs text-slate-400 mt-1">Project: {inv.project_name}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    Type: <span className="capitalize">{inv.invoice_type}</span>
                    <span className="mx-2">·</span>
                    Business Unit: <span className="capitalize">{inv.business_unit}</span>
                  </div>
                  {inv.notes && (
                    <div className="text-xs text-slate-400 mt-2">Notes: {inv.notes}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    Rp {inv.total_amount.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Issue: {inv.issue_date}
                    {inv.due_date && <span> · Due: {inv.due_date}</span>}
                  </div>
                  <div
                    className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block ${
                      inv.status === "draft"
                        ? "bg-slate-700 text-slate-300"
                        : inv.status === "sent"
                        ? "bg-amber-900/40 text-amber-300"
                        : inv.status === "partial"
                        ? "bg-amber-900/40 text-amber-300"
                        : inv.status === "paid"
                        ? "bg-emerald-900/40 text-emerald-300"
                        : "bg-rose-900/40 text-rose-300"
                    }`}
                  >
                    {inv.status}
                  </div>
                </div>
              </div>

              {inv.status === "draft" && (
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => sendInvoice(inv.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                  >
                    Send Invoice
                  </button>
                  <button
                    onClick={() => cancelInvoice(inv.id)}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold text-white">Create Customer Invoice</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Invoice Type</label>
                <select
                  value={createForm.invoice_type}
                  onChange={(e) => setCreateForm({ ...createForm, invoice_type: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                >
                  <option value="project">Project</option>
                  <option value="survey">Survey</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Business Unit</label>
                <select
                  value={createForm.business_unit}
                  onChange={(e) => setCreateForm({ ...createForm, business_unit: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                >
                  <option value="cctv">CCTV</option>
                  <option value="web">Web</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Customer</label>
                <select
                  value={createForm.account_id}
                  onChange={(e) => setCreateForm({ ...createForm, account_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                >
                  <option value="">Select customer...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Project (Optional)</label>
                <input
                  type="text"
                  value={createForm.project_id}
                  onChange={(e) => setCreateForm({ ...createForm, project_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                  placeholder="Project ID or name"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Total Amount</label>
                <input
                  type="number"
                  value={createForm.total_amount}
                  onChange={(e) => setCreateForm({ ...createForm, total_amount: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={createForm.issue_date}
                  onChange={(e) => setCreateForm({ ...createForm, issue_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={createForm.due_date}
                  onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={createInvoice}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}