"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import SharedCalendar from "@/components/SharedCalendar";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// ─── INIT DATA ────────────────────────────────────────────────────────────────
const VENDOR_NAME = "Partner Technician";
const SURVEY_QUEUE: any[] = [];
const WORK_ORDERS: any[] = [];
const SCHEDULE: any[] = [];

const fmt = (s: string) => s ? s.replace("T", " ").slice(0, 16) : "—";
const CHECKLIST_KEYS = ["quality", "nightvision", "recording", "remote", "demo"];
const CHECKLIST_LABELS: any = { quality: "Image Quality (Day)", nightvision: "Night Vision", recording: "Recording Active", remote: "Remote Access", demo: "Customer Demo" };

// ─── SURVEY CARD ──────────────────────────────────────────────────────────────
function SurveyCard({ survey, onSchedule }: any) {
    const [open, setOpen] = useState(false);
    const [dt, setDt] = useState(survey.schedule || "");
    const [cost, setCost] = useState("");
    const [saved, setSaved] = useState(!!survey.schedule);

    const canEdit = survey.edit_count < 2;

    const handleSave = () => {
        if (!dt) return;
        setSaved(true);
        onSchedule(survey.id, dt);
    };

    return (
        <div style={{ background: "var(--portal-surface)", border: "1px solid #1E293B", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => setOpen(o => !o)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                borderLeft: `3px solid ${saved ? "#34D399" : "#60A5FA"}`,
            }}>
                <div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-faint)", marginBottom: 3 }}>{survey.code}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--portal-text)" }}>{survey.customer}</div>
                    <div style={{ fontSize: 11, color: "var(--portal-muted-dark)", marginTop: 2 }}>📍 {survey.address}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 4, textTransform: "uppercase",
                        background: saved ? "#052e16" : "#0D1F35",
                        color: saved ? "#34D399" : "#60A5FA",
                        border: `1px solid ${saved ? "#34D39944" : "#60A5FA44"}`,
                    }}>{saved ? "Scheduled" : "Needs Schedule"}</span>
                    <span style={{ fontSize: 18, color: "var(--portal-faint)" }}>{open ? "▲" : "▼"}</span>
                </div>
            </div>

            {open && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #0F172A", background: "var(--portal-bg)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                        <div style={{ background: "var(--portal-surface)", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Site Type</div>
                            <div style={{ fontSize: 12, color: "var(--portal-muted)", textTransform: "capitalize" }}>{survey.site_type}</div>
                        </div>
                        <div style={{ background: "var(--portal-surface)", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Est. Cameras</div>
                            <div style={{ fontSize: 12, color: "var(--portal-muted)" }}>{survey.camera_est} units</div>
                        </div>
                        <div style={{ background: "var(--portal-surface)", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Edit Count</div>
                            <div style={{ fontSize: 12, color: survey.edit_count >= 2 ? "#F87171" : "var(--portal-muted)" }}>{survey.edit_count}/2 {survey.edit_count >= 2 ? "⚠ Admin only" : ""}</div>
                        </div>
                    </div>

                    {survey.requirements && (
                        <div style={{ background: "var(--portal-surface)", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "var(--portal-muted-dark)", lineHeight: 1.6 }}>
                            <span style={{ color: "var(--portal-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Requirements: </span>
                            {survey.requirements}
                        </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-muted-dark)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Survey Date & Time</div>
                        <input type="datetime-local" value={dt} onChange={e => setDt(e.target.value)}
                            disabled={!canEdit && saved}
                            style={{ background: "var(--portal-surface)", border: `1px solid ${canEdit ? "var(--portal-border)" : "var(--portal-border-dark)"}`, color: canEdit ? "var(--portal-text)" : "var(--portal-faint)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", width: "100%", cursor: canEdit ? "auto" : "not-allowed" }} />
                        {!canEdit && <div style={{ fontSize: 10, color: "#F87171", marginTop: 4 }}>⚠ Max edits reached. Contact Admin to reschedule.</div>}
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-muted-dark)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Estimated Survey Cost (Rp)</div>
                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 350000"
                            style={{ background: "var(--portal-surface)", border: "1px solid #1E293B", color: "var(--portal-text)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", width: "100%" }} />
                    </div>

                    <button onClick={handleSave} disabled={!canEdit || !dt}
                        style={{ width: "100%", padding: "10px 0", background: canEdit && dt ? "linear-gradient(135deg,#3B82F6,#1D4ED8)" : "var(--portal-border)", border: "none", color: canEdit && dt ? "var(--portal-bg-inverse)" : "var(--portal-faint)", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: canEdit && dt ? "pointer" : "not-allowed" }}>
                        {saved ? "Update Schedule" : "Confirm Schedule →"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── WORK ORDER CARD ──────────────────────────────────────────────────────────
function WorkOrderCard({ wo: initialWo }: any) {
    const [wo, setWo] = useState(initialWo);
    const [open, setOpen] = useState(false);
    const [activeCam, setActiveCam] = useState<number | null>(null);
    const [signedForm, setSignedForm] = useState(wo.signed_form);
    const [finalized, setFinalized] = useState(wo.finalized);

    const allUploaded = wo.cameras.every((c: any) => c.photo);
    const allChecked = wo.cameras.every((c: any) => CHECKLIST_KEYS.every(k => c[k]));
    const canFinalize = allUploaded && allChecked && signedForm && !finalized;

    const fakeUpload = (camNum: number) => (e: any) => {
        if (!e.target.files[0]) return;
        setWo((w: any) => ({ ...w, cameras: w.cameras.map((c: any) => c.num === camNum ? { ...c, photo: e.target.files[0].name } : c) }));
    };

    const toggleCheck = (camNum: number, key: string) => {
        setWo((w: any) => ({ ...w, cameras: w.cameras.map((c: any) => c.num === camNum ? { ...c, [key]: !c[key] } : c) }));
    };

    const statusColor = finalized ? "#34D399" : wo.status === "active" ? "#60A5FA" : "#FCD34D";
    const statusLabel = finalized ? "Finalized" : wo.status === "active" ? "Active" : "Completed";

    return (
        <div style={{ background: "var(--portal-surface)", border: "1px solid #1E293B", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => setOpen(o => !o)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                borderLeft: `3px solid ${statusColor}`,
            }}>
                <div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-faint)", marginBottom: 3 }}>{wo.code}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--portal-text)" }}>{wo.customer}</div>
                    <div style={{ fontSize: 11, color: "var(--portal-muted-dark)", marginTop: 2 }}>📅 {wo.scheduled}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 4, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44`, textTransform: "uppercase" }}>
                        {statusLabel}
                    </span>
                    <span style={{ fontSize: 18, color: "var(--portal-faint)" }}>{open ? "▲" : "▼"}</span>
                </div>
            </div>

            {open && !finalized && wo.status === "active" && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #0F172A", background: "var(--portal-bg)" }}>
                    {/* Camera list */}
                    <div style={{ fontSize: 10, color: "var(--portal-muted-dark)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Camera Evidence</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                        {wo.cameras.map((cam: any) => {
                            const camDone = cam.photo && CHECKLIST_KEYS.every(k => cam[k]);
                            return (
                                <div key={cam.num} style={{
                                    background: "var(--portal-surface)", border: `1px solid ${camDone ? "#34D39944" : "var(--portal-border)"}`, borderRadius: 10, padding: "12px",
                                    cursor: "pointer",
                                }} onClick={() => setActiveCam(activeCam === cam.num ? null : cam.num)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--portal-text)" }}>Cam {cam.num}</span>
                                        <span style={{ fontSize: 16 }}>{camDone ? "✅" : cam.photo ? "🔲" : "📷"}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--portal-muted-dark)" }}>{cam.zone}</div>
                                    {cam.photo && <div style={{ fontSize: 10, color: "#34D399", marginTop: 4, wordBreak: "break-all" }}>✓ {cam.photo}</div>}

                                    {activeCam === cam.num && (
                                        <div onClick={e => e.stopPropagation()} style={{ marginTop: 10 }}>
                                            <label style={{
                                                display: "block", background: "#060810", border: "1px dashed #1E293B", borderRadius: 8, padding: "8px 10px",
                                                fontSize: 11, color: "#3B82F6", cursor: "pointer", textAlign: "center", marginBottom: 8,
                                            }}>
                                                {cam.photo ? `📁 ${cam.photo}` : "⬆ Upload Photo"}
                                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={fakeUpload(cam.num)} />
                                            </label>
                                            {CHECKLIST_KEYS.map(k => (
                                                <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer" }}>
                                                    <div onClick={() => toggleCheck(cam.num, k)} style={{
                                                        width: 14, height: 14, borderRadius: 3, border: `1px solid ${cam[k] ? "#34D399" : "var(--portal-faint)"}`,
                                                        background: cam[k] ? "#34D399" : "transparent", flexShrink: 0,
                                                    }} />
                                                    <span style={{ fontSize: 11, color: cam[k] ? "var(--portal-muted)" : "var(--portal-faint)" }}>{CHECKLIST_LABELS[k]}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Signed form */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-muted-dark)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Customer Signed Form</div>
                        <label style={{
                            display: "block", background: "var(--portal-surface)", border: `1px dashed ${signedForm ? "#34D39966" : "var(--portal-border)"}`, borderRadius: 8, padding: "12px",
                            textAlign: "center", cursor: "pointer",
                            color: signedForm ? "#34D399" : "#3B82F6", fontSize: 12,
                        }}>
                            {signedForm ? `✓ ${signedForm}` : "⬆ Upload Signed Checklist (scan or photo)"}
                            <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => { if (e.target.files && e.target.files[0]) setSignedForm(e.target.files[0].name); }} />
                        </label>
                    </div>

                    {/* Progress summary */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                        {[
                            { l: "Photos", v: `${wo.cameras.filter((c: any) => c.photo).length}/${wo.cameras.length}`, ok: allUploaded },
                            { l: "Checklist", v: `${wo.cameras.filter((c: any) => CHECKLIST_KEYS.every(k => c[k])).length}/${wo.cameras.length}`, ok: allChecked },
                            { l: "Signed Form", v: signedForm ? "Uploaded" : "Missing", ok: !!signedForm },
                        ].map(x => (
                            <div key={x.l} style={{ background: "#060810", border: `1px solid ${x.ok ? "#34D39933" : "var(--portal-border)"}`, borderRadius: 6, padding: "6px 12px", fontSize: 11 }}>
                                <span style={{ color: "var(--portal-faint)" }}>{x.l}: </span>
                                <span style={{ color: x.ok ? "#34D399" : "#F87171", fontWeight: 600 }}>{x.v}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled={!canFinalize} onClick={() => setFinalized(true)} style={{
                        width: "100%", padding: "11px 0",
                        background: canFinalize ? "linear-gradient(135deg,#22C55E,#16A34A)" : "var(--portal-border)",
                        border: "none", color: canFinalize ? "var(--portal-bg-inverse)" : "var(--portal-faint)", borderRadius: 8,
                        fontWeight: 700, fontSize: 13, cursor: canFinalize ? "pointer" : "not-allowed",
                    }}>
                        {canFinalize ? "✅ Finalize Work Order → Generate PDF" : "🔒 Complete all items to finalize"}
                    </button>
                </div>
            )}

            {open && finalized && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #0F172A", background: "var(--portal-bg)", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                    <div style={{ fontFamily: "'Courier New',monospace", color: "#34D399", fontWeight: 700, marginBottom: 4 }}>{wo.code}</div>
                    <div style={{ fontSize: 12, color: "var(--portal-muted-dark)" }}>Work order finalized. PDF sent to Sales for final payment collection.</div>
                </div>
            )}
        </div>
    );
}

// ─── MATERIAL INVOICE CARD ──────────────────────────────────────────────────
function MaterialInvoiceCard({ invoice }: any) {
    const statusColor = invoice.status === 'approved' ? '#34D399' : invoice.status === 'rejected' ? '#F87171' : '#FBBF24';

    return (
        <div style={{ background: "var(--portal-surface)", border: `1px solid ${statusColor}44`, borderRadius: 12, marginBottom: 12, padding: "16px 18px", borderLeft: `3px solid ${statusColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-faint)", marginBottom: 3 }}>WO: {invoice.work_order?.code || "Unknown"}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--portal-text)" }}>Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 4, background: `${statusColor}18`, color: statusColor, textTransform: "uppercase" }}>{invoice.status}</span>
            </div>
            {invoice.notes && <div style={{ fontSize: 12, color: "var(--portal-muted)", marginBottom: 8 }}>{invoice.notes}</div>}
            {invoice.receipt_photo_url && <a href={invoice.receipt_photo_url} target="_blank" style={{ fontSize: 11, color: "#3B82F6", textDecoration: "underline" }}>View Receipt</a>}
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TABS = ["Work Orders", "Survey Queue", "Schedule", "Material Invoices"];

export default function VendorPortal() {
    const [tab, setTab] = useState("Work Orders");
    const [surveys, setSurveys] = useState<any[]>(SURVEY_QUEUE);
    const [workOrders, setWorkOrders] = useState<any[]>(WORK_ORDERS);
    const [schedules, setSchedules] = useState<any[]>(SCHEDULE);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [accEmail, setAccEmail] = useState("");

    // New Invoice Form State
    const [showNewInvoice, setShowNewInvoice] = useState(false);
    const [newInvoiceForm, setNewInvoiceForm] = useState({ wo_id: "", amount: "", notes: "", receipt: null as File | null });

    const loadSurveys = async () => {
        try {
            const res = await fetch("/api/surveys");
            const j = await res.json();
            if (j.data) {
                setSurveys(j.data.map((s: any) => ({
                    id: s.id,
                    code: s.sales_orders?.code || "SRV-UNK",
                    customer: s.vendor_id || "Customer",
                    address: s.sales_orders?.customers?.address || "Address info pending",
                    site_type: s.sales_orders?.customers?.site_type || "commercial",
                    camera_est: s.sales_orders?.camera_count_est || 0,
                    requirements: s.sales_orders?.requirements || "",
                    schedule: s.scheduled_at ? s.scheduled_at.slice(0, 16).replace("T", " ") : null,
                    edit_count: 0,
                    status: s.status === "draft" ? "open" : "scheduled"
                })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadWOs = async () => {
        try {
            const res = await fetch("/api/workorders");
            const j = await res.json();
            if (j.data) {
                setWorkOrders(j.data.map((w: any) => ({
                    id: w.id,
                    code: w.code,
                    customer: w.sales_orders?.customers?.name || "Customer",
                    address: w.sales_orders?.customers?.address || "Address info pending",
                    scheduled: w.scheduled_at ? w.scheduled_at.slice(0, 16).replace("T", " ") : null,
                    dp_verified: true, // WOs are only visible if DP is verified as per requirements
                    status: w.status === 'in_progress' ? 'active' : 'completed',
                    cameras: w.camera_evidence || Array.from({ length: w.sales_orders?.camera_count_est || 1 }, (_, i) => ({
                        num: i + 1, zone: `Zone ${i + 1}`, photo: null, quality: false, nightvision: false, recording: false, remote: false, demo: false
                    })),
                    signed_form: w.customer_signed_form_url || null,
                    finalized: w.status !== 'in_progress'
                })));
            }
        } catch (e) { console.error(e); }
    };

    const computeSchedules = () => {
        const events = [];
        for (const s of surveys) {
            if (s.schedule) {
                events.push({
                    date: s.schedule.split(" ")[0], time: s.schedule.split(" ")[1],
                    type: "survey", code: s.code, customer: s.customer, color: "#60A5FA"
                });
            }
        }
        for (const w of workOrders) {
            if (w.scheduled) {
                events.push({
                    date: w.scheduled.split(" ")[0], time: w.scheduled.split(" ")[1],
                    type: "work_order", code: w.code, customer: w.customer, color: "#34D399"
                });
            }
        }
        setSchedules(events.sort((a, b) => a.date.localeCompare(b.date)));
    };

    const loadInvoices = async () => {
        try {
            const { data } = await supabase.from('material_invoices').select('*, work_order:work_orders(code)').order('created_at', { ascending: false });
            if (data) setInvoices(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setAccEmail(data.user.email);
        });
        Promise.all([loadSurveys(), loadWOs(), loadInvoices()]);
    }, []);

    useEffect(() => {
        computeSchedules();
    }, [surveys, workOrders]);

    const getAvatar = (email: string) => {
        if (!email) return "US";
        const parts = email.split("@");
        const name = parts[0].trim();
        if (name.length === 0) return "US";
        if (name.length === 1) return name.toUpperCase();
        return (name[0] + name[name.length - 1]).toUpperCase();
    };

    const handleSchedule = async (id: string, dt: string) => {
        setSurveys(ss => ss.map(s => s.id === id ? { ...s, schedule: dt, status: "scheduled", edit_count: s.edit_count + 1 } : s));
    };

    const submitInvoice = async () => {
        if (!newInvoiceForm.wo_id || !newInvoiceForm.amount) return;
        // Mock submission for now
        alert("Material claim submitted for review.");
        setShowNewInvoice(false);
        setNewInvoiceForm({ wo_id: "", amount: "", notes: "", receipt: null });
    };

    const NewInvoiceModal = () => (
        <div style={{ position: "fixed", inset: 0, background: "var(--portal-overlay)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "var(--portal-surface)", border: "1px solid #F59E0B", borderRadius: 16, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.4)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #0F172A", background: "#1a1200", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#FBBF24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>● Submit Material Claim</span>
                    <button onClick={() => setShowNewInvoice(false)} style={{ background: "transparent", border: "none", color: "var(--portal-faint)", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
                <div style={{ padding: "20px" }}>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", marginBottom: 6 }}>Select Work Order *</div>
                        <select value={newInvoiceForm.wo_id} onChange={e => setNewInvoiceForm(f => ({ ...f, wo_id: e.target.value }))} style={{ width: "100%", background: "#0B0E18", border: "1px solid #1E293B", color: "var(--portal-text)", padding: "10px", borderRadius: 8, outline: "none", fontSize: 13 }}>
                            <option value="">-- Choose Active WO --</option>
                            {activeWOs.map(w => <option key={w.id} value={w.id}>{w.code} - {w.customer}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", marginBottom: 6 }}>Total Claim Amount (Rp) *</div>
                        <input type="number" value={newInvoiceForm.amount} onChange={e => setNewInvoiceForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 1500000" style={{ width: "100%", background: "#0B0E18", border: "1px solid #1E293B", color: "var(--portal-text)", padding: "10px", borderRadius: 8, outline: "none", fontSize: 13 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", marginBottom: 6 }}>Description / Items Purchased</div>
                        <textarea rows={3} value={newInvoiceForm.notes} onChange={e => setNewInvoiceForm(f => ({ ...f, notes: e.target.value }))} placeholder="Cables, conduit, screws..." style={{ width: "100%", background: "#0B0E18", border: "1px solid #1E293B", color: "var(--portal-text)", padding: "10px", borderRadius: 8, outline: "none", fontSize: 13, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", marginBottom: 6 }}>Upload Receipt Photo *</div>
                        <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setNewInvoiceForm(f => ({ ...f, receipt: e.target.files![0] })); }} style={{ fontSize: 12, color: "var(--portal-muted)" }} />
                    </div>
                    <button onClick={submitInvoice} disabled={!newInvoiceForm.wo_id || !newInvoiceForm.amount} style={{ width: "100%", padding: "12px", background: newInvoiceForm.wo_id && newInvoiceForm.amount ? "linear-gradient(135deg,#F59E0B,#D97706)" : "var(--portal-border)", border: "none", cursor: newInvoiceForm.wo_id && newInvoiceForm.amount ? "pointer" : "not-allowed", color: newInvoiceForm.wo_id && newInvoiceForm.amount ? "#FEF3C7" : "var(--portal-faint)", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                        Submit Claim for Approval
                    </button>
                </div>
            </div>
        </div>
    );

    const activeWOs = workOrders.filter(w => !w.finalized && w.status === "active");
    const doneWOs = workOrders.filter(w => w.finalized || w.status === "completed");

    return (
        <div className="flex w-full min-h-screen">
            <div style={{ flex: 1, minHeight: "100vh", background: "#04080D", fontFamily: "'DM Mono','Courier New',monospace", color: "var(--portal-text)" }}>
                <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080D14}::-webkit-scrollbar-thumb{background:#1E293B;border-radius:3px}
        input[type=datetime-local]::-webkit-calendar-picker-indicator { filter: invert(0.3); }
        @media (max-width: 768px) {
            .mobile-grid { grid-template-columns: 1fr !important; }
            .mobile-flex { flex-direction: column !important; align-items: stretch !important; }
            .mobile-header-stack { flex-direction: column !important; align-items: flex-start !important; }
            .mobile-stat-row { flex-wrap: wrap !important; }
            .mobile-stat-col { min-width: 45% !important; border-bottom: 1px solid #0B1520; }
            .mobile-schedule-wrap { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
        }
      `}</style>

                {/* Header */}
                <div className="mobile-header-stack" style={{ background: "var(--portal-bg)", borderBottom: "1px solid #0F172A", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#0EA5E9,#0284C7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
                        <div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: "#E0F2FE", letterSpacing: "-0.02em" }}>Vendor Portal</div>
                            <div style={{ fontSize: 10, color: "#164E63", letterSpacing: "0.09em" }}>VENDOR.YOURDOMAIN.COM · {VENDOR_NAME.toUpperCase()}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <ThemeToggle />
                        <div style={{ display: "flex", gap: 2, background: "#0B1520", padding: 3, borderRadius: 10, border: "1px solid #1E293B" }}>
                            {TABS.map(t => (
                                <button key={t} onClick={() => setTab(t)} style={{
                                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                    background: tab === t ? "#0EA5E9" : "transparent",
                                    color: tab === t ? "var(--portal-bg-inverse)" : "var(--portal-faint)",
                                    transition: "all 0.15s",
                                }}>{t}</button>
                            ))}
                        </div>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0B1520", border: `1px solid #0EA5E9`, color: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }} title={accEmail}>
                            {getAvatar(accEmail)}
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="mobile-stat-row" style={{ display: "flex", gap: 1, background: "#06090E", borderBottom: "1px solid #0B1520" }}>
                    {[
                        { l: "Active WOs", v: activeWOs.length, c: "#60A5FA" },
                        { l: "Surveys Pending", v: surveys.filter(s => !s.schedule).length, c: "#F59E0B" },
                        { l: "Completed WOs", v: doneWOs.length, c: "#34D399" },
                        { l: "Upcoming (7d)", v: schedules.length, c: "#A78BFA" },
                    ].map((s, i) => (
                        <div key={s.l} className="mobile-stat-col" style={{ flex: 1, padding: "10px 18px", borderRight: i < 3 ? "1px solid #0B1520" : "none" }}>
                            <div style={{ fontSize: 9, color: "#2E4A5C", textTransform: "uppercase", letterSpacing: "0.09em" }}>{s.l}</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 24, color: s.c, marginTop: 2 }}>{s.v}</div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>

                    {/* WORK ORDERS */}
                    {tab === "Work Orders" && (<>
                        {activeWOs.length > 0 && (
                            <>
                                <div style={{ fontSize: 10, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>● Active</div>
                                {activeWOs.map(wo => <WorkOrderCard key={wo.id} wo={wo} />)}
                            </>
                        )}
                        {doneWOs.length > 0 && (
                            <>
                                <div style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "16px 0 10px" }}>✓ Completed</div>
                                {doneWOs.map(wo => <WorkOrderCard key={wo.id} wo={wo} />)}
                            </>
                        )}
                    </>)}

                    {/* SURVEY QUEUE */}
                    {tab === "Survey Queue" && (<>
                        <div style={{ fontSize: 10, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>● Open Survey Orders</div>
                        {surveys.map(s => <SurveyCard key={s.id} survey={s} onSchedule={handleSchedule} />)}
                    </>)}

                    {/* SCHEDULE */}
                    {tab === "Schedule" && (
                        <div>
                            <div style={{ fontSize: 10, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Scheduled Events</div>
                            {schedules.map((e, i) => (
                                <div key={i} style={{
                                    background: "var(--portal-bg)", border: "1px solid #1E293B", borderLeft: `3px solid ${e.color}`,
                                    borderRadius: 10, padding: "14px 18px", marginBottom: 10,
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}>
                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                        <div style={{ textAlign: "center", minWidth: 48 }}>
                                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: e.color }}>{e.date.slice(8)}</div>
                                            <div style={{ fontSize: 10, color: "var(--portal-faint)" }}>{SCHEDULE[i].date.slice(5, 7) === "03" ? "MAR" : "FEB"}</div>
                                        </div>
                                        <div style={{ width: "1px", height: 36, background: "var(--portal-border)" }} />
                                        <div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                                                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${e.color}18`, color: e.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{e.type.replace("_", " ")}</span>
                                                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "var(--portal-faint)" }}>{e.code}</span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--portal-text)" }}>{e.customer}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: e.color }}>{e.time}</div>
                                </div>
                            ))}
                            <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--portal-bg)", border: "1px solid #1E293B", borderRadius: 10, fontSize: 11, color: "var(--portal-faint)", lineHeight: 1.8 }}>
                                ⚠ You can edit your own scheduled entries up to <span style={{ color: "#F59E0B" }}>2 times</span>. Beyond that, contact Admin.
                            </div>
                        </div>
                    )}

                    {/* MATERIAL INVOICES */}
                    {tab === "Material Invoices" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div style={{ fontSize: 10, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.1em" }}>Material Claims History</div>
                                <button onClick={() => setShowNewInvoice(true)} style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", border: "none", color: "#FEF3C7", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ Submit New Claim</button>
                            </div>

                            {invoices.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--portal-faint)", border: "1px dashed #1E293B", borderRadius: 12 }}>
                                    No material invoices submitted yet.
                                </div>
                            ) : (
                                invoices.map(i => <MaterialInvoiceCard key={i.id} invoice={i} />)
                            )}
                        </div>
                    )}

                    {showNewInvoice && <NewInvoiceModal />}
                </div>
            </div>
            <SharedCalendar />
        </div>
    );
}
