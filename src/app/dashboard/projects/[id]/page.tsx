"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, FileText, CheckCircle, XCircle, User, MapPin, Calculator, Package, Camera, Banknote } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProjectDetail() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [project, setProject] = useState<any>(null);
    const [survey, setSurvey] = useState<any>(null);
    const [cameras, setCameras] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [labor, setLabor] = useState<any>(null);
    const [vendor, setVendor] = useState<any>(null);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            setLoading(true);

            // 1. Check Role
            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) {
                const { data: userData } = await supabase.from('users').select('role').eq('id', authData.user.id).single();
                if (userData && userData.role === 'admin') setIsAdmin(true);
            }

            // 2. Fetch all relational data
            const [projRes, survRes, camRes, matRes, labRes] = await Promise.all([
                supabase.from('projects').select('*').eq('id', projectId).single(),
                supabase.from('surveys').select('*').eq('project_id', projectId).single(),
                supabase.from('cameras').select('*').eq('project_id', projectId),
                supabase.from('materials').select('*').eq('project_id', projectId),
                supabase.from('labor_costs').select('*').eq('project_id', projectId).single(),
            ]);

            if (projRes.data) {
                setProject(projRes.data);
                // fetch the vendor who submitted
                const { data: vData } = await supabase.from('users').select('name, company_name, email:id').eq('id', projRes.data.user_id).single();
                if (vData) setVendor(vData);
            }
            if (survRes.data) setSurvey(survRes.data);
            if (camRes.data) setCameras(camRes.data);
            if (matRes.data) setMaterials(matRes.data);
            if (labRes.data) setLabor(labRes.data);

            setLoading(false);
        };

        if (projectId) fetchProjectDetails();
    }, [projectId]);

    const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);
        if (error) alert("Error updating status: " + error.message);
        else {
            alert(`Project ${newStatus}!`);
            router.push('/dashboard/projects');
        }
    };

    if (loading) return <div className="text-center text-slate-400 py-10 flex flex-col items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>Loading project file...</div>;
    if (!project) return <div className="text-center text-rose-500 py-10">Project not found or access denied.</div>;

    // Financials
    const totalMaterialsCost = materials.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.unit_cost)), 0);
    const totalLaborCost = labor ? Number(labor.total_cost) : 0;
    const baseCost = totalMaterialsCost + totalLaborCost;

    // Risk Margin Calculation
    let marginPercent = 0.15; // default 15%
    if (project.category === 'Warehouse') {
        marginPercent = 0.20;
        if (survey?.loading_dock === 'Yes') marginPercent += 0.05;
    } else if (project.category === 'Factory') {
        marginPercent = 0.25;
        if (survey?.high_temp === 'Yes') marginPercent += 0.10;
        if (survey?.dust_risk === 'ATEX') marginPercent += 0.15;
    } else if (project.category === 'Shop') {
        marginPercent = 0.20;
    }

    const marginValue = baseCost * marginPercent;
    const recommendedPrice = baseCost + marginValue;

    const getStatusStyle = (s: string) => {
        if (s === 'approved') return "bg-green-500/20 text-green-400 border-green-500/30";
        if (s === 'rejected') return "bg-rose-500/20 text-rose-400 border-rose-500/30";
        if (s === 'submitted') return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        return "bg-slate-800 text-slate-300 border-slate-700";
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-6 border-slate-800">
                <div className="flex items-start gap-4">
                    <Link href="/dashboard/projects" className="p-2 mt-1 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700">
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{project.client_name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusStyle(project.status)}`}>
                                {project.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 fill-slate-400">
                            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {project.category}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {new Date(project.created_at).toLocaleDateString()}</span>
                            {vendor && (
                                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Surveyor: {vendor.name} ({vendor.company_name || 'Independent'})</span>
                            )}
                        </div>
                    </div>
                </div>

                {isAdmin && project.status === 'submitted' && (
                    <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        <button onClick={() => handleStatusChange('rejected')} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 font-medium text-sm rounded-lg transition-colors border border-rose-500/20">
                            <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button onClick={() => handleStatusChange('approved')} className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-green-500/20">
                            <CheckCircle className="w-4 h-4" /> Approve Project
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Details) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Survey Metrics */}
                    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                            <h3 className="font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400" /> Site Metrics</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Total Area</p>
                                <p className="text-lg font-medium text-white">{survey?.total_area || '-'} <span className="text-sm text-slate-500 font-normal">sqm</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Ceiling</p>
                                <p className="text-lg font-medium text-white">{survey?.ceiling_height || '-'} <span className="text-sm text-slate-500 font-normal">m</span></p>
                            </div>
                            {project.category === 'Warehouse' && (
                                <>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Racking</p>
                                        <p className="text-lg font-medium text-white">{survey?.racking_height || '-'} <span className="text-sm text-slate-500 font-normal">m</span></p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Loading Dock</p>
                                        <p className={`text-sm font-medium px-2 py-1 rounded inline-block ${survey?.loading_dock === 'Yes' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>{survey?.loading_dock}</p>
                                    </div>
                                </>
                            )}
                            {project.category === 'Factory' && (
                                <>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">High Temp</p>
                                        <p className={`text-sm font-medium px-2 py-1 rounded inline-block ${survey?.high_temp === 'Yes' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>{survey?.high_temp}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Dust Risk</p>
                                        <p className={`text-sm font-medium px-2 py-1 rounded inline-block ${survey?.dust_risk !== 'Normal' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-300'}`}>{survey?.dust_risk}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-slate-800/20 border-t border-slate-800">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Location Address</p>
                            <p className="text-sm text-slate-300">{project.full_address}</p>
                            {project.google_maps_link && (
                                <a href={project.google_maps_link} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium inline-block mt-2">View on Google Maps &rarr;</a>
                            )}
                        </div>
                    </div>

                    {/* Cameras list */}
                    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-semibold text-white flex items-center gap-2"><Camera className="w-4 h-4 text-green-400" /> Camera Deployments ({cameras.length})</h3>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {cameras.map((c, i) => (
                                <div key={c.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-slate-800/30 transition-colors">
                                    <div className="w-12 h-12 shrink-0 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center font-bold text-slate-400 shadow-inner">
                                        C{i + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="font-medium text-white text-lg">{c.description}</p>
                                        <p className="text-sm text-slate-400 flex items-center gap-2">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{c.product_brand} {c.product_name}</span>
                                        </p>
                                        <div className="flex gap-6 mt-3 text-sm text-slate-500">
                                            <span>Mounting: <strong className="text-slate-300">{c.mount_height}m</strong></span>
                                            <span>Cable Est: <strong className="text-slate-300">{c.cable_length}m</strong></span>
                                        </div>
                                    </div>
                                    {c.photo_url && (
                                        <div className="shrink-0 group relative overflow-hidden rounded-xl border border-slate-700 w-32 h-24 bg-slate-800">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={c.photo_url} alt="Camera Location" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <a href={c.photo_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-semibold text-white bg-black/80 px-2 py-1 rounded">View Full</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Financials & Bills) */}
                <div className="space-y-6">
                    {/* Quotation breakdown */}
                    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                            <h3 className="font-semibold text-white flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-400" /> Cost Breakdown</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Materials Sub */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Package className="w-3 h-3" /> Materials</h4>
                                <div className="space-y-2 mb-3">
                                    {materials.map(m => (
                                        <div key={m.id} className="flex justify-between text-sm">
                                            <span className="text-slate-400 truncate pr-4">{m.quantity}x {m.item_name}</span>
                                            <span className="text-slate-300 whitespace-nowrap">Rp {(m.quantity * m.unit_cost).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-sm font-medium pt-2 border-t border-slate-800">
                                    <span className="text-slate-400">Materials Subtotal</span>
                                    <span className="text-white">Rp {totalMaterialsCost.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Labor Sub */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><User className="w-3 h-3" /> Labor ({labor?.workers} workers • {labor?.days} days)</h4>
                                <div className="flex justify-between text-sm font-medium border-slate-800">
                                    <span className="text-slate-400">Labor Subtotal</span>
                                    <span className="text-white">Rp {totalLaborCost.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Total Base Cost */}
                            <div className="pt-4 border-t border-slate-700 border-dashed flex justify-between text-base font-medium">
                                <span className="text-slate-300">Total Net Cost</span>
                                <span className="text-slate-300">Rp {baseCost.toLocaleString('id-ID')}</span>
                            </div>

                            {/* Admin Margin Area */}
                            {isAdmin && (
                                <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2"><Banknote className="w-4 h-4" /> Admin Financials</h4>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Risk Margin ({marginPercent * 100}%)</span>
                                        <span className="text-green-400 font-medium">+ Rp {marginValue.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="pt-3 border-t border-primary/20 flex flex-col gap-1">
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Recommended Client Price</span>
                                            <span className="text-2xl font-bold text-white tracking-tight">Rp {recommendedPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
