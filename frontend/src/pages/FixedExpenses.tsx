import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import type { FixedExpense } from '../types';
import PageHeader from '../components/common/PageHeader';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);

const freqLabel: Record<string, string> = {
  monthly: 'חודשי',
  yearly: 'שנתי',
  one_time: 'חד-פעמי',
};

const categoryColors: Record<string, string> = {
  'נדלן': 'bg-blue-100 text-blue-700',
  'תשתיות': 'bg-amber-100 text-amber-700',
  'כוח אדם': 'bg-purple-100 text-purple-700',
  'ביטוח': 'bg-green-100 text-green-700',
  'תחזוקה': 'bg-orange-100 text-orange-700',
  'שיווק': 'bg-pink-100 text-pink-700',
  'רגולציה': 'bg-red-100 text-red-700',
  'טכנולוגיה': 'bg-cyan-100 text-cyan-700',
};

function monthlyAmount(e: FixedExpense) {
  return e.frequency === 'yearly' ? e.amount / 12 : e.frequency === 'monthly' ? e.amount : 0;
}

export default function FixedExpenses() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'תשתיות', amount: '', frequency: 'monthly' as const });

  const totalMonthly = expenses.filter(e => e.active).reduce((s, e) => s + monthlyAmount(e), 0);

  const byCategory = expenses.filter(e => e.active && e.frequency === 'monthly').reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const handleDelete = (id: number) => setExpenses(prev => prev.filter(e => e.id !== id));
  const handleToggle = (id: number) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e));

  return (
    <div className="p-4 md:p-8 page-enter">
      <PageHeader
        title="הוצאות קבועות"
        subtitle="ניהול הוצאות חוזרות חודשיות ושנתיות"
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> הוסף הוצאה
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="kpi-card col-span-2 md:col-span-1">
          <p className="text-slate-400 text-xs mb-1">סה״כ חודשי</p>
          <p className="font-display text-2xl font-semibold text-navy-800">{fmt(totalMonthly)}</p>
        </div>
        {Object.entries(byCategory).slice(0, 3).map(([cat, amt]) => (
          <div key={cat} className="kpi-card">
            <p className="text-slate-400 text-xs mb-1">{cat}</p>
            <p className="font-display text-xl font-semibold text-navy-800">{fmt(amt as number)}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6 border-2 border-gold-300/40 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-800">הוצאה חדשה</h3>
            <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-lg hover:bg-cream-100 flex items-center justify-center">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="שם הוצאה" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
            <input placeholder="קטגוריה" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field" />
            <input type="number" placeholder="סכום (₪)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="input-field" />
            <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value as any }))} className="input-field">
              <option value="monthly">חודשי</option>
              <option value="yearly">שנתי</option>
              <option value="one_time">חד-פעמי</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">ביטול</button>
            <button
              onClick={() => {
                if (form.name && form.amount) {
                  setExpenses(prev => [...prev, {
                    id: Date.now(), name: form.name, category: form.category,
                    amount: Number(form.amount), frequency: form.frequency,
                    effective_date: '2026-04-13', active: true,
                  }]);
                  setShowAdd(false);
                  setForm({ name: '', category: 'תשתיות', amount: '', frequency: 'monthly' });
                }
              }}
              className="btn-primary"
            >
              <Save size={14} /> שמור
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="table-header text-right">שם ההוצאה</th>
              <th className="table-header text-right">קטגוריה</th>
              <th className="table-header text-center">תדירות</th>
              <th className="table-header text-center">סכום</th>
              <th className="table-header text-center">חודשי שקול</th>
              <th className="table-header text-center">סטטוס</th>
              <th className="table-header text-center">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={exp.id} className={`animate-fade-up ${!exp.active ? 'opacity-50' : ''}`} style={{ animationDelay: `${i * 30}ms` }}>
                <td className="table-cell">
                  {editId === exp.id ? (
                    <input defaultValue={exp.name} className="input-field py-1 text-sm" />
                  ) : (
                    <span className="font-medium text-navy-800">{exp.name}</span>
                  )}
                </td>
                <td className="table-cell">
                  <span className={`badge text-xs ${categoryColors[exp.category] ?? 'bg-slate-100 text-slate-600'}`}>
                    {exp.category}
                  </span>
                </td>
                <td className="table-cell text-center text-slate-600 text-sm">{freqLabel[exp.frequency]}</td>
                <td className="table-cell text-center font-mono font-semibold text-navy-800">{fmt(exp.amount)}</td>
                <td className="table-cell text-center font-mono text-slate-500 text-sm">
                  {exp.frequency === 'yearly' ? fmt(exp.amount / 12) : exp.frequency === 'monthly' ? fmt(exp.amount) : '—'}
                </td>
                <td className="table-cell text-center">
                  <button onClick={() => handleToggle(exp.id)}>
                    <span className={`badge ${exp.active ? 'badge-success' : 'badge-manual'}`}>
                      {exp.active ? 'פעיל' : 'מושהה'}
                    </span>
                  </button>
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setEditId(editId === exp.id ? null : exp.id)}
                      className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors"
                    >
                      <Edit2 size={13} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={13} className="text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-navy-900">
              <td colSpan={3} className="px-4 py-3 text-gold-300 text-sm font-semibold">סה״כ חודשי</td>
              <td />
              <td className="px-4 py-3 text-center font-mono font-bold text-gold-400">{fmt(totalMonthly)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    </div>
  );
}
