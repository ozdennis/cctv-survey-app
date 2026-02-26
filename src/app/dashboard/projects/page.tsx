"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Project {
    id: string;
    client_name: string;
    category: string;
    status: string;
    created_at: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
            if (data && !error) setProjects(data);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "submitted": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "approved": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "rejected": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
            case "draft": return "bg-slate-800 text-slate-300 border-slate-700";
            default: return "bg-slate-800 text-slate-300";
        }
    };

    const filteredProjects = projects.filter(p => p.client_name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Project Surveys</h1>
                    <p className="text-sm text-slate-400">Manage your survey drafts and submissions.</p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create New Survey
                </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search projects by name..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Project Name</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading projects...</td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No projects found.</td>
                                </tr>
                            ) : filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-primary shadow-sm border border-slate-700">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-white">{project.client_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{project.category}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{new Date(project.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                                            View details
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
