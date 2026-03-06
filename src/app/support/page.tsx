"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ticket = {
  id: string;
  code: string;
  subject: string | null;
  status: string;
  priority: string;
  type: string;
  created_at: string;
};

type TicketPriority = "low" | "medium" | "high" | "critical";
type TicketType = "incident" | "maintenance" | "question" | "billing";

async function genCode(prefix: string): Promise<string> {
  const { data, error } = await supabase.schema("core").rpc("generate_transaction_code", {
    p_prefix: prefix,
  });
  if (error) throw error;
  return String(data);
}

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [type, setType] = useState<TicketType>("incident");

  const refresh = async () => {
    setErr(null);
    const { data, error } = await supabase
      .schema("support")
      .from("tickets")
      .select("id,code,subject,status,priority,type,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setTickets((data || []) as Ticket[]);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load tickets.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createTicket = async () => {
    setErr(null);
    try {
      if (!subject.trim()) throw new Error("Subject required.");
      const code = await genCode("TK");
      const { data: auth } = await supabase.auth.getUser();

      const { error } = await supabase.schema("support").from("tickets").insert({
        code,
        subject: subject.trim(),
        description: description.trim() || null,
        priority,
        type,
        status: "open",
        created_by: auth.user?.id || null,
        contact_name: null,
        contact_phone: null,
      });
      if (error) throw error;

      setSubject("");
      setDescription("");
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create ticket.";
      setErr(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support</h1>
        <p className="text-sm text-slate-400">
          Minimal ticketing: create + list tickets (support/admin only). Tickets may create maintenance work orders in
          the project schema; finance data remains read-only here.
        </p>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {err}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="text-sm font-semibold text-slate-200">Create ticket</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as TicketType)}
            >
              <option value="incident">incident</option>
              <option value="maintenance">maintenance</option>
              <option value="question">question</option>
              <option value="billing">billing</option>
            </select>
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </div>
        </div>
        <textarea
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <button
          onClick={createTicket}
          className="rounded-lg bg-sky-600 hover:bg-sky-700 px-4 py-2 text-white text-sm font-semibold"
        >
          Create
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Tickets</div>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : tickets.length === 0 ? (
          <div className="text-sm text-slate-400">No tickets yet.</div>
        ) : (
          <div className="space-y-2">
            {tickets.slice(0, 30).map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <div className="font-mono text-xs text-slate-500">{t.code}</div>
                <div className="text-sm font-semibold text-slate-100">{t.subject || "-"}</div>
                <div className="text-xs text-slate-500">
                  {t.type} · {t.priority} · {t.status} · {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

