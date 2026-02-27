"use client";

import { useState } from "react";

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

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_ORDERS = [
    { id: "1", code: "SO-20250210-0001", customer: "PT Maju Jaya", contact: "Budi S", phone: "0812-3456-7890", address: "Jl. Sudirman 12, Jakarta", site_type: "commercial", camera_est: 8, stage: "completed", invoice: { items: [{ desc: "IP Camera Outdoor", qty: 8, unit: 1200000 }, { desc: "NVR 8ch", qty: 1, unit: 3500000 }, { desc: "Labor", qty: 1, unit: 2000000 }], terms: "50% DP / 50% completion", cashier_note: "", pdf: true }, dp_cust: "dp_cust.jpg", dp_vendor: "dp_vendor.jpg", final_payment: true },
    { id: "2", code: "SO-20250215-0002", customer: "Toko Sukses Mandiri", contact: "Rina W", phone: "0821-9876-5432", address: "Ruko Blok C 5, Surabaya", site_type: "retail", camera_est: 4, stage: "in_progress", invoice: { items: [{ desc: "IP Camera Indoor", qty: 4, unit: 950000 }, { desc: "DVR 4ch", qty: 1, unit: 1800000 }, { desc: "Labor", qty: 1, unit: 1000000 }], terms: "50% DP / 50% completion", cashier_note: "", pdf: true }, dp_cust: "dp.jpg", dp_vendor: "vdp.jpg", final_payment: false },
    { id: "3", code: "SO-20250218-0003", customer: "Kantor CV Berkah", contact: "Dedi K", phone: "0857-1122-3344", address: "Jl. Pemuda 88, Bandung", site_type: "office", camera_est: 6, stage: "invoiced", invoice: { items: [{ desc: "IP Camera Mixed", qty: 6, unit: 1100000 }, { desc: "NVR 6ch", qty: 1, unit: 2800000 }, { desc: "Labor", qty: 1, unit: 1500000 }], terms: "50% DP / 50% completion", cashier_note: "", pdf: false }, dp_cust: null, dp_vendor: null, final_payment: false },
    { id: "4", code: "SO-20250222-0004", customer: "Gudang Logistik ABC", contact: "Slamet H", phone: "0878-5566-7788", address: "Kawasan Industri MM2100", site_type: "warehouse", camera_est: 14, stage: "finalized", invoice: null, dp_cust: null, dp_vendor: null, final_payment: false },
    { id: "5", code: "SO-20250226-0005", customer: "Apotek Sehat Selalu", contact: "Lilis P", phone: "0813-2233-4455", address: "Jl. Raya Bogor KM22, Depok", site_type: "retail", camera_est: 3, stage: "survey", invoice: null, dp_cust: null, dp_vendor: null, final_payment: false },
    { id: "6", code: "SO-20250227-0006", customer: "SMA Negeri 4", contact: "Pak Asep", phone: "0859-8877-6655", address: "Jl. Pendidikan 7, Bekasi", site_type: "education", camera_est: 10, stage: "inquiry", invoice: null, dp_cust: null, dp_vendor: null, final_payment: false },
];

const SEED_MAINT = [
    { id: "m1", code: "MW-20250220-0001", type: "maintenance", customer: "PT Maju Jaya", contact: "Budi S", phone: "0812-3456-7890", linked_so: "SO-20250210-0001", issue: "Camera 3 offline, no image since last week.", stage: "vendor_sent", notes: "Vendor scheduled 2025-03-03." },
    { id: "m2", code: "MW-20250225-0002", type: "guarantee", customer: "New Client", contact: "Hendra L", phone: "0811-2233-4455", linked_so: null, issue: "Existing DVR from other installer, wants check-up.", stage: "open", notes: "" },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StagePill({ stage }: { stage: string }) {
    const m = STAGE_META[stage] || { label: stage, color: "#64748B" };
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 4, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}33`, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{m.label}</span>;
}

function MaintPill({ stage }: { stage: string }) {
    const m = MAINT_STAGES[stage] || { label: stage, color: "#64748B" };
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 4, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}33`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</span>;
}

function Input({ label, value, onChange, type = "text", placeholder = "", disabled = false }: any) {
    return (
        <div>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
                style={{ width: "100%", background: disabled ? "#060912" : "#0F172A", border: "1px solid #1E293B", color: disabled ? "#334155" : "#E2E8F0", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", boxSizing: "border-box", cursor: disabled ? "not-allowed" : "auto" }} />
        </div>
    );
}

function Section({ title, color = "#64748B", children }: any) {
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
            background: disabled ? "#1E293B" : `linear-gradient(135deg,${color},${color}cc)`,
            color: disabled ? "#334155" : "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", transition: "opacity 0.15s",
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "flex-end" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 520, height: "100vh", overflowY: "auto",
                background: "#0B0F1A", borderLeft: "1px solid #1E293B",
                boxShadow: "-24px 0 64px rgba(0,0,0,0.6)",
            }}>
                {/* Header */}
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #0F172A", background: "#080C14", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#334155", marginBottom: 3 }}>{order.code}</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>{order.customer}</div>
                            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{order.contact} · {order.phone}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                            <button onClick={onClose} style={{ background: "#1E293B", border: "none", color: "#64748B", width: 28, height: 28, borderRadius: 7, cursor: "pointer", fontSize: 14 }}>✕</button>
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
                                <div key={s} title={m.label} style={{ flex: 1, height: 3, borderRadius: 2, background: done || current ? m.color : "#1E293B", opacity: done ? 0.4 : current ? 1 : 0.2 }} />
                            );
                        })}
                    </div>
                </div>

                <div style={{ padding: "20px 22px" }}>

                    {/* ORDER INFO */}
                    <Section title="Order Info" color="#60A5FA">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[["Address", order.address], ["Site Type", order.site_type], ["Est. Cameras", `${order.camera_est} units`]].map(([l, v]) => (
                                <div key={l} style={{ background: "#060912", border: "1px solid #1E293B", borderRadius: 8, padding: "8px 12px" }}>
                                    <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{l}</div>
                                    <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "capitalize" }}>{v as string}</div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── CASHIER SECTION ── */}
                    {(role === "cashier" || role === "sales") && (stage === "finalized" || stage === "invoiced" || stage === "dp_confirmed" || stage === "in_progress" || stage === "completed") && (
                        <Section title="Platform Invoice" color="#FBBF24">
                            {/* Line items */}
                            <div style={{ background: "#060912", border: "1px solid #1E293B", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #0F172A", background: "#04060D" }}>
                                    {["Description", "Qty", "Unit Price", "Total"].map(h => <span key={h} style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>)}
                                </div>
                                {inv.items.map((item: any, i: number) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #0F172A", gap: 6, alignItems: "center" }}>
                                        <input value={item.desc} onChange={e => setItem(i, "desc", e.target.value)} disabled={role !== "cashier"}
                                            style={{ background: "transparent", border: "none", color: "#CBD5E1", fontSize: 12, outline: "none", width: "100%" }} placeholder="Item description" />
                                        <input type="number" value={item.qty} onChange={e => setItem(i, "qty", e.target.value)} disabled={role !== "cashier"}
                                            style={{ background: "transparent", border: "none", color: "#CBD5E1", fontSize: 12, outline: "none", width: "100%", textAlign: "center" }} />
                                        <input type="number" value={item.unit} onChange={e => setItem(i, "unit", e.target.value)} disabled={role !== "cashier"}
                                            style={{ background: "transparent", border: "none", color: "#CBD5E1", fontSize: 12, outline: "none", width: "100%" }} placeholder="0" />
                                        <span style={{ fontSize: 12, color: "#FBBF24", fontWeight: 600 }}>{fmtShort(item.qty * item.unit)}</span>
                                    </div>
                                ))}
                                <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#04060D" }}>
                                    {role === "cashier" && <button onClick={addItem} style={{ fontSize: 11, color: "#FBBF24", background: "none", border: "none", cursor: "pointer" }}>+ Add item</button>}
                                    <div style={{ marginLeft: "auto", fontSize: 13, color: "#FBBF24", fontWeight: 700 }}>Total: {fmt(total)}</div>
                                </div>
                            </div>
                            {/* DP summary */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                <div style={{ background: "#0A0D18", border: "1px solid #FBBF2422", borderRadius: 8, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 9, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Down Payment (50%)</div>
                                    <div style={{ fontSize: 14, color: "#FBBF24", fontWeight: 700 }}>{fmt(dpAmount)}</div>
                                </div>
                                <div style={{ background: "#0A0D18", border: "1px solid #FBBF2422", borderRadius: 8, padding: "10px 12px" }}>
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
                                        <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{label}</div>
                                        <div style={{
                                            background: val ? "#052e16" : "#060912", border: `1px solid ${val ? color + "44" : "#1E293B"}`,
                                            borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 11,
                                            color: val ? color : "#334155",
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
                            <div style={{ fontSize: 10, color: "#1E293B", marginTop: 6 }}>Some transitions are automatic (triggered by Cashier or Vendor actions).</div>
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
                {(role === "sales" || role === "cs") && <button onClick={() => setShowForm(s => !s)} style={{ background: "#1E293B", border: "none", color: "#A78BFA", padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>+ New Ticket</button>}
            </div>

            {showForm && (
                <div style={{ background: "#0D1117", border: "1px solid #A78BFA33", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <Input label="Customer" value={form.customer} onChange={set("customer")} placeholder="Company / Name" />
                        <Input label="Contact" value={form.contact} onChange={set("contact")} placeholder="Person" />
                        <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="0812-XXXX" />
                        <div>
                            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Type</div>
                            <select value={form.type} onChange={e => set("type")(e.target.value)} style={{ width: "100%", background: "#0F172A", border: "1px solid #1E293B", color: "#E2E8F0", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                                <option value="maintenance">Maintenance</option>
                                <option value="guarantee">Guarantee Claim</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Link to Existing SO (Recurring)</div>
                        <select value={form.linked_so} onChange={e => set("linked_so")(e.target.value)} style={{ width: "100%", background: "#0F172A", border: "1px solid #1E293B", color: "#E2E8F0", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                            <option value="">— New customer (no prior SO) —</option>
                            {orders.map((o: any) => <option key={o.id} value={o.code}>{o.code} · {o.customer}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Issue Description</div>
                        <textarea value={form.issue} onChange={e => set("issue")(e.target.value)} rows={3}
                            style={{ width: "100%", background: "#0F172A", border: "1px solid #1E293B", color: "#E2E8F0", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", resize: "vertical" }}
                            placeholder="Describe the problem..." />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #1E293B", color: "#475569", padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                        <ActionBtn label="Create Ticket →" onClick={submit} color="#A78BFA" />
                    </div>
                </div>
            )}

            {tickets.map((t: any) => (
                <div key={t.id} style={{ background: "#0D1117", border: `1px solid ${MAINT_STAGES[t.stage]?.color + "33" || "#1E293B"}`, borderLeft: `3px solid ${MAINT_STAGES[t.stage]?.color || "#A78BFA"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#334155", marginBottom: 2 }}>{t.code}</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9" }}>{t.customer}</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>{t.contact} · {t.phone}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                            <MaintPill stage={t.stage} />
                            <span style={{ fontSize: 10, color: "#334155", background: "#0A0A10", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>{t.type}</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, lineHeight: 1.5 }}>{t.issue}</div>
                    {t.linked_so && <div style={{ fontSize: 10, color: "#475569" }}>Linked: <span style={{ color: "#60A5FA", fontFamily: "'Courier New',monospace" }}>{t.linked_so}</span></div>}
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
    const [newForm, setNewForm] = useState({ customer: "", contact: "", phone: "", address: "", site_type: "commercial", camera_est: "", requirements: "" });

    const tabs = TOP_TABS[role];

    const setNF = (k: string) => (v: any) => setNewForm(f => ({ ...f, [k]: v }));

    const submitNew = () => {
        if (!newForm.customer || !newForm.contact || !newForm.phone) return;
        const o = { id: Date.now().toString(), code: genCode("SO", orders), ...newForm, camera_est: parseInt(newForm.camera_est) || 1, stage: "inquiry", invoice: null, dp_cust: null, dp_vendor: null, final_payment: false };
        setOrders(os => [o, ...os]);
        setShowForm(false);
        setNewForm({ customer: "", contact: "", phone: "", address: "", site_type: "commercial", camera_est: "", requirements: "" });
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
    const roleColor = ROLES[role].color;

    return (
        <div style={{ minHeight: "100vh", background: "#060912", fontFamily: "'DM Mono','Courier New',monospace", color: "#E2E8F0" }}>
            <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080C14}::-webkit-scrollbar-thumb{background:#1E293B;border-radius:3px}
      `}</style>

            {/* Header */}
            <div style={{ background: "#080C14", borderBottom: "1px solid #0F172A", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${roleColor},${roleColor}99)`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ROLES[role].icon}</div>
                    <div>
                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
                            Sales Hub <span style={{ color: roleColor, marginLeft: 6 }}>· {ROLES[role].label}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#1E293B", letterSpacing: "0.09em" }}>SALES.YOURDOMAIN.COM</div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {/* Role switcher */}
                    <div style={{ display: "flex", gap: 2, background: "#0F172A", padding: 3, borderRadius: 9, border: "1px solid #1E293B" }}>
                        {Object.entries(ROLES).map(([k, v]: any) => (
                            <button key={k} onClick={() => { setRole(k); setTab(TOP_TABS[k][0]); }} style={{
                                padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                background: role === k ? v.color : "transparent",
                                color: role === k ? "#060912" : "#475569", transition: "all 0.15s",
                            }}>{v.icon} {v.label}</button>
                        ))}
                    </div>
                    {role === "sales" && tab === "Pipeline" && (
                        <>
                            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                                style={{ background: "#0F172A", border: "1px solid #1E293B", color: "#CBD5E1", borderRadius: 8, padding: "7px 13px", fontSize: 12, outline: "none", width: 180 }} />
                            <button onClick={() => setShowForm(true)} style={{ background: `linear-gradient(135deg,${roleColor},${roleColor}99)`, border: "none", color: "#060912", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>+ New Inquiry</button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #0F172A", background: "#060912" }}>
                {tabs.map((t: string) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: "10px 22px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === t ? roleColor : "transparent"}`,
                        color: tab === t ? roleColor : "#334155", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.04em",
                    }}>{t}</button>
                ))}
            </div>

            {/* Stats strip (pipeline only) */}
            {tab === "Pipeline" && (
                <div style={{ display: "flex", overflowX: "auto", background: "#04060D", borderBottom: "1px solid #0B0F1A" }}>
                    {stats.map((s: any) => (
                        <div key={s.id} style={{ flex: "0 0 auto", padding: "8px 18px", borderRight: "1px solid #0B0F1A", minWidth: 110 }}>
                            <div style={{ fontSize: 8, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: s.color }}>{s.count}</div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

                {/* PIPELINE TAB */}
                {tab === "Pipeline" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, minHeight: 500, border: "1px solid #0F172A", borderRadius: 12, overflow: "hidden" }}>
                        {STAGE_FLOW.map(stage => {
                            const m = STAGE_META[stage];
                            const items = filtered.filter(o => o.stage === stage && (role !== "cashier" || ["finalized", "invoiced", "dp_confirmed", "in_progress", "completed"].includes(o.stage)));
                            return (
                                <div key={stage} style={{ borderRight: "1px solid #0B1020", display: "flex", flexDirection: "column" }}>
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
                                                background: "#0D1117", border: `1px solid #1E293B`, borderRadius: 8, padding: "10px",
                                                marginBottom: 8, cursor: "pointer", transition: "border-color 0.15s, transform 0.1s",
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "66"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E293B"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: "#334155", marginBottom: 3 }}>{o.code}</div>
                                                <div style={{ fontWeight: 700, fontSize: 12, color: "#E2E8F0", marginBottom: 2 }}>{o.customer}</div>
                                                <div style={{ fontSize: 10, color: "#475569" }}>📷 {o.camera_est}</div>
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
                            <div key={o.id} onClick={() => setSelected(o)} style={{
                                background: "#0D1117", border: "1px solid #1E293B", borderLeft: `3px solid ${STAGE_META[o.stage].color}`,
                                borderRadius: 10, padding: "14px 18px", marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <div>
                                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#334155", marginBottom: 3 }}>{o.code}</div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9" }}>{o.customer}</div>
                                    <div style={{ fontSize: 11, color: "#64748B" }}>{o.camera_est} cameras · {o.site_type}</div>
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
                                <div style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.09em", margin: "16px 0 10px" }}>Processed</div>
                                {cashierQueue.filter(o => !["finalized", "invoiced"].includes(o.stage)).map(o => (
                                    <div key={o.id} onClick={() => setSelected(o)} style={{
                                        background: "#0A0C14", border: "1px solid #0F172A", borderRadius: 10, padding: "12px 18px", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                                    }}>
                                        <div>
                                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#1E293B", marginBottom: 2 }}>{o.code}</div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>{o.customer}</div>
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
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowForm(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#0B0F1A", border: "1px solid #1E293B", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 64px rgba(0,0,0,0.7)" }}>
                        <div style={{ padding: "16px 22px", borderBottom: "1px solid #0F172A", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: roleColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>● New Sales Inquiry</span>
                            <button onClick={() => setShowForm(false)} style={{ background: "#1E293B", border: "none", color: "#64748B", width: 26, height: 26, borderRadius: 6, cursor: "pointer" }}>✕</button>
                        </div>
                        <div style={{ padding: "18px 22px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                                <Input label="Customer / Company" value={newForm.customer} onChange={setNF("customer")} placeholder="PT Maju Jaya" />
                                <Input label="Contact Person" value={newForm.contact} onChange={setNF("contact")} placeholder="Budi Santoso" />
                                <Input label="Phone / WA" value={newForm.phone} onChange={setNF("phone")} placeholder="0812-XXXX" />
                                <Input label="Est. Camera Count" value={newForm.camera_est} onChange={setNF("camera_est")} placeholder="6" type="number" />
                            </div>
                            <div style={{ marginBottom: 10 }}><Input label="Site Address" value={newForm.address} onChange={setNF("address")} placeholder="Jl. Sudirman No. 12, Jakarta" /></div>
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Site Type</div>
                                <select value={newForm.site_type} onChange={e => setNF("site_type")(e.target.value)} style={{ width: "100%", background: "#0F172A", border: "1px solid #1E293B", color: "#E2E8F0", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none" }}>
                                    {["residential", "commercial", "retail", "office", "industrial", "warehouse", "education"].map(t => <option key={t} value={t} style={{ background: "#0F172A" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Requirements</div>
                                <textarea rows={3} value={newForm.requirements} onChange={e => setNF("requirements")(e.target.value)}
                                    style={{ width: "100%", background: "#0F172A", border: "1px solid #1E293B", color: "#E2E8F0", borderRadius: 7, padding: "8px 11px", fontSize: 12, outline: "none", resize: "vertical" }}
                                    placeholder="Camera types, coverage areas, special needs..." />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #1E293B", color: "#475569", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                                <ActionBtn label="Create SO →" onClick={submitNew} color={roleColor} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-in */}
            {selected && <OrderDetail order={selected} role={role} onUpdate={updateOrder} onClose={() => setSelected(null)} />}
        </div>
    );
}
