"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type SurveyRow = {
  id: string;
  work_order_id: string;
  status: string;
  scheduled_at: string | null;
  pre_survey_price: number | null;
  survey_invoice_id: string | null;
  final_quote_amount: number | null;
  report_notes: string | null;
};

type WorkOrderRow = {
  id: string;
  code: string;
  project_id: string;
  type: string;
  status: string;
  vendor_id: string | null;
};

type SurveyArtifact = {
  id: string;
  survey_id: string;
  kind: "overall" | "zone" | "detail" | "other";
  label: string | null;
  file_url: string;
  notes: string | null;
  created_at: string;
};

type SurveyCamera = {
  id: string;
  survey_id: string;
  label: string;
  zone: string | null;
  notes: string | null;
};

type SurveyLineItem = {
  id: string;
  survey_id: string;
  zone: string | null;
  product_brand: string | null;
  product_name: string | null;
  product_spec: string | null;
  quantity: number;
  camera_label: string | null;
  unit_price: number | null;
  line_total: number | null;
};

type NewArtifactForm = {
  kind: SurveyArtifact["kind"];
  label: string;
  fileUrl: string;
  notes: string;
};

type NewCameraForm = {
  zone: string;
  notes: string;
};

type NewLineItemForm = {
  zone: string;
  productBrand: string;
  productName: string;
  productSpec: string;
  quantity: string;
  unitPrice: string;
  cameraLabel: string;
};

export default function VendorPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrderRow[]>([]);
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [artifacts, setArtifacts] = useState<SurveyArtifact[]>([]);
  const [cameras, setCameras] = useState<SurveyCamera[]>([]);
  const [lineItems, setLineItems] = useState<SurveyLineItem[]>([]);

  const [scheduledAtBySurvey, setScheduledAtBySurvey] = useState<Record<string, string>>({});
  const [priceBySurvey, setPriceBySurvey] = useState<Record<string, string>>({});

  const [artifactFormBySurvey, setArtifactFormBySurvey] = useState<Record<string, NewArtifactForm>>({});
  const [cameraFormBySurvey, setCameraFormBySurvey] = useState<Record<string, NewCameraForm>>({});
  const [lineItemFormBySurvey, setLineItemFormBySurvey] = useState<Record<string, NewLineItemForm>>({});
  const [quoteAmountBySurvey, setQuoteAmountBySurvey] = useState<Record<string, string>>({});
  const [reportNotesBySurvey, setReportNotesBySurvey] = useState<Record<string, string>>({});

  const refresh = async () => {
    setErr(null);

    const [{ data: wo, error: woErr }, { data: s, error: sErr }] = await Promise.all([
      supabase
        .schema("project")
        .from("work_orders")
        .select("id,code,project_id,type,status,vendor_id")
        .eq("type", "survey")
        .order("created_at", { ascending: false }),
      supabase
        .schema("project")
        .from("surveys")
        .select(
          "id,work_order_id,status,scheduled_at,pre_survey_price,survey_invoice_id,final_quote_amount,report_notes",
        )
        .order("created_at", { ascending: false }),
    ]);

    if (woErr) throw woErr;
    if (sErr) throw sErr;

    const woRows = (wo || []) as WorkOrderRow[];
    const surveyRows = (s || []) as SurveyRow[];

    setWorkOrders(woRows);
    setSurveys(surveyRows);

    const surveyIds = surveyRows.map((row) => row.id);
    if (surveyIds.length === 0) {
      setArtifacts([]);
      setCameras([]);
      setLineItems([]);
      return;
    }

    const [{ data: a, error: aErr }, { data: c, error: cErr }, { data: li, error: liErr }] = await Promise.all([
      supabase
        .schema("project")
        .from("survey_artifacts")
        .select("id,survey_id,kind,label,file_url,notes,created_at")
        .in("survey_id", surveyIds),
      supabase
        .schema("project")
        .from("survey_cameras")
        .select("id,survey_id,label,zone,notes")
        .in("survey_id", surveyIds),
      supabase
        .schema("project")
        .from("survey_line_items")
        .select(
          "id,survey_id,zone,product_brand,product_name,product_spec,quantity,camera_label,unit_price,line_total",
        )
        .in("survey_id", surveyIds),
    ]);

    if (aErr) throw aErr;
    if (cErr) throw cErr;
    if (liErr) throw liErr;

    setArtifacts(((a as SurveyArtifact[] | null) || []) as SurveyArtifact[]);
    setCameras(((c as SurveyCamera[] | null) || []) as SurveyCamera[]);
    setLineItems(((li as SurveyLineItem[] | null) || []) as SurveyLineItem[]);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load vendor queue.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const proposeScheduleAndPrice = async (surveyId: string) => {
    setErr(null);
    try {
      const scheduled_at = scheduledAtBySurvey[surveyId];
      const pre_survey_price = Number(priceBySurvey[surveyId] || 0);
      if (!scheduled_at) throw new Error("Please choose schedule date/time.");
      if (!Number.isFinite(pre_survey_price) || pre_survey_price <= 0)
        throw new Error("Survey price must be > 0.");

      const { data, error } = await supabase.schema("project").rpc("vendor_propose_survey_price", {
        p_survey_id: surveyId,
        p_scheduled_at: new Date(scheduled_at).toISOString(),
        p_pre_survey_price: pre_survey_price,
      });
      if (error) throw error;

      await refresh();

      const row = Array.isArray(data) ? (data[0] as { invoice_code?: string } | undefined) : (data as
            | { invoice_code?: string }
            | null);
      if (row?.invoice_code) {
        alert(`Survey invoice created: ${row.invoice_code}. Waiting for finance payment confirmation.`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit schedule/price.";
      setErr(msg);
    }
  };

  const surveyByWorkOrder = useMemo(() => {
    const m = new Map<string, SurveyRow>();
    for (const s of surveys) m.set(s.work_order_id, s);
    return m;
  }, [surveys]);

  const artifactsBySurvey = useMemo(() => {
    const m = new Map<string, SurveyArtifact[]>();
    for (const a of artifacts) {
      const list = m.get(a.survey_id) ?? [];
      list.push(a);
      m.set(a.survey_id, list);
    }
    return m;
  }, [artifacts]);

  const camerasBySurvey = useMemo(() => {
    const m = new Map<string, SurveyCamera[]>();
    for (const c of cameras) {
      const list = m.get(c.survey_id) ?? [];
      list.push(c);
      m.set(c.survey_id, list);
    }
    return m;
  }, [cameras]);

  const lineItemsBySurvey = useMemo(() => {
    const m = new Map<string, SurveyLineItem[]>();
    for (const li of lineItems) {
      const list = m.get(li.survey_id) ?? [];
      list.push(li);
      m.set(li.survey_id, list);
    }
    return m;
  }, [lineItems]);

  const nextCameraLabel = (surveyId: string): string => {
    const existing = camerasBySurvey.get(surveyId) ?? [];
    if (existing.length === 0) return "C1";
    const numbers = existing
      .map((c) => {
        const match = /^C(\d+)$/.exec(c.label);
        return match ? Number(match[1]) : 0;
      })
      .filter((n) => Number.isFinite(n) && n > 0);
    const max = numbers.length ? Math.max(...numbers) : existing.length;
    return `C${max + 1}`;
  };

  const handleAddArtifact = async (surveyId: string) => {
    const form = artifactFormBySurvey[surveyId];
    if (!form || !form.fileUrl) {
      setErr("Please provide a file URL for the artifact.");
      return;
    }
    setErr(null);
    try {
      const payload = {
        survey_id: surveyId,
        kind: form.kind,
        label: form.label || null,
        file_url: form.fileUrl,
        notes: form.notes || null,
      };
      const { error } = await supabase.schema("project").from("survey_artifacts").insert(payload);
      if (error) throw error;
      await refresh();
      setArtifactFormBySurvey((m) => ({
        ...m,
        [surveyId]: { kind: "overall", label: "", fileUrl: "", notes: "" },
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add artifact.";
      setErr(msg);
    }
  };

  const ensureCameraSeed = async (surveyId: string) => {
    const existing = camerasBySurvey.get(surveyId) ?? [];
    if (existing.length > 0) return;
    const label = "C1";
    const form = cameraFormBySurvey[surveyId];
    const zone = form?.zone || null;
    const notes = form?.notes || null;
    const { error } = await supabase
      .schema("project")
      .from("survey_cameras")
      .insert({ survey_id: surveyId, label, zone, notes });
    if (error) throw error;
  };

  const handleAddCamera = async (surveyId: string) => {
    setErr(null);
    try {
      await ensureCameraSeed(surveyId);
      const label = nextCameraLabel(surveyId);
      const form = cameraFormBySurvey[surveyId];
      const zone = form?.zone || null;
      const notes = form?.notes || null;
      const { error } = await supabase
        .schema("project")
        .from("survey_cameras")
        .insert({ survey_id: surveyId, label, zone, notes });
      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add camera.";
      setErr(msg);
    }
  };

  const handleAddLineItem = async (surveyId: string) => {
    const form = lineItemFormBySurvey[surveyId];
    if (!form) {
      setErr("Please fill in the material item before adding.");
      return;
    }
    const quantity = Number(form.quantity);
    const unitPrice = form.unitPrice ? Number(form.unitPrice) : null;
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErr("Quantity must be a positive number.");
      return;
    }
    if (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0)) {
      setErr("Unit price must be a valid number.");
      return;
    }
    setErr(null);
    try {
      const lineTotal = unitPrice !== null ? quantity * unitPrice : null;
      const payload = {
        survey_id: surveyId,
        zone: form.zone || null,
        product_brand: form.productBrand || null,
        product_name: form.productName || null,
        product_spec: form.productSpec || null,
        quantity,
        camera_label: form.cameraLabel || null,
        unit_price: unitPrice,
        line_total: lineTotal,
      };
      const { error } = await supabase.schema("project").from("survey_line_items").insert(payload);
      if (error) throw error;
      await refresh();
      setLineItemFormBySurvey((m) => ({
        ...m,
        [surveyId]: {
          zone: "",
          productBrand: "",
          productName: "",
          productSpec: "",
          quantity: "",
          unitPrice: "",
          cameraLabel: "",
        },
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add material item.";
      setErr(msg);
    }
  };

  const handleSubmitQuote = async (surveyId: string) => {
    setErr(null);
    try {
      const amount = Number(quoteAmountBySurvey[surveyId] || 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Final quote amount must be > 0.");
      }
      const notes = reportNotesBySurvey[surveyId] || "";
      const { error } = await supabase
        .schema("project")
        .from("surveys")
        .update({
          final_quote_amount: amount,
          report_notes: notes,
          final_quote_submitted_at: new Date().toISOString(),
        })
        .eq("id", surveyId);
      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit final quote.";
      setErr(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vendor</h1>
        <p className="text-sm text-slate-400">
          Survey queue and execution: schedule + survey fee → system generates a survey invoice → wait for finance to
          mark paid → upload artifacts, define cameras (C1/C2…), list materials, and submit quote.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-200 text-sm">Survey execution checklist</div>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Before visiting site: schedule survey date/time and enter survey fee. System will create a survey invoice.</li>
          <li>
            Vendor can only start execution once finance has marked the survey invoice as{" "}
            <span className="font-semibold text-emerald-300">paid</span>.
          </li>
          <li>During/after survey: upload artifacts, define camera points (C1, C2, …), and fill materials with qty/price.</li>
          <li>Finally submit the overall quote amount and survey report notes.</li>
        </ul>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : workOrders.length === 0 ? (
        <div className="text-sm text-slate-400">No survey work orders assigned to your vendor yet.</div>
      ) : (
        <div className="space-y-4">
          {workOrders.map((wo) => {
            const s = surveyByWorkOrder.get(wo.id);
            const surveyId = s?.id;
            const surveyArtifacts = surveyId ? artifactsBySurvey.get(surveyId) ?? [] : [];
            const surveyCameras = surveyId ? camerasBySurvey.get(surveyId) ?? [] : [];
            const surveyLineItems = surveyId ? lineItemsBySurvey.get(surveyId) ?? [] : [];

            return (
              <div key={wo.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-xs text-slate-500">{wo.code}</div>
                    <div className="text-sm font-semibold text-slate-100">
                      Survey status: <span className="text-slate-300">{s?.status || "open"}</span>
                    </div>
                    {s?.status === "waiting_payment" && (
                      <div className="text-xs text-amber-300 mt-1">
                        Waiting for finance to confirm payment on the survey invoice. Execution steps are disabled.
                      </div>
                    )}
                    {s?.status === "ready_for_execution" && (
                      <div className="text-xs text-emerald-300 mt-1">
                        Invoice paid. You can now upload artifacts, define cameras, add materials, and submit quote.
                      </div>
                    )}
                  </div>
                </div>

                {!s ? (
                  <div className="text-sm text-amber-300">
                    Survey record missing for this work order. Ask admin/sales to create `project.surveys`.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <div className="text-xs text-slate-500 mb-1">Schedule date/time</div>
                        <input
                          type="datetime-local"
                          value={scheduledAtBySurvey[s.id] ?? (s.scheduled_at ? s.scheduled_at.slice(0, 16) : "")}
                          onChange={(e) =>
                            setScheduledAtBySurvey((m) => ({ ...m, [s.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                          disabled={s.status !== "open" && s.status !== "price_submitted"}
                        />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Survey fee (IDR)</div>
                        <input
                          type="number"
                          value={priceBySurvey[s.id] ?? (s.pre_survey_price ?? "")}
                          onChange={(e) => setPriceBySurvey((m) => ({ ...m, [s.id]: e.target.value }))}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                          placeholder="e.g. 350000"
                          disabled={s.status !== "open" && s.status !== "price_submitted"}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => proposeScheduleAndPrice(s.id)}
                      disabled={s.status !== "open" && s.status !== "price_submitted"}
                      className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 px-4 py-2 text-white text-sm font-semibold"
                    >
                      Submit schedule + survey fee
                    </button>

                    {surveyId && (
                      <div className="mt-4 space-y-4">
                        <section className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-100">Survey artifacts (maps & sketches)</h2>
                            <span className="text-[11px] text-slate-500">
                              Accepted: JPG, PNG, PDF. Max 2 MB per file.
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Upload floorplans or sketches where C1/C2 markers are visible. For now, paste the file URL
                            from storage; upload tooling can be added later.
                          </p>
                          {surveyArtifacts.length === 0 ? (
                            <div className="text-xs text-slate-500">No artifacts uploaded yet.</div>
                          ) : (
                            <ul className="text-xs text-slate-300 space-y-1">
                              {surveyArtifacts.map((a) => (
                                <li key={a.id} className="flex items-center justify-between gap-2">
                                  <div>
                                    <span className="font-mono uppercase text-slate-400 mr-1">{a.kind}</span>
                                    {a.label && <span className="font-semibold">{a.label}</span>}
                                    {a.notes && <span className="ml-1 text-slate-400">– {a.notes}</span>}
                                  </div>
                                  <a
                                    href={a.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-sky-300 hover:underline"
                                  >
                                    Open file
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                            <select
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={artifactFormBySurvey[surveyId]?.kind ?? "overall"}
                              onChange={(e) =>
                                setArtifactFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    kind: e.target.value as NewArtifactForm["kind"],
                                    label: m[surveyId]?.label ?? "",
                                    fileUrl: m[surveyId]?.fileUrl ?? "",
                                    notes: m[surveyId]?.notes ?? "",
                                  },
                                }))
                              }
                            >
                              <option value="overall">Overall</option>
                              <option value="zone">Zone</option>
                              <option value="detail">Detail</option>
                              <option value="other">Other</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Label (optional)"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={artifactFormBySurvey[surveyId]?.label ?? ""}
                              onChange={(e) =>
                                setArtifactFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    kind: m[surveyId]?.kind ?? "overall",
                                    label: e.target.value,
                                    fileUrl: m[surveyId]?.fileUrl ?? "",
                                    notes: m[surveyId]?.notes ?? "",
                                  },
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="File URL (required)"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={artifactFormBySurvey[surveyId]?.fileUrl ?? ""}
                              onChange={(e) =>
                                setArtifactFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    kind: m[surveyId]?.kind ?? "overall",
                                    label: m[surveyId]?.label ?? "",
                                    fileUrl: e.target.value,
                                    notes: m[surveyId]?.notes ?? "",
                                  },
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={artifactFormBySurvey[surveyId]?.notes ?? ""}
                              onChange={(e) =>
                                setArtifactFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    kind: m[surveyId]?.kind ?? "overall",
                                    label: m[surveyId]?.label ?? "",
                                    fileUrl: m[surveyId]?.fileUrl ?? "",
                                    notes: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddArtifact(surveyId)}
                            className="mt-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-100 font-semibold"
                            disabled={s.status === "waiting_payment"}
                          >
                            Add artifact
                          </button>
                        </section>

                        <section className="space-y-2">
                          <h2 className="text-sm font-semibold text-slate-100">Camera points (C1, C2, …)</h2>
                          <p className="text-xs text-slate-500">
                            Start with C1 and add more cameras as needed. Labels follow C1, C2, C3… and cannot be
                            changed once created.
                          </p>
                          {surveyCameras.length === 0 ? (
                            <div className="text-xs text-slate-500">No cameras defined yet.</div>
                          ) : (
                            <ul className="text-xs text-slate-300 space-y-1">
                              {surveyCameras.map((c) => (
                                <li key={c.id}>
                                  <span className="font-mono font-semibold mr-1">{c.label}</span>
                                  {c.zone && <span className="mr-1 text-slate-400">[{c.zone}]</span>}
                                  {c.notes && <span className="text-slate-400">– {c.notes}</span>}
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Zone (optional)"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={cameraFormBySurvey[surveyId]?.zone ?? ""}
                              onChange={(e) =>
                                setCameraFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    zone: e.target.value,
                                    notes: m[surveyId]?.notes ?? "",
                                  },
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={cameraFormBySurvey[surveyId]?.notes ?? ""}
                              onChange={(e) =>
                                setCameraFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    zone: m[surveyId]?.zone ?? "",
                                    notes: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddCamera(surveyId)}
                            className="mt-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-100 font-semibold"
                            disabled={s.status === "waiting_payment"}
                          >
                            {surveyCameras.length === 0 ? "Create C1" : "Add next camera"}
                          </button>
                        </section>

                        <section className="space-y-2">
                          <h2 className="text-sm font-semibold text-slate-100">Materials needed</h2>
                          <p className="text-xs text-slate-500">
                            Add items with quantity and optional unit price. You can link each item to a camera label or
                            leave it for zone-level items.
                          </p>
                          {surveyLineItems.length === 0 ? (
                            <div className="text-xs text-slate-500">No materials added yet.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-[11px] text-left text-slate-300">
                                <thead>
                                  <tr className="border-b border-slate-800 text-slate-400">
                                    <th className="py-1 pr-2">Camera</th>
                                    <th className="py-1 pr-2">Zone</th>
                                    <th className="py-1 pr-2">Item</th>
                                    <th className="py-1 pr-2 text-right">Qty</th>
                                    <th className="py-1 pr-2 text-right">Unit price</th>
                                    <th className="py-1 pr-2 text-right">Line total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {surveyLineItems.map((li) => (
                                    <tr key={li.id} className="border-b border-slate-900 last:border-0">
                                      <td className="py-1 pr-2">{li.camera_label || "-"}</td>
                                      <td className="py-1 pr-2">{li.zone || "-"}</td>
                                      <td className="py-1 pr-2">
                                        {[li.product_brand, li.product_name, li.product_spec]
                                          .filter(Boolean)
                                          .join(" ")}
                                      </td>
                                      <td className="py-1 pr-2 text-right">{li.quantity}</td>
                                      <td className="py-1 pr-2 text-right">
                                        {li.unit_price != null ? li.unit_price.toLocaleString() : "-"}
                                      </td>
                                      <td className="py-1 pr-2 text-right">
                                        {li.line_total != null ? li.line_total.toLocaleString() : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="mt-2 grid grid-cols-1 md:grid-cols-6 gap-2">
                            <select
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.cameraLabel ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    cameraLabel: e.target.value,
                                  },
                                }))
                              }
                            >
                              <option value="">No camera</option>
                              {surveyCameras.map((c) => (
                                <option key={c.id} value={c.label}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Zone"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.zone ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    zone: e.target.value,
                                  },
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Brand"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.productBrand ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    productBrand: e.target.value,
                                  },
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Product name"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.productName ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    productName: e.target.value,
                                  },
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Spec / notes"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.productSpec ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    productSpec: e.target.value,
                                  },
                                }))
                              }
                            />
                            <input
                              type="number"
                              placeholder="Qty"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.quantity ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    quantity: e.target.value,
                                  },
                                }))
                              }
                            />
                            <input
                              type="number"
                              placeholder="Unit price"
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200"
                              value={lineItemFormBySurvey[surveyId]?.unitPrice ?? ""}
                              onChange={(e) =>
                                setLineItemFormBySurvey((m) => ({
                                  ...m,
                                  [surveyId]: {
                                    ...(m[surveyId] ?? {
                                      zone: "",
                                      productBrand: "",
                                      productName: "",
                                      productSpec: "",
                                      quantity: "",
                                      unitPrice: "",
                                      cameraLabel: "",
                                    }),
                                    unitPrice: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddLineItem(surveyId)}
                            className="mt-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-100 font-semibold"
                            disabled={s.status === "waiting_payment"}
                          >
                            Add item
                          </button>
                        </section>

                        <section className="space-y-2">
                          <h2 className="text-sm font-semibold text-slate-100">Summary & quote</h2>
                          <p className="text-xs text-slate-500">
                            Enter the final quote amount for this survey and a short summary of your findings and
                            recommendations.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Final quote amount (IDR)</div>
                              <input
                                type="number"
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                                value={quoteAmountBySurvey[surveyId] ?? (s.final_quote_amount ?? "")}
                                onChange={(e) =>
                                  setQuoteAmountBySurvey((m) => ({ ...m, [surveyId]: e.target.value }))
                                }
                                placeholder="e.g. 15000000"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <div className="text-xs text-slate-500 mb-1">Survey report notes</div>
                              <textarea
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm min-h-[80px]"
                                value={reportNotesBySurvey[surveyId] ?? (s.report_notes ?? "")}
                                onChange={(e) =>
                                  setReportNotesBySurvey((m) => ({ ...m, [surveyId]: e.target.value }))
                                }
                                placeholder="Summarize camera positions, special constraints, and recommendations."
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSubmitQuote(surveyId)}
                            className="mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white text-sm font-semibold"
                          >
                            Submit final quote & report
                          </button>
                        </section>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

