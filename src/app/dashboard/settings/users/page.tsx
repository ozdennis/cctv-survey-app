"use client";

import { useState, useEffect } from "react";
import { User, ShieldAlert, ShieldCheck, Mail, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
    id: string;
    email?: string | null;
    full_name?: string | null;
    company_name?: string | null;
    status?: string | null;
    roles?: string[];
    company_name: string | null;
    created_at: string;
}

type AppRole = 'admin' | 'sales' | 'vendor' | 'finance' | 'customer_support' | 'customer';

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            type RoleRow = { role_code: string };
            type UserRoleRow = { user_id: string; role_code: string };
            type CoreUserRow = {
                id: string;
                email: string | null;
                full_name: string | null;
                company_name: string | null;
                status: string | null;
                created_at: string;
            };

            setLoading(true);

            // Get current logged-in user to see if they are admin
            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) {
                const { data: myRoles } = await supabase
                    .schema('core')
                    .from('user_roles')
                    .select('role_code')
                    .eq('user_id', authData.user.id);

                const roleCodes = ((myRoles as RoleRow[] | null) || []).map((r) => String(r.role_code || '').toLowerCase());
                setCurrentUserRole(roleCodes.includes('admin') ? 'admin' : (roleCodes[0] || null));
            }

            // Fetch users (admin only)
            const { data: coreUsers, error: coreUsersErr } = await supabase
                .schema('core')
                .from('users')
                .select('id,email,full_name,company_name,status,created_at')
                .order('created_at', { ascending: false });

            const { data: allRoles, error: rolesErr } = await supabase
                .schema('core')
                .from('user_roles')
                .select('user_id,role_code');

            if (coreUsers && !coreUsersErr) {
                const rolesByUser = new Map<string, string[]>();
                for (const r of (allRoles as UserRoleRow[] | null) || []) {
                    const uid = String(r.user_id);
                    const role = String(r.role_code || '').toLowerCase();
                    const cur = rolesByUser.get(uid) || [];
                    rolesByUser.set(uid, [...cur, role]);
                }

                setUsers(
                    ((coreUsers as CoreUserRow[] | null) || []).map((u) => ({
                        id: u.id,
                        email: u.email,
                        full_name: u.full_name,
                        company_name: u.company_name,
                        status: u.status,
                        created_at: u.created_at,
                        roles: rolesByUser.get(String(u.id)) || [],
                    }))
                );
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const approveAndAssignRole = async (userId: string, role: AppRole) => {
        if (currentUserRole !== 'admin') {
            alert("Only administrators can change user roles.");
            return;
        }

        const u = users.find(x => x.id === userId);

        let vendorId: string | null = null;
        let accountId: string | null = null;

        if (role === 'vendor') {
            const vendorName = u?.company_name || u?.full_name || u?.email || 'Vendor';
            const { data: vendor, error: vErr } = await supabase
                .schema('core')
                .from('vendors')
                .insert({ name: vendorName })
                .select('id')
                .single();
            if (vErr) {
                alert("Failed to create vendor profile: " + vErr.message);
                return;
            }
            vendorId = vendor?.id || null;
        }

        if (role === 'customer') {
            const accountName = u?.company_name || u?.full_name || u?.email || 'Customer';
            const { data: account, error: aErr } = await supabase
                .schema('core')
                .from('accounts')
                .insert({ name: accountName })
                .select('id')
                .single();
            if (aErr) {
                alert("Failed to create customer account: " + aErr.message);
                return;
            }
            accountId = account?.id || null;
        }

        const { error: roleErr } = await supabase
            .schema('core')
            .from('user_roles')
            .insert({
                user_id: userId,
                role_code: role,
                vendor_id: vendorId,
                account_id: accountId,
            });

        if (roleErr) {
            alert("Failed to assign role: " + roleErr.message);
            return;
        }

        const { error: statusErr } = await supabase
            .schema('core')
            .from('users')
            .update({ status: 'active' })
            .eq('id', userId);

        if (statusErr) {
            alert("Role assigned, but failed to activate user: " + statusErr.message);
            return;
        }

        setUsers(
            users.map(row =>
                row.id === userId
                    ? { ...row, status: 'active', roles: Array.from(new Set([...(row.roles || []), role])) }
                    : row
            )
        );
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
                                                <span className="font-medium text-white block">{user.full_name || user.email || "Unnamed User"}</span>
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
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${(user.roles || []).includes('admin') ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                            {(user.roles || []).includes('admin') ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {(user.roles || []).includes('admin') ? 'Administrator' : ((user.roles || [])[0] || 'Pending')}
                                        </span>
                                        <div className="mt-1 text-[11px] text-slate-500">
                                            Status: <span className="font-semibold">{user.status || 'pending'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {currentUserRole === 'admin' ? (
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {(['sales', 'vendor', 'finance', 'customer_support', 'customer', 'admin'] as AppRole[]).map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => approveAndAssignRole(user.id, r)}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
                                                    >
                                                        Approve as {r}
                                                    </button>
                                                ))}
                                            </div>
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
