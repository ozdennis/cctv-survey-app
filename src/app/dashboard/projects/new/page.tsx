"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, PlusCircle, Trash2, Camera, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NewProjectSurvey() {
    const router = useRouter();

    // 1. Basic Details
    const [clientName, setClientName] = useState("");
    const [category, setCategory] = useState("Warehouse");
    const [fullAddress, setFullAddress] = useState("");
    const [googleMaps, setGoogleMaps] = useState("");

    // 2. Survey Checklist
    const [totalArea, setTotalArea] = useState<number | "">("");
    const [ceilingHeight, setCeilingHeight] = useState<number | "">("");
    const [rackingHeight, setRackingHeight] = useState<number | "">("");
    const [loadingDock, setLoadingDock] = useState("No");
    const [highTemp, setHighTemp] = useState("No");
    const [dustRisk, setDustRisk] = useState("Normal");

    // 3. Camera Mapping
    const [cameras, setCameras] = useState([{ id: Date.now(), location: "", brand: "", name: "", spec: "", mount_height: "", cable: "", photo_url: "", uploading: false }]);

    // 4. Materials
    const [materials, setMaterials] = useState([{ id: Date.now(), item: "", qty: "", unitCost: "" }]);

    // 5. Labor State
    const [workers, setWorkers] = useState<number | "">("");
    const [workerRate, setWorkerRate] = useState<number | "">("");
    const [days, setDays] = useState<number | "">("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalLaborCost = (Number(workers) || 0) * (Number(workerRate) || 0) * (Number(days) || 0);

    const addCamera = () => setCameras([...cameras, { id: Date.now(), location: "", brand: "", name: "", spec: "", mount_height: "", cable: "", photo_url: "", uploading: false }]);
    const removeCamera = (id: number) => setCameras(cameras.filter(c => c.id !== id));
    const addMaterial = () => setMaterials([...materials, { id: Date.now(), item: "", qty: "", unitCost: "" }]);
    const removeMaterial = (id: number) => setMaterials(materials.filter(m => m.id !== id));

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Set uploading state
        const newCams = [...cameras];
        newCams[index].uploading = true;
        setCameras(newCams);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `cameras/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('survey_photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('survey_photos').getPublicUrl(filePath);

            const updatedCams = [...cameras];
            updatedCams[index].photo_url = data.publicUrl;
            updatedCams[index].uploading = false;
            setCameras(updatedCams);
        } catch (error: any) {
            alert("Error uploading photo: " + error.message);
            const updatedCams = [...cameras];
            updatedCams[index].uploading = false;
            setCameras(updatedCams);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Get current user
            const { data: authData, error: authErr } = await supabase.auth.getUser();
            if (authErr || !authData.user) {
                alert("You must be logged in to save a survey.");
                setIsSubmitting(false);
                return;
            }
            const userId = authData.user.id;

            // 1. Insert Project
            const { data: projectData, error: projErr } = await supabase.from('projects').insert([{
                user_id: userId,
                client_name: clientName,
                category,
                full_address: fullAddress,
                google_maps_link: googleMaps,
                status: 'submitted'
            }]).select();

            if (projErr || !projectData) throw new Error(projErr?.message || "Failed to create project");
            const projectId = projectData[0].id;

            // 2. Insert Survey Details
            const surveyPayload = {
                project_id: projectId,
                total_area: Number(totalArea),
                ceiling_height: Number(ceilingHeight),
                racking_height: category === 'Warehouse' ? Number(rackingHeight) : null,
                loading_dock: category === 'Warehouse' ? loadingDock : null,
                high_temp: category === 'Factory' ? highTemp : null,
                dust_risk: category === 'Factory' ? dustRisk : null,
            };
            const { error: survErr } = await supabase.from('surveys').insert([surveyPayload]);
            if (survErr) throw new Error(survErr.message);

            // 3. Insert Cameras
            if (cameras.length > 0) {
                const camPayload = cameras.map(c => ({
                    project_id: projectId,
                    product_brand: c.brand || null,
                    product_name: c.name || null,
                    product_spec: c.spec || null,
                    description: c.location,
                    mount_height: Number(c.mount_height),
                    cable_length: Number(c.cable),
                    photo_url: c.photo_url || null
                }));
                const { error: camErr } = await supabase.from('cameras').insert(camPayload);
                if (camErr) throw new Error(camErr.message);
            }

            // 4. Insert Materials
            if (materials.length > 0 && materials[0].item !== "") {
                const matPayload = materials.map(m => ({
                    project_id: projectId,
                    item_name: m.item,
                    quantity: Number(m.qty),
                    unit_cost: Number(m.unitCost),
                }));
                const { error: matErr } = await supabase.from('materials').insert(matPayload);
                if (matErr) throw new Error(matErr.message);
            }

            // 5. Insert Labor
            const { error: laborErr } = await supabase.from('labor_costs').insert([{
                project_id: projectId,
                workers: Number(workers) || 0,
                worker_rate: Number(workerRate) || 0,
                days: Number(days) || 0,
                total_cost: totalLaborCost
            }]);
            if (laborErr) throw new Error(laborErr.message);

            alert("Survey submitted successfully!");
            router.push("/dashboard/projects");

        } catch (err: any) {
            alert("Error saving survey: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 pb-16">
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/projects" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">New Project Survey</h1>
                        <p className="text-sm text-slate-400">Draft a new CCTV installation survey</p>
                    </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium text-sm rounded-lg shadow-sm transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Save Survey"}
                </button>
            </div>

            {/* 1. Basic Details */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">1. Project Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Client / Company Name</label>
                        <input required value={clientName} onChange={e => setClientName(e.target.value)} type="text" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white" placeholder="e.g. PT. Mitra Abadi" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white"
                        >
                            <option value="Warehouse">Warehouse</option>
                            <option value="Factory">Factory</option>
                            <option value="Residential">Residential</option>
                            <option value="Shop">Shop</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-300">Full Address</label>
                        <textarea required value={fullAddress} onChange={e => setFullAddress(e.target.value)} rows={2} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white" placeholder="Location details..." />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-300">Google Maps Link</label>
                        <input type="url" value={googleMaps} onChange={e => setGoogleMaps(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white" placeholder="https://maps.google.com/..." />
                    </div>
                </div>
            </section>

            {/* 2. Dynamic Survey Details */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">2. Survey Checklist - {category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Total Area Estimate (sqm)</label>
                        <input required value={totalArea} onChange={e => setTotalArea(e.target.value ? Number(e.target.value) : "")} type="number" min="0" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 text-white" placeholder="e.g. 500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Ceiling Height (meters)</label>
                        <input required value={ceilingHeight} onChange={e => setCeilingHeight(e.target.value ? Number(e.target.value) : "")} type="number" min="0" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 text-white" placeholder="e.g. 8" />
                    </div>

                    {category === "Warehouse" && (
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Estimated Racking Height (m)</label>
                                <input required value={rackingHeight} onChange={e => setRackingHeight(e.target.value ? Number(e.target.value) : "")} type="number" min="0" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 text-white" placeholder="e.g. 6" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-rose-400 font-semibold">Special Focus: Loading Dock?</label>
                                <select value={loadingDock} onChange={e => setLoadingDock(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-rose-500/50">
                                    <option value="Yes">Yes - Needs Wide Angle</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </>
                    )}

                    {category === "Factory" && (
                        <>
                            <div className="space-y-1 text-rose-400 font-semibold">
                                <label className="text-sm">High Temperature Area Exposure?</label>
                                <select value={highTemp} onChange={e => setHighTemp(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-rose-900/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-rose-500/50">
                                    <option value="Yes">Yes - Requires special casing</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="space-y-1 text-rose-400 font-semibold">
                                <label className="text-sm">Heavy Dust / Explosion Risk?</label>
                                <select value={dustRisk} onChange={e => setDustRisk(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-rose-900/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-rose-500/50">
                                    <option value="ATEX">Yes - Proceed with ATEX guidelines</option>
                                    <option value="IP67">Medium Dust - Requires IP67</option>
                                    <option value="Normal">Normal</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* 3. Camera Points */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h2 className="text-lg font-semibold text-white">3. Camera Mapping</h2>
                    <button type="button" onClick={addCamera} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                        <PlusCircle className="w-4 h-4" /> Add Camera
                    </button>
                </div>

                <div className="space-y-4">
                    {cameras.map((cam, idx) => (
                        <div key={cam.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="md:col-span-1 flex flex-col items-center justify-center pt-6">
                                <span className="bg-slate-800 shadow border border-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-300">C{idx + 1}</span>
                            </div>
                            <div className="md:col-span-4 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location Desc</label>
                                <input required value={cam.location} onChange={e => {
                                    const newCams = [...cameras];
                                    newCams[idx].location = e.target.value;
                                    setCameras(newCams);
                                }} type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Main Lobby entrance" />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Brand</label>
                                <input required value={cam.brand} onChange={e => {
                                    const newCams = [...cameras];
                                    newCams[idx].brand = e.target.value;
                                    setCameras(newCams);
                                }} type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Hikvision" />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Model / Part No</label>
                                <input required value={cam.name} onChange={e => {
                                    const newCams = [...cameras];
                                    newCams[idx].name = e.target.value;
                                    setCameras(newCams);
                                }} type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. DS-2CD..." />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Spec / Notes</label>
                                <input value={cam.spec} onChange={e => {
                                    const newCams = [...cameras];
                                    newCams[idx].spec = e.target.value;
                                    setCameras(newCams);
                                }} type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. 4MP, IP67" />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mount (m)</label>
                                <input required value={cam.mount_height} onChange={e => {
                                    const newCams = [...cameras];
                                    newCams[idx].mount_height = e.target.value;
                                    setCameras(newCams);
                                }} type="number" min="0" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g 4" />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cable (m)</label>
                                <input required value={cam.cable} onChange={e => {
                                    const newCams = [...cameras];
                                    newCams[idx].cable = e.target.value;
                                    setCameras(newCams);
                                }} type="number" min="0" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. 45" />
                            </div>
                            <div className="md:col-span-1 flex flex-col justify-end pb-1 gap-2">
                                <label className="relative p-2 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 text-slate-300 font-medium overflow-hidden cursor-pointer transition-colors flex items-center justify-center group" title="Attach Photo">
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => handlePhotoUpload(e, idx)} disabled={cam.uploading} />
                                    {cam.uploading ? (
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : cam.photo_url ? (
                                        <div className="w-6 h-6 rounded-full border border-green-500/50 bg-green-500/10 flex items-center justify-center"><Check className="w-4 h-4 text-green-400" /></div>
                                    ) : (
                                        <Camera className="w-4 h-4 group-hover:text-primary transition-colors" />
                                    )}
                                </label>
                                {cameras.length > 1 && (
                                    <button type="button" onClick={() => removeCamera(cam.id)} className="p-2 bg-rose-950/30 border border-rose-900/50 rounded-lg hover:bg-rose-900/50 text-rose-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Materials List */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h2 className="text-lg font-semibold text-white">4. Material Estimate</h2>
                    <button type="button" onClick={addMaterial} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                        <PlusCircle className="w-4 h-4" /> Add Item
                    </button>
                </div>

                <div className="space-y-4">
                    {materials.map((mat, idx) => (
                        <div key={mat.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="md:col-span-6 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Item Name</label>
                                <input required type="text" value={mat.item} onChange={e => {
                                    const newMats = [...materials];
                                    newMats[idx].item = e.target.value;
                                    setMaterials(newMats);
                                }} placeholder="e.g. Kabel Belden UTP CAT6 (m)" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Qty</label>
                                <input required value={mat.qty} onChange={e => {
                                    const newMats = [...materials];
                                    newMats[idx].qty = e.target.value;
                                    setMaterials(newMats);
                                }} type="number" min="1" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="1" />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Est. Unit Cost (Rp)</label>
                                <input required value={mat.unitCost} onChange={e => {
                                    const newMats = [...materials];
                                    newMats[idx].unitCost = e.target.value;
                                    setMaterials(newMats);
                                }} type="number" min="0" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="1500000" />
                            </div>
                            <div className="md:col-span-1 flex justify-end pb-1 gap-2">
                                {materials.length > 1 && (
                                    <button type="button" onClick={() => removeMaterial(mat.id)} className="p-2 bg-rose-950/30 border border-rose-900/50 rounded-lg hover:bg-rose-900/50 text-rose-400 w-full flex justify-center transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Labor Cost & Estimated Time */}
            <section className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">5. Labor Cost and Estimated Time</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Number of Workers</label>
                        <input required type="number" min="1" value={workers} onChange={e => setWorkers(e.target.value ? Number(e.target.value) : "")} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white" placeholder="e.g. 2" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Daily Rate per Worker (Rp)</label>
                        <input required type="number" min="0" value={workerRate} onChange={e => setWorkerRate(e.target.value ? Number(e.target.value) : "")} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white" placeholder="e.g. 150000" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Estimated Duration (Days)</label>
                        <input required type="number" min="1" value={days} onChange={e => setDays(e.target.value ? Number(e.target.value) : "")} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-white" placeholder="e.g. 3" />
                    </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Estimated Total Labor Cost:</span>
                    <span className="text-2xl font-bold text-white">
                        Rp {totalLaborCost.toLocaleString("id-ID")}
                    </span>
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary/95 shadow-lg shadow-primary/30 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50">
                    {isSubmitting ? "Submitting..." : "Submit Survey Request"}
                </button>
            </div>

        </form>
    );
}
