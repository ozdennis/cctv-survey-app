'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { User, Buildings, MapPin, Hash, CaretLeft } from '@phosphor-icons/react';
import Link from 'next/link';

export default function NewSalesInquiry() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // We strictly let Supabase server-side defaults handle the ID and Trigger handle SO-XXXX generation
    const [formData, setFormData] = useState({
        client_name: '',
        client_type: 'commercial', // commercial, residential, industrial
        client_address: '',
        client_phone: '',
        notes: ''
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('Authentication error. Please log in.');
            setLoading(false);
            return;
        }

        // Insert new lead/SO as draft
        const { data, error } = await supabase
            .from('sales_orders')
            .insert({
                sales_id: user.id, // Ensure the current user is recorded as the owner
                client_name: formData.client_name,
                status: 'draft',
                // other fields could be mapped to structured JSON or extended columns
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            alert('Failed to generate Sales Order: ' + error.message);
            setLoading(false);
            return;
        }

        // Redirect back to pipeline after success
        router.push('/sales');
    };

    return (
        <div className="max-w-2xl mx-auto font-inter mt-8">
            <Link href="/sales" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 mb-8 transition-colors">
                <CaretLeft weight="bold" /> Back to Pipeline
            </Link>

            <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-3xl font-syne font-bold text-slate-900 mb-2">New Sales Inquiry</h2>
                <p className="text-slate-500 mb-8">Record a new lead and generate an official Sales Order.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Client / Company Name *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Buildings className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                className="pl-12 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-slate-900"
                                placeholder="PT. XYZ Manufacturing"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Client Type</label>
                            <select
                                value={formData.client_type}
                                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-slate-900"
                            >
                                <option value="commercial">Commercial / Office</option>
                                <option value="industrial">Industrial / Factory</option>
                                <option value="residential">Residential</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Contact Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.client_phone}
                                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                    className="pl-12 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-slate-900"
                                    placeholder="+62 8..."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Site Address</label>
                        <div className="relative">
                            <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <textarea
                                rows={3}
                                value={formData.client_address}
                                onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                                className="pl-12 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-slate-900 resize-none"
                                placeholder="Enter full address for survey..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {loading ? 'Creating Order...' : 'Create Sales Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
