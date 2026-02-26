"use client";

import { useState, useEffect } from "react";
import { User, ShieldAlert, ShieldCheck, Mail, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
    id: string;
    name: string | null;
    role: string;
    company_name: string | null;
    created_at: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);

            // Get current logged-in user to see if they are admin
            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) {
                const { data: myProfile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();

                setCurrentUserRole(myProfile?.role || 'vendor');
            }

            // Fetch all users
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && !error) {
                setUsers(data);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const toggleRole = async (userId: string, currentRole: string) => {
        if (currentUserRole !== 'admin') {
            alert("Only administrators can change user roles.");
            return;
        }

        const newRole = currentRole === 'admin' ? 'vendor' : 'admin';
        const { data, error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)
            .select();

        if (error || !data) {
            alert("Failed to update user role: " + (error?.message || "Permission restricted by database rules."));
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User & Team Management</h1>
                    <p className="text-sm text-slate-400">View team members and manage their system access.</p>
                </div>
            </div>

            {currentUserRole !== 'admin' && !loading && (
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-3 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">You are viewing this page as a Vendor. You cannot modify user access levels.</p>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 shadow-lg rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">User Profile</th>
                                <th className="px-6 py-4 font-medium">Joined Date</th>
                                <th className="px-6 py-4 font-medium">Status / Role</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading user profiles...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No users found.</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary border border-slate-700">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-white block">{user.name || "Unnamed User"}</span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Briefcase className="w-3 h-3" />
                                                    {user.company_name || "Independent"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                            {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {user.role === 'admin' ? 'Administrator' : 'Vendor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {currentUserRole === 'admin' ? (
                                            <button
                                                onClick={() => toggleRole(user.id, user.role)}
                                                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${user.role === 'admin' ? 'border-rose-900/50 text-rose-400 hover:bg-rose-950/30' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30'}`}
                                            >
                                                {user.role === 'admin' ? "Demote to Vendor" : "Promote to Admin"}
                                            </button>
                                        ) : (
                                            <span className="text-sm text-slate-600 italic">Restricted</span>
                                        )}
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
