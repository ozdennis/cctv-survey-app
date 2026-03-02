"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import SharedCalendar from "@/components/SharedCalendar";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLES = {
    sales: { label: "Sales", color: "#60A5FA", icon: "📋" },
    cashier: { label: "Cashier", color: "#FBBF24", icon: "💰" },
    cs: { label: "Customer Support", color: "#A78BFA", icon: "🎧" },
};

const STAGE_FLOW = ["inquiry", "survey", "finalized", "invoiced", "dp_confirmed", "in_progress", "completed"];
const STAGE_META: any = {
    inquiry: { label: "New Inquiry", color: "#60A5FA", role: "sales" },
    survey: { label: "Survey", color: "#F59E0B", role: "sales" },
    finalized: { label: "Survey Done", color: "#A78BFA", role: "cashier" },
    invoiced: { label: "Invoice Sent", color: "#F472B6", role: "cashier" },
    dp_confirmed: { label: "DP Confirmed", color: "#FB923C", role: "sales" },
    in_progress: { label: "In Progress", color: "#34D399", role: "sales" },
    completed: { label: "Completed", color: "#4ADE80", role: "cashier" },
};

const MAINT_STAGES: any = {
    open: { label: "Open", color: "#A78BFA" },
    vendor_sent: { label: "Vendor Sent", color: "#F59E0B" },
    in_progress: { label: "In Progress", color: "#60A5FA" },
    resolved: { label: "Resolved", color: "#34D399" },
};

function genCode(prefix: string, list: any[]) {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const n = (list.filter(x => x.code?.startsWith(`${prefix}-${d}`)).length + 1).toString().padStart(4, "0");
    return `${prefix}-${d}-${n}`;
}

const fmt = (n: number) => "Rp " + Number(n).toLocaleString("id-ID");

// ─── INIT DATA ────────────────────────────────────────────────────────────────
const SEED_ORDERS: any[] = [];
const SEED_MAINT: any[] = [];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StagePill({ stage }: { stage: string }) {
    const m = STAGE_META[stage] || { label: stage, color: "var(--portal-muted-dark)" };
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 4, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}33`, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{m.label}</span>;
}

function MaintPill({ stage }: { stage: string }) {
    const m = MAINT_STAGES[stage] || { label: stage, color: "var(--portal-muted-dark)" };
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 4, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}33`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</span>;
}

function Input({ label, value, onChange, type = "text", placeholder = "", disabled = false }: any) {
    return (
        <div>
            <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
                style={{ width: "100%", background: disabled ? "var(--portal-inner)" : "var(--portal-border-dark)", border: "1px solid #1E293B", color: disabled ? "var(--portal-faint)" : "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", boxSizing: "border-box", cursor: disabled ? "not-allowed" : "auto" }} />
        </div>
    );
}

function Section({ title, color = "var(--portal-muted-dark)", children }: any) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 2, height: 12, background: color, borderRadius: 1 }} /> {title}
            </div>
            {children}
        </div>
    );
}

function ActionBtn({ label, onClick, color = "#3B82F6", disabled = false, full = false }: any) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            padding: "9px 16px", width: full ? "100%" : "auto", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
            background: disabled ? "var(--portal-border)" : `linear-gradient(135deg,${color},${color}cc)`,
            color: disabled ? "var(--portal-faint)" : "var(--portal-bg-inverse)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", transition: "opacity 0.15s",
        }}>{label}</button>
    );
}

// ─── ORDER DETAIL PANEL ───────────────────────────────────────────────────────
function OrderDetail({ order, role, onUpdate, onClose }: any) {
    const [inv, setInv] = useState(order.invoice || { items: [{ desc: "", qty: 1, unit: 0 }], terms: "50% DP / 50% completion", cashier_note: "", pdf: false });
    const [dpCust, setDpCust] = useState(order.dp_cust || "");
    const [dpVend, setDpVend] = useState(order.dp_vendor || "");
    const [finalPay, setFinalPay] = useState(order.final_payment || false);
    const [stage, setStage] = useState(order.stage);

    const total = inv.items.reduce((s: number, i: any) => s + (i.qty * i.unit), 0);
    const dpAmount = Math.round(total * 0.5);
    const dpGate = dpCust && dpVend;

    const save = (patch: any) => { onUpdate({ ...order, ...patch }); };

    const advanceStage = (to: string) => { setStage(to); save({ stage: to }); };

    const addItem = () => setInv((v: any) => ({ ...v, items: [...v.items, { desc: "", qty: 1, unit: 0 }] }));
    const setItem = (i: number, k: string, v: any) => setInv((old: any) => ({ ...old, items: old.items.map((it: any, idx: number) => idx === i ? { ...it, [k]: k === "qty" || k === "unit" ? Number(v) : v } : it) }));

    return (
        <div style={{ position: "fixed", inset: 0, background: "var(--portal-overlay)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "flex-end" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 520, height: "100vh", overflowY: "auto",
                background: "var(--portal-surface)", borderLeft: "1px solid #1E293B",
                boxShadow: "-24px 0 64px rgba(0,0,0,0.6)",
            }}>
                {/* Header */}
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #0F172A", background: "var(--portal-header)", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "var(--portal-faint)", marginBottom: 3 }}>{order.code}</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "var(--portal-text)" }}>{order.customer}</div>
                            <div style={{ fontSize: 11, color: "var(--portal-faint)", marginTop: 2 }}>{order.contact} · {order.phone}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                            <button onClick={onClose} style={{ background: "var(--portal-border)", border: "none", color: "var(--portal-muted-dark)", width: 28, height: 28, borderRadius: 7, cursor: "pointer", fontSize: 14 }}>✕</button>
                            <StagePill stage={stage} />
                        </div>
                    </div>
                    {/* Stage progress bar */}
                    <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
                        {STAGE_FLOW.map((s, i) => {
                            const idx = STAGE_FLOW.indexOf(stage);
                            const done = i < idx; const current = i === idx;
                            const m = STAGE_META[s];
                            return (
                                <div key={s} title={m.label} style={{ flex: 1, height: 3, borderRadius: 2, background: done || current ? m.color : "var(--portal-border)", opacity: done ? 0.4 : current ? 1 : 0.2 }} />
                            );
                        })}
                    </div>
                </div>

                <div style={{ padding: "20px 22px" }}>

                    {/* ORDER INFO */}
                    <Section title="Order Info" color="#60A5FA">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[["Address", order.address], ["Site Type", order.site_type], ["Est. Cameras", `${order.camera_est} units`]].map(([l, v]) => (
                                <div key={l} style={{ background: "var(--portal-inner)", border: "1px solid #1E293B", borderRadius: 8, padding: "8px 12px" }}>
                                    <div style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{l}</div>
                                    <div style={{ fontSize: 12, color: "var(--portal-muted)", textTransform: "capitalize" }}>{v as string}</div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── CASHIER SECTION ── */}
                    {(role === "cashier" || role === "sales") && (stage === "finalized" || stage === "invoiced" || stage === "dp_confirmed" || stage === "in_progress" || stage === "completed") && (
                        <Section title="Platform Invoice" color="#FBBF24">
                            {/* Line items */}
                            <div style={{ background: "var(--portal-inner)", border: "1px solid #1E293B", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #0F172A", background: "var(--portal-inner)" }}>
                                    {["Description", "Qty", "Unit Price", "Total"].map(h => <span key={h} style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
                                </div>
                                {inv.items.map((item: any, i: number) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #0F172A", gap: 6, alignItems: "center" }}>
                                        <input value={item.desc} onChange={e => setItem(i, "desc", e.target.value)} disabled={role !== "cashier"}
                                            style={{ background: "transparent", border: "none", color: "var(--portal-text)", fontSize: 12, outline: "none", width: "100%" }} placeholder="Item description" />
                                        <input type="number" value={item.qty} onChange={e => setItem(i, "qty", e.target.value)} disabled={role !== "cashier"}
                                            style={{ background: "transparent", border: "none", color: "var(--portal-text)", fontSize: 12, outline: "none", width: "100%", textAlign: "center" }} />
                                        <input type="number" value={item.unit} onChange={e => setItem(i, "unit", e.target.value)} disabled={role !== "cashier"}
                                            style={{ background: "transparent", border: "none", color: "var(--portal-text)", fontSize: 12, outline: "none", width: "100%" }} placeholder="0" />
                                        <span style={{ fontSize: 12, color: "#FBBF24", fontWeight: 600 }}>{fmtShort(item.qty * item.unit)}</span>
                                    </div>
                                ))}
                                <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--portal-inner)" }}>
                                    {role === "cashier" && <button onClick={addItem} style={{ fontSize: 11, color: "#FBBF24", background: "none", border: "none", cursor: "pointer" }}>+ Add item</button>}
                                    <div style={{ marginLeft: "auto", fontSize: 13, color: "#FBBF24", fontWeight: 700 }}>Total: {fmt(total)}</div>
                                </div>
                            </div>
                            {/* DP summary */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                <div style={{ background: "var(--portal-inner)", border: "1px solid #FBBF2422", borderRadius: 8, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 9, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Down Payment (50%)</div>
                                    <div style={{ fontSize: 14, color: "#FBBF24", fontWeight: 700 }}>{fmt(dpAmount)}</div>
                                </div>
                                <div style={{ background: "var(--portal-inner)", border: "1px solid #FBBF2422", borderRadius: 8, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 9, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Final Payment (50%)</div>
                                    <div style={{ fontSize: 14, color: "#FBBF24", fontWeight: 700 }}>{fmt(dpAmount)}</div>
                                </div>
                            </div>
                            {role === "cashier" && (
                                <div style={{ marginBottom: 10 }}>
                                    <Input label="Cashier Note (internal)" value={inv.cashier_note} onChange={(v: any) => setInv((x: any) => ({ ...x, cashier_note: v }))} placeholder="e.g. adjusted cable qty per vendor revision" />
                                </div>
                            )}
                            {role === "cashier" && !inv.pdf && stage === "finalized" && (
                                <ActionBtn label="✓ Issue Platform Invoice PDF" color="#FBBF24"
                                    onClick={() => { const ni = { ...inv, pdf: true }; setInv(ni); advanceStage("invoiced"); save({ invoice: ni, stage: "invoiced" }); }} full />
                            )}
                            {inv.pdf && <div style={{ fontSize: 11, color: "#34D399", marginTop: 6 }}>✓ Platform Invoice PDF issued</div>}
                        </Section>
                    )}

                    {/* ── SALES: DP CONFIRMATION ── */}
                    {(role === "sales" || role === "cashier") && (stage === "invoiced" || stage === "dp_confirmed" || stage === "in_progress" || stage === "completed") && (
                        <Section title="Down Payment Verification" color="#FB923C">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                {[
                                    { label: "Customer DP Proof", val: dpCust, set: setDpCust, editable: role === "sales", color: "#34D399" },
                                    { label: "Vendor DP Proof", val: dpVend, set: setDpVend, editable: role === "cashier", color: "#FBBF24" },
                                ].map(({ label, val, set, editable, color }) => (
                                    <label key={label} style={{ display: "block", cursor: editable ? "pointer" : "default" }}>
                                        <div style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{label}</div>
                                        <div style={{
                                            background: val ? "#052e16" : "var(--portal-inner)", border: `1px solid ${val ? color + "44" : "var(--portal-border)"}`,
                                            borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 11,
                                            color: val ? color : "var(--portal-faint)",
                                        }}>
                                            {val ? `✓ ${val}` : editable ? "⬆ Click to upload" : "Pending"}
                                        </div>
                                        {editable && <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files && e.target.files[0]) { set(e.target.files[0].name); } }} />}
                                    </label>
                                ))}
                            </div>
                            {dpGate && stage === "invoiced" && role === "cashier" && (
                                <ActionBtn label="🔓 Confirm DP — Issue Work Order" color="#FB923C" full
                                    onClick={() => { advanceStage("dp_confirmed"); save({ dp_cust: dpCust, dp_vendor: dpVend, stage: "dp_confirmed" }); }} />
                            )}
                            {dpGate && <div style={{ fontSize: 11, color: "#34D399", marginTop: 6 }}>✓ Both proofs uploaded — Work Order unlocked for Vendor</div>}
                        </Section>
                    )}

                    {/* ── SALES: FINAL PAYMENT ── */}
                    {role === "sales" && (stage === "in_progress" || stage === "completed") && (
                        <Section title="Final Payment" color="#4ADE80">
                            {!finalPay ? (
                                <ActionBtn label="✓ Confirm Final Payment Received" color="#22C55E" full
                                    onClick={() => { setFinalPay(true); advanceStage("completed"); save({ final_payment: true, stage: "completed" }); }} />
                            ) : (
                                <div style={{ fontSize: 12, color: "#34D399", background: "#052e16", border: "1px solid #34D39933", borderRadius: 8, padding: "10px 14px" }}>
                                    ✓ Final payment confirmed. Job moved to portfolio.
                                </div>
                            )}
                        </Section>
                    )}

                    {/* ── STAGE MOVER (Sales only, limited actions) ── */}
                    {role === "sales" && (stage === "inquiry" || stage === "survey" || stage === "in_progress") && (
                        <Section title="Move Stage" color="#60A5FA">
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {stage === "inquiry" && <ActionBtn label="→ Mark Survey Scheduled" onClick={() => advanceStage("survey")} color="#F59E0B" />}
                                {stage === "survey" && <ActionBtn label="→ Survey Finalized (Vendor)" onClick={() => advanceStage("finalized")} color="#A78BFA" disabled />}
                                {stage === "in_progress" && <ActionBtn label="→ Mark In Progress" onClick={() => advanceStage("in_progress")} color="#34D399" disabled />}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--portal-border)", marginTop: 6 }}>Some transitions are automatic (triggered by Cashier or Vendor actions).</div>
                        </Section>
                    )}

                </div>
            </div>
        </div>
    );
}

function fmtShort(n: number) { return n >= 1e6 ? `${(n / 1e6).toFixed(1)}jt` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}rb` : String(n); }

// ─── MAINTENANCE PANEL ────────────────────────────────────────────────────────
function MaintPanel({ tickets, orders, role, onUpdate, onAdd }: any) {
    const [form, setForm] = useState({ customer: "", contact: "", phone: "", linked_so: "", issue: "", type: "maintenance" });
    const [showForm, setShowForm] = useState(false);
    const set = (k: string) => (v: any) => setForm(f => ({ ...f, [k]: v }));

    const submit = () => {
        if (!form.customer || !form.issue) return;
        onAdd({ id: `m${Date.now()}`, code: genCode("MW", [...tickets]), ...form, stage: "open", notes: "" });
        setForm({ customer: "", contact: "", phone: "", linked_so: "", issue: "", type: "maintenance" });
        setShowForm(false);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.09em" }}>● Maintenance & Guarantee Tickets</div>
                {(role === "sales" || role === "cs") && <button onClick={() => setShowForm(s => !s)} style={{ background: "var(--portal-border)", border: "none", color: "#A78BFA", padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>+ New Ticket</button>}
            </div>

            {showForm && (
                <div style={{ background: "var(--portal-surface)", border: "1px solid #A78BFA33", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <Input label="Customer" value={form.customer} onChange={set("customer")} placeholder="Company / Name" />
                        <Input label="Contact" value={form.contact} onChange={set("contact")} placeholder="Person" />
                        <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="0812-XXXX" />
                        <div>
                            <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Type</div>
                            <select value={form.type} onChange={e => set("type")(e.target.value)} style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                                <option value="maintenance">Maintenance</option>
                                <option value="guarantee">Guarantee Claim</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Link to Existing SO (Recurring)</div>
                        <select value={form.linked_so} onChange={e => set("linked_so")(e.target.value)} style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                            <option value="">— New customer (no prior SO) —</option>
                            {orders.map((o: any) => <option key={o.id} value={o.code}>{o.code} · {o.customer}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Issue Description</div>
                        <textarea value={form.issue} onChange={e => set("issue")(e.target.value)} rows={3}
                            style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", resize: "vertical" }}
                            placeholder="Describe the problem..." />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #1E293B", color: "var(--portal-faint)", padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                        <ActionBtn label="Create Ticket →" onClick={submit} color="#A78BFA" />
                    </div>
                </div>
            )}

            {tickets.map((t: any) => (
                <div key={t.id} style={{ background: "var(--portal-surface)", border: `1px solid ${MAINT_STAGES[t.stage]?.color + "33" || "var(--portal-border)"}`, borderLeft: `3px solid ${MAINT_STAGES[t.stage]?.color || "#A78BFA"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-faint)", marginBottom: 2 }}>{t.code}</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--portal-text)" }}>{t.customer}</div>
                            <div style={{ fontSize: 11, color: "var(--portal-muted-dark)" }}>{t.contact} · {t.phone}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                            <MaintPill stage={t.stage} />
                            <span style={{ fontSize: 10, color: "var(--portal-faint)", background: "var(--portal-inner)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>{t.type}</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--portal-muted-dark)", marginBottom: 8, lineHeight: 1.5 }}>{t.issue}</div>
                    {t.linked_so && <div style={{ fontSize: 10, color: "var(--portal-faint)" }}>Linked: <span style={{ color: "#60A5FA", fontFamily: "'Courier New',monospace" }}>{t.linked_so}</span></div>}
                    {role === "cs" && t.stage !== "resolved" && (
                        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {t.stage === "open" && <ActionBtn label="→ Send to Vendor" onClick={() => onUpdate({ ...t, stage: "vendor_sent" })} color="#F59E0B" />}
                            {t.stage === "vendor_sent" && <ActionBtn label="→ Mark In Progress" onClick={() => onUpdate({ ...t, stage: "in_progress" })} color="#60A5FA" />}
                            {t.stage === "in_progress" && <ActionBtn label="✓ Resolved" onClick={() => onUpdate({ ...t, stage: "resolved" })} color="#34D399" />}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TOP_TABS: any = {
    sales: ["Pipeline", "Maintenance"],
    cashier: ["Invoice Queue", "Maintenance"],
    cs: ["Maintenance", "Pipeline"],
};

export default function SalesHub() {
    const [role, setRole] = useState<"sales" | "cashier" | "cs">("sales");
    const [tab, setTab] = useState("Pipeline");
    const [orders, setOrders] = useState<any[]>(SEED_ORDERS);
    const [maint, setMaint] = useState(SEED_MAINT);
    const [selected, setSelected] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newForm, setNewForm] = useState({ customer: "", email: "", contact: "", phone: "", address: "", site_type: "commercial", camera_est: "", requirements: "" });
    const [accEmail, setAccEmail] = useState("");

    const fetchData = async () => {
        try {
            // Orders
            const res = await fetch("/api/orders");
            const j = await res.json();
            if (j.data) {
                setOrders(j.data.map((o: any) => ({
                    ...o,
                    customer: o.customers?.name || o.customer_id,
                    contact: o.customers?.contact || "N/A",
                    phone: o.customers?.phone || "",
                    address: o.customers?.address || "",
                    site_type: o.customers?.site_type || "commercial",
                    camera_est: o.camera_count_est || 0,
                    stage: o.status,
                    // In real apps, invoices/dp status are nested or joined
                    invoice: null, dp_cust: null, dp_vendor: null, final_payment: o.status === 'completed'
                })));
            }

            // Maint
            const mRes = await fetch("/api/maintenance");
            const mJ = await mRes.json();
            if (mJ.data) {
                setMaint(mJ.data.map((m: any) => ({
                    ...m,
                    customer: m.customers?.name || "Unknown",
                    linked_so: m.sales_orders?.code || null
                })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) {
                setAccEmail(data.user.email);
                let presumedRole: "sales" | "cashier" | "cs" = "sales";
                if (data.user.email.includes("cashier")) presumedRole = "cashier";
                if (data.user.email.includes("cs")) presumedRole = "cs";
                setRole(presumedRole);
            }
        });
        fetchData();
    }, []);

    const getAvatar = (email: string) => {
        if (!email) return "US";
        const parts = email.split("@");
        const name = parts[0].trim();
        if (name.length === 0) return "US";
        if (name.length === 1) return name.toUpperCase();
        return (name[0] + name[name.length - 1]).toUpperCase();
    };

    const tabs = TOP_TABS[role];

    const setNF = (k: string) => (v: any) => setNewForm(f => ({ ...f, [k]: v }));

    const submitNew = async () => {
        if (!newForm.customer || !newForm.phone) return;

        try {
            const payload = {
                customer: newForm.customer,
                email: newForm.email || `contact@${newForm.customer.replace(/ /g, "").toLowerCase()}.test`,
                phone: newForm.phone,
                address: newForm.address,
                site_type: newForm.site_type,
                camera_count_est: parseInt(newForm.camera_est) || 1,
                requirements: newForm.requirements
            };
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchData();
                setShowForm(false);
                setNewForm({ customer: "", email: "", contact: "", phone: "", address: "", site_type: "commercial", camera_est: "", requirements: "" });
            }
        } catch (e) { console.error(e); }
    };

    const updateOrder = (updated: any) => {
        setOrders(os => os.map(o => o.id === updated.id ? updated : o));
        setSelected(updated);
    };

    const filtered = orders.filter(o => !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase()));

    // Cashier sees only finalized+ stages
    const cashierQueue = filtered.filter(o => ["finalized", "invoiced", "dp_confirmed", "in_progress", "completed"].includes(o.stage));

    // Stats
    const stats = Object.entries(STAGE_META).map(([k, v]: any) => ({ ...v, id: k, count: orders.filter(o => o.stage === k).length }));
    const roleColor = ROLES[role] ? ROLES[role].color : "#60A5FA";

    const InquiryFormModal = () => (
        <div style={{ position: "fixed", inset: 0, background: "var(--portal-overlay)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="modal-content" style={{ background: "var(--portal-surface)", border: "1px solid #1E293B", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 24px 64px rgba(0,0,0,0.4)", overflow: "hidden" }}>
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #0F172A", background: "var(--portal-header)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: roleColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>● New Sales Inquiry</span>
                    <button onClick={() => setShowForm(false)} style={{ background: "var(--portal-border)", border: "none", color: "var(--portal-muted-dark)", width: 26, height: 26, borderRadius: 6, cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ padding: "18px 22px" }}>
                    <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <Input label="Customer / Company" value={newForm.customer} onChange={setNF("customer")} placeholder="PT Maju Jaya" />
                        <Input label="Corporate Email" value={newForm.email} onChange={setNF("email")} placeholder="procurement@majujaya.com" />
                        <Input label="Phone / WA" value={newForm.phone} onChange={setNF("phone")} placeholder="0812-XXXX" />
                        <Input label="Est. Camera Count" value={newForm.camera_est} onChange={setNF("camera_est")} placeholder="6" type="number" />
                    </div>
                    <div style={{ marginBottom: 10 }}><Input label="Site Address" value={newForm.address} onChange={setNF("address")} placeholder="Jl. Sudirman No. 12, Jakarta" /></div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Site Type</div>
                        <select value={newForm.site_type} onChange={e => setNF("site_type")(e.target.value)} style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                            {["residential", "commercial", "retail", "office", "industrial", "warehouse", "education"].map(t => <option key={t} value={t} style={{ background: "var(--portal-border-dark)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Requirements</div>
                        <textarea rows={3} value={newForm.requirements} onChange={e => setNF("requirements")(e.target.value)}
                            style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", resize: "vertical" }}
                            placeholder="Camera types, coverage areas, special needs..." />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #1E293B", color: "var(--portal-faint)", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                        <ActionBtn label="Create SO →" onClick={submitNew} color={roleColor} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex w-full min-h-screen">
            <div style={{ flex: 1, minHeight: "100vh", background: "var(--portal-bg)", fontFamily: "'DM Mono','Courier New',monospace", color: "var(--portal-text)" }}>
                <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080C14}::-webkit-scrollbar-thumb{background:#1E293B;border-radius:3px}
        @media (max-width: 768px) {
            .mobile-grid { grid-template-columns: 1fr !important; }
            .mobile-flex { flex-direction: column !important; align-items: stretch !important; }
            .mobile-header-stack { flex-direction: column !important; align-items: flex-start !important; }
            .pipeline-scroller { overflow-x: auto; display: flex; scroll-snap-type: x mandatory; }
            .pipeline-col { min-width: 85vw; scroll-snap-align: start; }
            .modal-content { max-width: 100% !important; height: 100vh !important; border-radius: 0 !important; }
        }
      `}</style>

                {/* Header */}
                <div className="mobile-header-stack" style={{ background: "var(--portal-bg)", borderBottom: "1px solid #1E293B", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${roleColor},${roleColor}99)`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ROLES[role].icon}</div>
                        <div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
                                SALES<span style={{ color: roleColor, marginLeft: 6 }}>// {ROLES[role].label.toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: 10, color: "var(--portal-muted-dark)", letterSpacing: "0.09em", marginTop: -2 }}>ENTERPRISE PORTAL</div>
                        </div>
                    </div>

                    <div className="mobile-flex" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <ThemeToggle />
                        {/* Role switcher */}
                        <div style={{ display: "flex", gap: 2, background: "var(--portal-border-dark)", padding: 3, borderRadius: 9, border: "1px solid #1E293B" }}>
                            {Object.entries(ROLES).map(([k, v]: any) => (
                                <button key={k} onClick={() => { setRole(k); setTab(TOP_TABS[k][0]); }} style={{
                                    padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                    background: role === k ? v.color : "transparent",
                                    color: role === k ? "var(--portal-inner)" : "var(--portal-faint)", transition: "all 0.15s",
                                }}>{v.icon} {v.label}</button>
                            ))}
                        </div>
                        {role === "sales" && tab === "Pipeline" && (
                            <>
                                <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 8, padding: "7px 13px", fontSize: 12, outline: "none", width: 180 }} />
                                <button onClick={() => setShowForm(true)} style={{ background: `linear-gradient(135deg,${roleColor},${roleColor}99)`, border: "none", color: "var(--portal-inner)", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>+ New Inquiry</button>
                            </>
                        )}
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--portal-border-dark)", border: `1px solid ${roleColor}`, color: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginLeft: 8 }} title={accEmail}>
                            {getAvatar(accEmail)}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #0F172A", background: "var(--portal-inner)" }}>
                    {tabs.map((t: string) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: "10px 22px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === t ? roleColor : "transparent"}`,
                            color: tab === t ? roleColor : "var(--portal-faint)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.04em",
                        }}>{t}</button>
                    ))}
                </div>

                {/* Stats strip (pipeline only) */}
                {tab === "Pipeline" && (
                    <div style={{ display: "flex", overflowX: "auto", background: "var(--portal-inner)", borderBottom: "1px solid #0B0F1A" }}>
                        {stats.map((s: any) => (
                            <div key={s.id} style={{ flex: "0 0 auto", padding: "8px 18px", borderRight: "1px solid #0B0F1A", minWidth: 110 }}>
                                <div style={{ fontSize: 8, color: "var(--portal-border)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: s.color }}>{s.count}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

                    {/* PIPELINE TAB */}
                    {tab === "Pipeline" && (
                        <div className="pipeline-scroller mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, minHeight: 500, border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden" }}>
                            {STAGE_FLOW.map(stage => {
                                const m = STAGE_META[stage];
                                const items = filtered.filter(o => o.stage === stage && (role !== "cashier" || ["finalized", "invoiced", "dp_confirmed", "in_progress", "completed"].includes(o.stage)));
                                return (
                                    <div key={stage} className="pipeline-col" style={{ borderRight: "1px solid #1E293B", display: "flex", flexDirection: "column", background: "var(--portal-inner)" }}>
                                        <div style={{ padding: "10px 10px 8px", background: `${m.color}0A`, borderBottom: `1px solid ${m.color}22`, flexShrink: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: 9, color: m.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{m.label}</span>
                                                <span style={{ fontSize: 11, color: m.color, fontWeight: 800 }}>{items.length}</span>
                                            </div>
                                            <div style={{ height: 2, background: m.color, borderRadius: 1, marginTop: 6, opacity: 0.4 }} />
                                        </div>
                                        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                                            {items.map(o => (
                                                <div key={o.id} onClick={() => setSelected(o)} style={{
                                                    background: "var(--portal-surface)", border: `1px solid var(--portal-border)`, borderRadius: 12, padding: "16px",
                                                    marginBottom: 10, cursor: "pointer", transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                                                    boxShadow: "0 2px 8px var(--portal-shadow)"
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "66"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px var(--portal-shadow)"; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--portal-border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px var(--portal-shadow)"; }}>
                                                    <div style={{ fontFamily: "var(--font-spacemono)", fontSize: 10, color: "var(--portal-faint)", marginBottom: 4 }}>{o.code}</div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--portal-text)", marginBottom: 4 }}>{o.customer}</div>
                                                    <div style={{ fontSize: 10, color: "var(--portal-faint)" }}>📷 {o.camera_est}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* CASHIER INVOICE QUEUE */}
                    {tab === "Invoice Queue" && (
                        <div>
                            <div style={{ fontSize: 10, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>Awaiting Cashier Action</div>
                            {cashierQueue.filter(o => ["finalized", "invoiced"].includes(o.stage)).map(o => (
                                <div key={o.id} onClick={() => setSelected(o)} className="glass-panel" style={{
                                    borderLeft: `3px solid ${STAGE_META[o.stage].color}`,
                                    borderRadius: 12, padding: "16px 20px", marginBottom: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}>
                                    <div>
                                        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-faint)", marginBottom: 3 }}>{o.code}</div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--portal-text)" }}>{o.customer}</div>
                                        <div style={{ fontSize: 11, color: "var(--portal-muted-dark)" }}>{o.camera_est} cameras · {o.site_type}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                        <StagePill stage={o.stage} />
                                        <span style={{ fontSize: 11, color: "#FBBF24" }}>
                                            {o.stage === "finalized" ? "→ Issue Invoice" : "→ Confirm DP"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {cashierQueue.filter(o => !["finalized", "invoiced"].includes(o.stage)).length > 0 && (
                                <>
                                    <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.09em", margin: "16px 0 10px" }}>Processed</div>
                                    {cashierQueue.filter(o => !["finalized", "invoiced"].includes(o.stage)).map(o => (
                                        <div key={o.id} onClick={() => setSelected(o)} style={{
                                            background: "var(--portal-inner)", border: "1px solid var(--portal-border)", borderRadius: 10, padding: "12px 18px", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                                        }}>
                                            <div>
                                                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-border)", marginBottom: 2 }}>{o.code}</div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--portal-faint)" }}>{o.customer}</div>
                                            </div>
                                            <StagePill stage={o.stage} />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* MAINTENANCE TAB */}
                    {tab === "Maintenance" && (
                        <MaintPanel tickets={maint} orders={orders} role={role}
                            onUpdate={(t: any) => setMaint(ms => ms.map(m => m.id === t.id ? t : m))}
                            onAdd={(t: any) => setMaint(ms => [t, ...ms])} />
                    )}
                </div>

                {/* New Inquiry Modal */}
                {showForm && (
                    <div style={{ position: "fixed", inset: 0, background: "var(--portal-overlay)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowForm(false)}>
                        <div onClick={e => e.stopPropagation()} style={{ background: "var(--portal-surface)", border: "1px solid #1E293B", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 64px rgba(0,0,0,0.7)" }}>
                            <div style={{ padding: "16px 22px", borderBottom: "1px solid #0F172A", display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 11, color: roleColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>● New Sales Inquiry</span>
                                <button onClick={() => setShowForm(false)} style={{ background: "var(--portal-border)", border: "none", color: "var(--portal-muted-dark)", width: 26, height: 26, borderRadius: 6, cursor: "pointer" }}>✕</button>
                            </div>
                            <div style={{ padding: "18px 22px" }}>
                                <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                                    <Input label="Customer / Company" value={newForm.customer} onChange={setNF("customer")} placeholder="PT Maju Jaya" />
                                    <Input label="Corporate Email" value={newForm.email} onChange={setNF("email")} placeholder="procurement@majujaya.com" />
                                    <Input label="Phone / WA" value={newForm.phone} onChange={setNF("phone")} placeholder="0812-XXXX" />
                                    <Input label="Est. Camera Count" value={newForm.camera_est} onChange={setNF("camera_est")} placeholder="6" type="number" />
                                </div>
                                <div style={{ marginBottom: 10 }}><Input label="Site Address" value={newForm.address} onChange={setNF("address")} placeholder="Jl. Sudirman No. 12, Jakarta" /></div>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Site Type</div>
                                    <select value={newForm.site_type} onChange={e => setNF("site_type")(e.target.value)} style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                                        {["residential", "commercial", "retail", "office", "industrial", "warehouse", "education"].map(t => <option key={t} value={t} style={{ background: "var(--portal-border-dark)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Requirements</div>
                                    <textarea rows={3} value={newForm.requirements} onChange={e => setNF("requirements")(e.target.value)}
                                        style={{ width: "100%", background: "var(--portal-border-dark)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", resize: "vertical" }}
                                        placeholder="Camera types, coverage areas, special needs..." />
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #1E293B", color: "var(--portal-faint)", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                                    <ActionBtn label="Create SO →" onClick={submitNew} color={roleColor} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showForm && <InquiryFormModal />}

                {/* Detail Slide-in */}
                {selected && <OrderDetail order={selected} role={role} onUpdate={updateOrder} onClose={() => setSelected(null)} />}
            </div>
            <SharedCalendar />
        </div>
    );
}
