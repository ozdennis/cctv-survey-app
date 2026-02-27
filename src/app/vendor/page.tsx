"use client";

import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const VENDOR_NAME = "Agus Teknisi";

const SURVEY_QUEUE = [
    { id: "s1", code: "SO-20250227-0005", customer: "Gudang Bersama Logistics", address: "Jl. Industri Raya No. 7, Bekasi", site_type: "warehouse", camera_est: 12, requirements: "Outdoor perimeter + loading dock coverage. Night vision mandatory.", schedule: null, edit_count: 0, status: "open" },
    { id: "s2", code: "SO-20250225-0004", customer: "Apotek Sehat Selalu", address: "Jl. Raya Bogor KM 22, Depok", site_type: "retail", camera_est: 4, requirements: "Indoor ceiling mount, focus on cashier and entrance.", schedule: "2025-03-02 09:00", edit_count: 1, status: "scheduled" },
];

const WORK_ORDERS = [
    {
        id: "w1", code: "WO-20250215-0002", customer: "Toko Sukses Mandiri",
        address: "Ruko Blok C No. 5, Surabaya", scheduled: "2025-03-05 08:00",
        dp_verified: true, status: "active",
        cameras: [
            { num: 1, zone: "Cashier Counter", photo: null, quality: false, nightvision: false, recording: false, remote: false, demo: false },
            { num: 2, zone: "Main Entrance", photo: null, quality: false, nightvision: false, recording: false, remote: false, demo: false },
            { num: 3, zone: "Storage Room", photo: null, quality: false, nightvision: false, recording: false, remote: false, demo: false },
            { num: 4, zone: "Parking Area", photo: null, quality: false, nightvision: false, recording: false, remote: false, demo: false },
        ],
        signed_form: null, finalized: false,
    },
    {
        id: "w2", code: "WO-20250210-0001", customer: "Kantor CV Berkah",
        address: "Jl. Pemuda No. 88, Bandung", scheduled: "2025-02-20 09:00",
        dp_verified: true, status: "completed", cameras: [], signed_form: "signed.jpg", finalized: true,
    },
];

const SCHEDULE = [
    { date: "2025-03-02", time: "09:00", type: "survey", code: "SO-20250225-0004", customer: "Apotek Sehat Selalu", color: "#60A5FA" },
    { date: "2025-03-05", time: "08:00", type: "work_order", code: "WO-20250215-0002", customer: "Toko Sukses Mandiri", color: "#34D399" },
    { date: "2025-03-08", time: "10:00", type: "survey", code: "SO-20250227-0005", customer: "Gudang Bersama Logistics", color: "#60A5FA" },
];

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
        <div style={{ background: "#0D1117", border: "1px solid #1E293B", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => setOpen(o => !o)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                borderLeft: `3px solid ${saved ? "#34D399" : "#60A5FA"}`,
            }}>
                <div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#475569", marginBottom: 3 }}>{survey.code}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>{survey.customer}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>📍 {survey.address}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 4, textTransform: "uppercase",
                        background: saved ? "#052e16" : "#0D1F35",
                        color: saved ? "#34D399" : "#60A5FA",
                        border: `1px solid ${saved ? "#34D39944" : "#60A5FA44"}`,
                    }}>{saved ? "Scheduled" : "Needs Schedule"}</span>
                    <span style={{ fontSize: 18, color: "#334155" }}>{open ? "▲" : "▼"}</span>
                </div>
            </div>

            {open && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #0F172A", background: "#080D14" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                        <div style={{ background: "#0D1117", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Site Type</div>
                            <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "capitalize" }}>{survey.site_type}</div>
                        </div>
                        <div style={{ background: "#0D1117", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Est. Cameras</div>
                            <div style={{ fontSize: 12, color: "#94A3B8" }}>{survey.camera_est} units</div>
                        </div>
                        <div style={{ background: "#0D1117", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Edit Count</div>
                            <div style={{ fontSize: 12, color: survey.edit_count >= 2 ? "#F87171" : "#94A3B8" }}>{survey.edit_count}/2 {survey.edit_count >= 2 ? "⚠ Admin only" : ""}</div>
                        </div>
                    </div>

                    {survey.requirements && (
                        <div style={{ background: "#0D1117", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
                            <span style={{ color: "#334155", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Requirements: </span>
                            {survey.requirements}
                        </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Survey Date & Time</div>
                        <input type="datetime-local" value={dt} onChange={e => setDt(e.target.value)}
                            disabled={!canEdit && saved}
                            style={{ background: "#0D1117", border: `1px solid ${canEdit ? "#1E293B" : "#0F172A"}`, color: canEdit ? "#E2E8F0" : "#334155", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", width: "100%", cursor: canEdit ? "auto" : "not-allowed" }} />
                        {!canEdit && <div style={{ fontSize: 10, color: "#F87171", marginTop: 4 }}>⚠ Max edits reached. Contact Admin to reschedule.</div>}
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Estimated Survey Cost (Rp)</div>
                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 350000"
                            style={{ background: "#0D1117", border: "1px solid #1E293B", color: "#E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", width: "100%" }} />
                    </div>

                    <button onClick={handleSave} disabled={!canEdit || !dt}
                        style={{ width: "100%", padding: "10px 0", background: canEdit && dt ? "linear-gradient(135deg,#3B82F6,#1D4ED8)" : "#1E293B", border: "none", color: canEdit && dt ? "#fff" : "#334155", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: canEdit && dt ? "pointer" : "not-allowed" }}>
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
        <div style={{ background: "#0D1117", border: "1px solid #1E293B", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => setOpen(o => !o)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                borderLeft: `3px solid ${statusColor}`,
            }}>
                <div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#475569", marginBottom: 3 }}>{wo.code}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>{wo.customer}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>📅 {wo.scheduled}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 4, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44`, textTransform: "uppercase" }}>
                        {statusLabel}
                    </span>
                    <span style={{ fontSize: 18, color: "#334155" }}>{open ? "▲" : "▼"}</span>
                </div>
            </div>

            {open && !finalized && wo.status === "active" && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #0F172A", background: "#080D14" }}>
                    {/* Camera list */}
                    <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Camera Evidence</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                        {wo.cameras.map((cam: any) => {
                            const camDone = cam.photo && CHECKLIST_KEYS.every(k => cam[k]);
                            return (
                                <div key={cam.num} style={{
                                    background: "#0D1117", border: `1px solid ${camDone ? "#34D39944" : "#1E293B"}`, borderRadius: 10, padding: "12px",
                                    cursor: "pointer",
                                }} onClick={() => setActiveCam(activeCam === cam.num ? null : cam.num)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "#E2E8F0" }}>Cam {cam.num}</span>
                                        <span style={{ fontSize: 16 }}>{camDone ? "✅" : cam.photo ? "🔲" : "📷"}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#64748B" }}>{cam.zone}</div>
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
                                                        width: 14, height: 14, borderRadius: 3, border: `1px solid ${cam[k] ? "#34D399" : "#334155"}`,
                                                        background: cam[k] ? "#34D399" : "transparent", flexShrink: 0,
                                                    }} />
                                                    <span style={{ fontSize: 11, color: cam[k] ? "#94A3B8" : "#475569" }}>{CHECKLIST_LABELS[k]}</span>
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
                        <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Customer Signed Form</div>
                        <label style={{
                            display: "block", background: "#0D1117", border: `1px dashed ${signedForm ? "#34D39966" : "#1E293B"}`, borderRadius: 8, padding: "12px",
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
                            <div key={x.l} style={{ background: "#060810", border: `1px solid ${x.ok ? "#34D39933" : "#1E293B"}`, borderRadius: 6, padding: "6px 12px", fontSize: 11 }}>
                                <span style={{ color: "#475569" }}>{x.l}: </span>
                                <span style={{ color: x.ok ? "#34D399" : "#F87171", fontWeight: 600 }}>{x.v}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled={!canFinalize} onClick={() => setFinalized(true)} style={{
                        width: "100%", padding: "11px 0",
                        background: canFinalize ? "linear-gradient(135deg,#22C55E,#16A34A)" : "#1E293B",
                        border: "none", color: canFinalize ? "#fff" : "#334155", borderRadius: 8,
                        fontWeight: 700, fontSize: 13, cursor: canFinalize ? "pointer" : "not-allowed",
                    }}>
                        {canFinalize ? "✅ Finalize Work Order → Generate PDF" : "🔒 Complete all items to finalize"}
                    </button>
                </div>
            )}

            {open && finalized && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #0F172A", background: "#080D14", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                    <div style={{ fontFamily: "'Courier New',monospace", color: "#34D399", fontWeight: 700, marginBottom: 4 }}>{wo.code}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>Work order finalized. PDF sent to Sales for final payment collection.</div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TABS = ["Work Orders", "Survey Queue", "Schedule"];

export default function VendorPortal() {
    const [tab, setTab] = useState("Work Orders");
    const [surveys, setSurveys] = useState(SURVEY_QUEUE);

    const handleSchedule = (id: string, dt: string) => {
        setSurveys(ss => ss.map(s => s.id === id ? { ...s, schedule: dt, status: "scheduled", edit_count: s.edit_count + 1 } : s));
    };

    const activeWOs = WORK_ORDERS.filter(w => !w.finalized && w.status === "active");
    const doneWOs = WORK_ORDERS.filter(w => w.finalized || w.status === "completed");

    return (
        <div style={{ minHeight: "100vh", background: "#050B0E", fontFamily: "'DM Mono','Courier New',monospace", color: "#E2E8F0" }}>
            <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080D14}::-webkit-scrollbar-thumb{background:#1E293B;border-radius:3px}
        input[type=datetime-local]::-webkit-calendar-picker-indicator { filter: invert(0.3); }
      `}</style>

            {/* Header */}
            <div style={{ background: "#080D14", borderBottom: "1px solid #0F172A", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#0EA5E9,#0284C7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
                    <div>
                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: "#E0F2FE", letterSpacing: "-0.02em" }}>Vendor Portal</div>
                        <div style={{ fontSize: 10, color: "#164E63", letterSpacing: "0.09em" }}>VENDOR.YOURDOMAIN.COM · {VENDOR_NAME.toUpperCase()}</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 2, background: "#0B1520", padding: 3, borderRadius: 10, border: "1px solid #1E293B" }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                            background: tab === t ? "#0EA5E9" : "transparent",
                            color: tab === t ? "#fff" : "#475569",
                            transition: "all 0.15s",
                        }}>{t}</button>
                    ))}
                </div>
            </div>

            {/* Stats strip */}
            <div style={{ display: "flex", gap: 1, background: "#06090E", borderBottom: "1px solid #0B1520" }}>
                {[
                    { l: "Active WOs", v: activeWOs.length, c: "#60A5FA" },
                    { l: "Surveys Pending", v: surveys.filter(s => !s.schedule).length, c: "#F59E0B" },
                    { l: "Completed", v: doneWOs.length, c: "#34D399" },
                    { l: "Upcoming (7d)", v: SCHEDULE.length, c: "#A78BFA" },
                ].map(s => (
                    <div key={s.l} style={{ flex: 1, padding: "10px 18px", borderRight: "1px solid #0B1520" }}>
                        <div style={{ fontSize: 9, color: "#1E3A4C", textTransform: "uppercase", letterSpacing: "0.09em" }}>{s.l}</div>
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
                            <div style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", margin: "16px 0 10px" }}>✓ Completed</div>
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
                        <div style={{ fontSize: 10, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Upcoming 7 Days</div>
                        {SCHEDULE.map((e, i) => (
                            <div key={i} style={{
                                background: "#080D14", border: "1px solid #1E293B", borderLeft: `3px solid ${e.color}`,
                                borderRadius: 10, padding: "14px 18px", marginBottom: 10,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    <div style={{ textAlign: "center", minWidth: 48 }}>
                                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: e.color }}>{e.date.slice(8)}</div>
                                        <div style={{ fontSize: 10, color: "#334155" }}>{SCHEDULE[i].date.slice(5, 7) === "03" ? "MAR" : "FEB"}</div>
                                    </div>
                                    <div style={{ width: "1px", height: 36, background: "#1E293B" }} />
                                    <div>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${e.color}18`, color: e.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{e.type.replace("_", " ")}</span>
                                            <span style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#334155" }}>{e.code}</span>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "#E2E8F0" }}>{e.customer}</div>
                                    </div>
                                </div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: e.color }}>{e.time}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: 20, padding: "14px 18px", background: "#080D14", border: "1px solid #1E293B", borderRadius: 10, fontSize: 11, color: "#334155", lineHeight: 1.8 }}>
                            ⚠ You can edit your own scheduled entries up to <span style={{ color: "#F59E0B" }}>2 times</span>. Beyond that, contact Admin.
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
