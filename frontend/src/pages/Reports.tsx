import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { mockMonthlyTrend, mockExpenseBreakdown } from '../data/mockData';
import PageHeader from '../components/common/PageHeader';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ─── P&L Table ────────────────────────────────────────────────────────────────

interface PnLRow {
  label: string;
  value: number;
  type: 'revenue' | 'expense' | 'subtotal' | 'result' | 'final' | 'detail';
  indent?: boolean;
}

function buildPnL(month: (typeof mockMonthlyTrend)[0]): PnLRow[] {
  const foodCost = month.food_cost;
  const fixed = 55650;
  const totalExpenses = foodCost + fixed;
  const grossProfit = month.revenue - totalExpenses;
  const vatPayable = month.revenue * 0.17 - totalExpenses * 0.17;
  const taxableIncome = grossProfit;
  const incomeTax = taxableIncome * 0.23;
  const netProfit = grossProfit - incomeTax;
  const foodCostPct = (foodCost / month.revenue) * 100;

  return [
    { label: 'מחזור', value: month.revenue, type: 'revenue' },
    { label: 'עלות מזון (Food Cost)', value: foodCost, type: 'expense', indent: true },
    { label: `Food Cost %: ${fmtPct(foodCostPct)}`, value: 0, type: 'detail', indent: true },
    { label: 'הוצאות קבועות', value: fixed, type: 'expense', indent: true },
    { label: 'סה״כ הוצאות', value: totalExpenses, type: 'subtotal' },
    { label: 'רווח גולמי', value: grossProfit, type: 'result' },
    { label: 'מע״מ לתשלום (נטו)', value: vatPayable, type: 'expense', indent: true },
    { label: 'הכנסה חייבת במס', value: taxableIncome, type: 'detail', indent: true },
    { label: 'מס הכנסה (23%)', value: incomeTax, type: 'expense', indent: true },
    { label: 'רווח נקי', value: netProfit, type: 'final' },
  ];
}

const MONTHS = mockMonthlyTrend.slice(0, 11);

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(10); // מרץ 26

  const month = MONTHS[selectedMonth];
  const pnlRows = buildPnL(month);
  const netProfit = pnlRows.find(r => r.label === 'רווח נקי')!.value;
  const netMargin = (netProfit / month.revenue) * 100;

  return (
    <div className="p-8 page-enter">
      <PageHeader
        title="דוחות פיננסיים"
        subtitle="ניתוח רווח והפסד, Food Cost ומע״מ"
        actions={
          <button className="btn-secondary">
            <Download size={15} /> ייצוא PDF
          </button>
        }
      />

      {/* Month selector */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-6 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">תקופה:</span>
        <div className="flex gap-2 flex-wrap">
          {MONTHS.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMonth === i
                  ? 'bg-navy-900 text-gold-400'
                  : 'bg-cream-100 text-slate-600 hover:bg-cream-200'
              }`}
            >
              {m.month}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* P&L Table */}
        <div className="col-span-2 bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <h2 className="section-title">דוח רווח והפסד — {month.month}</h2>
            <div className="flex items-center gap-3">
              <span className={`badge ${netProfit >= 0 ? 'badge-success' : 'badge-alert'}`}>
                שולי רווח נקי: {fmtPct(netMargin)}
              </span>
            </div>
          </div>
          <table className="w-full">
            <tbody>
              {pnlRows.map((row, i) => {
                if (row.type === 'detail' && row.value === 0) {
                  return (
                    <tr key={i} className="border-b border-cream-100">
                      <td className={`px-6 py-2 text-xs text-slate-400 italic ${row.indent ? 'pr-10' : ''}`}>{row.label}</td>
                      <td />
                    </tr>
                  );
                }
                return (
                  <tr
                    key={i}
                    className={`border-b border-cream-200 ${
                      row.type === 'final' ? 'bg-navy-900' :
                      row.type === 'result' ? 'bg-emerald-50' :
                      row.type === 'subtotal' ? 'bg-cream-100' : ''
                    }`}
                  >
                    <td className={`px-6 py-3 text-sm ${row.indent ? 'pr-10' : ''} ${
                      row.type === 'final' ? 'text-gold-300 font-semibold' :
                      row.type === 'result' ? 'text-success font-semibold' :
                      row.type === 'subtotal' ? 'text-navy-800 font-semibold' :
                      row.type === 'expense' ? 'text-slate-500' : 'text-navy-800 font-semibold'
                    }`}>
                      {row.indent && row.type === 'expense' && '− '}
                      {row.label}
                    </td>
                    <td className={`px-6 py-3 text-left font-mono font-semibold ${
                      row.type === 'final' ? 'text-gold-400' :
                      row.type === 'result' ? 'text-success' :
                      row.type === 'expense' ? 'text-danger' : 'text-navy-800'
                    }`}>
                      {row.value !== 0 ? fmt(Math.abs(row.value)) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Side cards */}
        <div className="space-y-4">
          {/* Food Cost breakdown */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="section-title mb-4">Food Cost לפי קטגוריה</h3>
            <div className="space-y-3">
              {mockExpenseBreakdown.slice(0, 5).map(cat => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">{cat.category}</span>
                    <span className="font-semibold text-navy-800">{fmtPct(cat.pct)}</span>
                  </div>
                  <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 12-month bar chart */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="section-title mb-4">רווח נקי 11 חודש</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={MONTHS} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(val: unknown) => [fmt(val as number), 'רווח']}
                  contentStyle={{ background: '#0A1628', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 11 }}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {MONTHS.map((_, i) => (
                    <Cell key={i} fill={i === selectedMonth ? '#C9A84C' : '#E5DDD0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* VAT summary */}
          <div className="bg-navy-900 rounded-2xl p-5">
            <h3 className="text-gold-400 font-semibold text-sm mb-3">סיכום מע״מ — {month.month}</h3>
            <div className="space-y-2">
              {[
                { label: 'מע״מ על מכירות', value: month.revenue * 0.17 },
                { label: 'מע״מ תשומות', value: (month.food_cost + 55650) * 0.17 },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">{row.label}</span>
                  <span className="font-mono text-white text-xs font-semibold">{fmt(row.value)}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="text-gold-300 text-xs font-semibold">מע״מ לתשלום</span>
                <span className="font-mono text-gold-400 text-sm font-bold">
                  {fmt(month.revenue * 0.17 - (month.food_cost + 55650) * 0.17)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
