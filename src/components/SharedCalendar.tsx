"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar as CalendarIcon, Clock, User, ChevronRight } from "lucide-react";

export default function SharedCalendar() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoleAndSchedules = async () => {
            const { data: auth } = await supabase.auth.getUser();
            if (!auth.user) return;

            const { data: userRecord } = await supabase.from('users').select('role').eq('id', auth.user.id).single();
            const currentRole = userRecord?.role || 'vendor';
            setRole(currentRole);

            let query = supabase.from('schedule_entries').select('*').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(20);

            // Vendors only see their own schedules based on RLS, but we can explicitly filter just in case
            if (currentRole === 'vendor') {
                query = query.eq('assigned_to', auth.user.id);
            }

            const { data } = await query;
            if (data) setEvents(data);
            setLoading(false);
        };

        fetchRoleAndSchedules();

        // Realtime Subscription
        const channel = supabase.channel('public:schedule_entries')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_entries' }, (payload) => {
                fetchRoleAndSchedules(); // Easiest way to handle inserts/updates/deletes cleanly
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatTime = (ts: string) => {
        return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (ts: string) => {
        const d = new Date(ts);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return "Today";
        if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) return (
        <div className="p-6 border-l border-slate-800 bg-slate-900/40 h-full w-full max-w-xs flex flex-col items-center justify-center opacity-50">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-4 uppercase tracking-widest">Loading Calendar</p>
        </div>
    );

    return (
        <div className="w-80 border-l border-slate-800 bg-[#06080A] h-screen shrink-0 flex flex-col hidden lg:flex">
            <div className="p-6 border-b border-slate-800 bg-slate-900/20">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" /> Global Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-1">Live active dispatch queues</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {events.length === 0 ? (
                    <div className="text-center p-6 text-slate-500 text-sm">No upcoming dispatches.</div>
                ) : (
                    events.map((ev: any) => {
                        const isSurvey = ev.entry_type === 'survey';
                        const colorClass = isSurvey ? 'border-amber-500/20 bg-amber-500/5' : 'border-blue-500/20 bg-blue-500/5';
                        const textClass = isSurvey ? 'text-amber-400' : 'text-blue-400';

                        return (
                            <div key={ev.id} className={`p-4 rounded-xl border ${colorClass} hover:bg-slate-800/40 transition-colors cursor-pointer group`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900 ${textClass}`}>
                                        {ev.entry_type.replace('_', ' ')}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-300">{formatDate(ev.scheduled_at)}</div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {formatTime(ev.scheduled_at)}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-slate-200 truncate">{ev.title}</div>
                                {role !== 'vendor' && ev.assigned_to && (
                                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                                        <User className="w-3 h-3" /> Vendor ID: {ev.assigned_to.substring(0, 8)}...
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
            `}</style>
        </div>
    );
}
