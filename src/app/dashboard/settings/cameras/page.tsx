"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Camera as CameraIcon, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CameraType {
    id: string;
    name: string;
    type: string;
    resolution: string;
}

export default function CameraSettingsPage() {
    const [cameras, setCameras] = useState<CameraType[]>([]);
    const [newCamera, setNewCamera] = useState({ name: "", type: "Indoor", resolution: "" });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchCameras = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('camera_types').select('*').order('created_at', { ascending: false });
        if (data && !error) setCameras(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.from('camera_types').insert([newCamera]).select();
        if (!error && data) {
            setCameras([data[0], ...cameras]);
            setNewCamera({ name: "", type: "Indoor", resolution: "" });
            setIsAdding(false);
        } else {
            alert("Error adding camera: " + (error?.message || "Unknown error"));
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('camera_types').delete().eq('id', id);
        if (!error) {
            setCameras(cameras.filter(c => c.id !== id));
        } else {
            alert("Error deleting camera.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Camera Types Management</h1>
                    <p className="text-sm text-slate-400">Add or remove camera models available for surveys.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"
                >
                    <Plus className="w-4 h-4" />
                    {isAdding ? "Cancel" : "Add Camera Model"}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 shadow-lg rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-medium text-white">Add New Camera</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Model Name</label>
                            <input required type="text" value={newCamera.name} onChange={e => setNewCamera({ ...newCamera, name: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Hikvision DS-2CD..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Category / Type</label>
                            <select value={newCamera.type} onChange={e => setNewCamera({ ...newCamera, type: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary outline-none">
                                <option>Indoor</option>
                                <option>Outdoor</option>
                                <option>PTZ</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Resolution</label>
                            <input required type="text" value={newCamera.resolution} onChange={e => setNewCamera({ ...newCamera, resolution: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 2MP, 4MP" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg">
                            Save Camera
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Model Name</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Resolution</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading cameras...</td>
                                </tr>
                            ) : cameras.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No cameras found. Add one above.</td>
                                </tr>
                            ) : cameras.map((camera) => (
                                <tr key={camera.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-primary border border-slate-700">
                                                <CameraIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-white">{camera.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{camera.type}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{camera.resolution}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(camera.id)} className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
