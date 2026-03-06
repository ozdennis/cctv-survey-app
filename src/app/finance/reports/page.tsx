"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MonthlyPnL = { period_month: string; business_unit: string; revenue: number; cogs: number; opex: number; gross_profit: number; gross_margin_percent: number; net_income: number; net_margin_percent: number; };
type BusinessUnitSummary = { business_unit: string; total_revenue: number; total_cogs: number; total_opex: number; gross_profit: number; gross_margin_percent: number; net_profit: number; };
type TaxReserve = { reserve_month: string; business_unit: string; revenue_total: number; tax_reserve_amount: number; };
type CashFlowDay = { transaction_date: string; business_unit: string; cash_in: number; cash_out: number; net_cash_flow: number; };

export default function FinanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'cashflow' | 'tax'>('overview');
  const [monthlyPnl, setMonthlyPnl] = useState<MonthlyPnL[]>([]);
  const [buSummary, setBuSummary] = useState<BusinessUnitSummary[]>([]);
  const [taxReserves, setTaxReserves] = useState<TaxReserve[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowDay[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedBU, setSelectedBU] = useState<string>('all');

  const refresh = async () => {
    setError(null);
    try {
      const [pnlRes, buRes, taxRes, cfRes] = await Promise.all([
        supabase.schema('finance').from('monthly_pnl_view').select('*').order('period_month', { ascending: false }),
        supabase.schema('finance').from('business_unit_summary_view').select('*'),
        supabase.schema('finance').from('tax_reserve_view').select('*').order('reserve_month', { ascending: false }),
        supabase.schema('finance').from('cash_flow_daily_view').select('*').order('transaction_date', { ascending: false }).limit(30),
      ]);
      if (pnlRes.error) throw pnlRes.error;
      if (buRes.error) throw buRes.error;
      if (taxRes.error) throw taxRes.error;
      if (cfRes.error) throw cfRes.error;
      setMonthlyPnl(pnlRes.data || []);
      setBuSummary(buRes.data || []);
      setTaxReserves(taxRes.data || []);
      setCashFlow(cfRes.data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const totals = buSummary.reduce((acc, bu) => ({ revenue: acc.revenue + bu.total_revenue, cogs: acc.cogs + bu.total_cogs, opex: acc.opex + bu.total_opex, net: acc.net + bu.net_profit }), { revenue: 0, cogs: 0, opex: 0, net: 0 });

  return (
    <div className='mx-auto max-w-7xl px-4 py-10 space-y-6'>
      <div className='flex items-center justify-between'>
        <div><h1 className='text-2xl font-bold text-white'>Finance Reports</h1><p className='text-sm text-slate-400'>P&L, cash flow, and tax reserve analytics</p></div>
        <button onClick={refresh} className='text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800'>Refresh</button>
      </div>
      {error && <div className='rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm'>{error}</div>}
      <div className='flex gap-2 border-b border-slate-800'>
        {[{id:'overview',label:'Overview'},{id:'pnl',label:'P&L Statement'},{id:'cashflow',label:'Cash Flow'},{id:'tax',label:'Tax Reserve'}].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} className={'px-4 py-2 text-sm font-medium border-b-2 transition-colors '+(activeTab===tab.id?'border-emerald-500 text-emerald-400':'border-transparent text-slate-400 hover:text-slate-300')}>{tab.label}</button>
        ))}
      </div>
      {loading ? <div className='text-sm text-slate-400'>Loading reports...</div> : (
        <div className='space-y-6'>
          {activeTab==='overview' && (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4'><div className='text-xs text-emerald-400'>Total Revenue</div><div className='text-xl font-bold text-emerald-300'>Rp {totals.revenue.toLocaleString('id-ID')}</div></div>
              <div className='rounded-xl border border-amber-900/40 bg-amber-950/20 p-4'><div className='text-xs text-amber-400'>Total COGS</div><div className='text-xl font-bold text-amber-300'>Rp {totals.cogs.toLocaleString('id-ID')}</div></div>
              <div className='rounded-xl border border-slate-700 bg-slate-800/40 p-4'><div className='text-xs text-slate-400'>Total OPEX</div><div className='text-xl font-bold text-slate-300'>Rp {totals.opex.toLocaleString('id-ID')}</div></div>
              <div className={'rounded-xl border p-4 '+(totals.net>=0?'border-emerald-900/40 bg-emerald-950/20':'border-rose-900/40 bg-rose-950/20')}><div className={'text-xs '+(totals.net>=0?'text-emerald-400':'text-rose-400')}>Net Income</div><div className={'text-xl font-bold '+(totals.net>=0?'text-emerald-300':'text-rose-300')}>Rp {totals.net.toLocaleString('id-ID')}</div></div>
            </div>
          )}
          {activeTab==='pnl' && (
            <div className='rounded-2xl border border-slate-800 bg-slate-900/60 p-5'>
              <h2 className='text-sm font-semibold text-slate-200 mb-4'>Monthly P&L Statement</h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-slate-800 text-left text-slate-400'>
                      <th className='pb-3 pr-4 font-medium'>Period</th>
                      <th className='pb-3 pr-4 font-medium'>Business Unit</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Revenue</th>
                      <th className='pb-3 pr-4 font-medium text-right'>COGS</th>
                      <th className='pb-3 pr-4 font-medium text-right'>OPEX</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Gross Profit</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Margin %</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Net Income</th>
                    </tr>
                  </thead>
                  <tbody className='text-slate-300'>
                    {monthlyPnl.map((pnl) => (
                      <tr key={pnl.period_month+pnl.business_unit} className='border-b border-slate-800/50'>
                        <td className='py-3 pr-4'>{pnl.period_month}</td>
                        <td className='py-3 pr-4 capitalize'>{pnl.business_unit}</td>
                        <td className='py-3 pr-4 text-right text-emerald-400'>Rp {pnl.revenue.toLocaleString('id-ID')}</td>
                        <td className='py-3 pr-4 text-right text-amber-400'>Rp {pnl.cogs.toLocaleString('id-ID')}</td>
                        <td className='py-3 pr-4 text-right text-slate-400'>Rp {pnl.opex.toLocaleString('id-ID')}</td>
                        <td className='py-3 pr-4 text-right'>Rp {pnl.gross_profit.toLocaleString('id-ID')}</td>
                        <td className='py-3 pr-4 text-right'>
                          <span className={'px-2 py-0.5 rounded-full text-xs '+(pnl.gross_margin_percent>=30?'bg-emerald-900/40 text-emerald-300':pnl.gross_margin_percent>=15?'bg-amber-900/40 text-amber-300':'bg-rose-900/40 text-rose-300')}>
                            {pnl.gross_margin_percent}%
                          </span>
                        </td>
                        <td className={'py-3 pr-4 text-right font-semibold '+(pnl.net_income>=0?'text-emerald-400':'text-rose-400')}>
                          Rp {pnl.net_income.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab==='cashflow' && (
            <div className='rounded-2xl border border-slate-800 bg-slate-900/60 p-5'>
              <h2 className='text-sm font-semibold text-slate-200 mb-4'>Daily Cash Flow (Last 30 Days)</h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-slate-800 text-left text-slate-400'>
                      <th className='pb-3 pr-4 font-medium'>Date</th>
                      <th className='pb-3 pr-4 font-medium'>Business Unit</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Cash In</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Cash Out</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Net Flow</th>
                    </tr>
                  </thead>
                  <tbody className='text-slate-300'>
                    {cashFlow.map((cf) => (
                      <tr key={cf.transaction_date+cf.business_unit} className='border-b border-slate-800/50'>
                        <td className='py-3 pr-4'>{cf.transaction_date}</td>
                        <td className='py-3 pr-4 capitalize'>{cf.business_unit}</td>
                        <td className='py-3 pr-4 text-right text-emerald-400'>+ Rp {cf.cash_in.toLocaleString('id-ID')}</td>
                        <td className='py-3 pr-4 text-right text-rose-400'>- Rp {cf.cash_out.toLocaleString('id-ID')}</td>
                        <td className={'py-3 pr-4 text-right font-semibold '+(cf.net_cash_flow>=0?'text-emerald-400':'text-rose-400')}>
                          Rp {cf.net_cash_flow.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab==='tax' && (
            <div className='rounded-2xl border border-slate-800 bg-slate-900/60 p-5'>
              <h2 className='text-sm font-semibold text-slate-200 mb-4'>Tax Reserve Calculator (0.5% of Revenue)</h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-slate-800 text-left text-slate-400'>
                      <th className='pb-3 pr-4 font-medium'>Month</th>
                      <th className='pb-3 pr-4 font-medium'>Business Unit</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Revenue</th>
                      <th className='pb-3 pr-4 font-medium text-right'>Tax Reserve (0.5%)</th>
                    </tr>
                  </thead>
                  <tbody className='text-slate-300'>
                    {taxReserves.map((tax) => (
                      <tr key={tax.reserve_month+tax.business_unit} className='border-b border-slate-800/50'>
                        <td className='py-3 pr-4'>{tax.reserve_month}</td>
                        <td className='py-3 pr-4 capitalize'>{tax.business_unit}</td>
                        <td className='py-3 pr-4 text-right text-emerald-400'>Rp {tax.revenue_total.toLocaleString('id-ID')}</td>
                        <td className='py-3 pr-4 text-right font-semibold text-purple-400'>Rp {tax.tax_reserve_amount.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
