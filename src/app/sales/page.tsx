"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Deal = {
  id: string;
  code: string;
  title: string | null;
  stage: string;
  account_id: string | null;
  created_at: string;
};

type Vendor = { id: string; name: string };

type WorkOrder = {
  id: string;
  code: string;
  type: string;
  status: string;
  vendor_id: string | null;
  project_id: string;
  created_at: string;
};

async function genCode(prefix: string): Promise<string> {
  const { data, error } = await supabase.schema("core").rpc("generate_transaction_code", {
    p_prefix: prefix,
  });
  if (error) throw error;
  return String(data);
}

export default function SalesPage() {
  const [me, setMe] = useState<{ id: string; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [dealTitle, setDealTitle] = useState("");

  const projectByDeal = useMemo(() => {
    // We keep this light: for minimal bring-up we derive work orders by project_id only.
    // Deals link to account; project is created alongside deal and can be located from work_orders.
    return new Map<string, string>();
  }, []);

  const refresh = async () => {
    setErr(null);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setMe(null);
      setLoading(false);
      return;
    }
    setMe({ id: auth.user.id, email: auth.user.email || null });

    const [{ data: v }, { data: d }, { data: wo }] = await Promise.all([
      supabase.schema("core").from("vendors").select("id,name").order("created_at", { ascending: false }),
      supabase
        .schema("crm")
        .from("deals")
        .select("id,code,title,stage,account_id,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .schema("project")
        .from("work_orders")
        .select("id,code,type,status,vendor_id,project_id,created_at")
        .order("created_at", { ascending: false }),
    ]);

    setVendors((v || []) as Vendor[]);
    setDeals((d || []) as Deal[]);
    setWorkOrders((wo || []) as WorkOrder[]);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load sales data.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSurveyRequest = async () => {
    setErr(null);
    try {
      if (!me) throw new Error("Not signed in.");
      if (!customerName.trim()) throw new Error("Customer name required.");

      const accountName = customerName.trim();
      const title = dealTitle.trim() || `Survey request for ${accountName}`;

      const [dealCode, projectCode, workOrderCode] = await Promise.all([
        genCode("DL"),
        genCode("SO"),
        genCode("WO"),
      ]);

      const { data: account, error: accErr } = await supabase
        .schema("core")
        .from("accounts")
        .insert({ name: accountName, type: "company" })
        .select("id")
        .single();
      if (accErr) throw accErr;

      const { data: project, error: projErr } = await supabase
        .schema("core")
        .from("projects")
        .insert({ code: projectCode, account_id: account.id, name: title, status: "survey" })
        .select("id")
        .single();
      if (projErr) throw projErr;

      const { data: deal, error: dealErr } = await supabase
        .schema("crm")
        .from("deals")
        .insert({
          code: dealCode,
          account_id: account.id,
          title,
          stage: "qualified",
          owner_user_id: me.id,
        })
        .select("id")
        .single();
      if (dealErr) throw dealErr;

      const { data: wo, error: woErr } = await supabase
        .schema("project")
        .from("work_orders")
        .insert({
          project_id: project.id,
          code: workOrderCode,
          type: "survey",
          status: "draft",
          vendor_id: null,
        })
        .select("id")
        .single();
      if (woErr) throw woErr;

      const { error: sErr } = await supabase.schema("project").from("surveys").insert({
        work_order_id: wo.id,
        status: "open",
      });
      if (sErr) throw sErr;

      setCustomerName("");
      setDealTitle("");
      await refresh();

      // Keep a tiny reminder in the UI
      projectByDeal.set(deal.id, project.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create survey request.";
      setErr(msg);
    }
  };

  const assignVendor = async (workOrderId: string, vendorId: string) => {
    setErr(null);
    try {
      const { error } = await supabase
        .schema("project")
        .from("work_orders")
        .update({ vendor_id: vendorId, status: "scheduled" })
        .eq("id", workOrderId);
      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to assign vendor.";
      setErr(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales</h1>
          <p className="text-sm text-slate-400">
            Minimal docs-first flow: create survey request → assign vendor → vendor proposes schedule+price → finance
            records payment → survey execution → final quote → execution work order.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Work order and invoice codes are immutable identifiers. Sales drives the pipeline and handoff but does not
            edit finance documents directly.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Signed in</div>
          <div className="text-sm font-semibold text-slate-200">{me?.email || "-"}</div>
          <Link className="text-xs text-sky-400 hover:underline" href="/dashboard/settings/users">
            Admin: Users
          </Link>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {err}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="text-sm font-semibold text-slate-200">Create survey request</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 text-sm"
            placeholder="Customer / company name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 text-sm md:col-span-2"
            placeholder="Deal title (optional)"
            value={dealTitle}
            onChange={(e) => setDealTitle(e.target.value)}
          />
        </div>
        <button
          onClick={createSurveyRequest}
          disabled={loading}
          className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 px-4 py-2 text-white text-sm font-semibold"
        >
          Create
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Survey work orders</div>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {workOrders.filter((w) => w.type === "survey").length === 0 ? (
          <div className="text-sm text-slate-400">No survey work orders yet.</div>
        ) : (
          <div className="space-y-2">
            {workOrders
              .filter((w) => w.type === "survey")
              .slice(0, 20)
              .map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="font-mono text-xs text-slate-500">{w.code}</div>
                    <div className="text-sm font-semibold text-slate-100">
                      Status: <span className="text-slate-300">{w.status}</span>
                    </div>
                    <div className="text-xs text-slate-500">Project: {w.project_id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                      value={w.vendor_id || ""}
                      onChange={(e) => assignVendor(w.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Assign vendor…
                      </option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <Link
                      className="text-xs px-3 py-2 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
                      href="/vendor"
                    >
                      View as vendor
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        If you’re testing locally, use `sales.localtest.me:3000` / `vendor.localtest.me:3000` / `finance.localtest.me:3000`.
      </div>
    </div>
  );
}

