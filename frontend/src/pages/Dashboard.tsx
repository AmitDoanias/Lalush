import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Percent, Receipt, Banknote } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { Alert, MonthlyData, CategoryExpense } from '../types';
import PageHeader from '../components/common/PageHeader';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  accent?: string;
  delay?: string;
}

function KpiCard({ label, value, icon, trend, accent = 'bg-gold-100 text-gold-500', delay = '0ms' }: KpiProps) {
  return (
    <div className="kpi-card animate-fade-up" style={{ animationDelay: delay }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold text-navy-800">{value}</p>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-900 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Alert Item ──────────────────────────────────────────────────────────────

function AlertItem({ alert }: { alert: Alert }) {
  const colorMap: Record<string, string> = {
    price_change: 'border-danger/30 bg-red-50',
    shortage: 'border-warning/30 bg-amber-50',
    ratio_alert: 'border-blue-200 bg-blue-50',
  };
  const iconColor: Record<string, string> = {
    price_change: 'text-danger',
    shortage: 'text-warning',
    ratio_alert: 'text-blue-500',
  };
  const typeLabel: Record<string, string> = {
    price_change: 'שינוי מחיר',
    shortage: 'חוסר בסחורה',
    ratio_alert: 'יחס הוצאות',
  };

  return (
    <div className={`flex gap-3 p-3.5 rounded-xl border ${colorMap[alert.type]} animate-fade-up`}>
      <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${iconColor[alert.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-navy-800 mb-0.5">{typeLabel[alert.type]}</p>
        <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

const EMPTY_MONTH = {
  revenue: 0, food_cost: 0, food_cost_pct: 0, fixed_expenses: 0,
  total_expenses: 0, gross_profit: 0, vat_payable: 0, net_profit: 0,
};

export default function Dashboard() {
  const current_month = EMPTY_MONTH;
  const monthly_trend: MonthlyData[] = [];
  const expense_breakdown: CategoryExpense[] = [];
  const unresolvedAlerts: Alert[] = [];

  return (
    <div className="p-8 page-enter">
      <PageHeader
        title="דשבורד"
        subtitle="מרץ 2026 — סקירה כללית"
        badge={{ label: `${unresolvedAlerts.length} התראות`, color: unresolvedAlerts.length > 0 ? 'red' : 'green' }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          label="מחזור חודשי"
          value={fmt(current_month.revenue)}
          icon={<DollarSign size={18} />}
          trend={7.4}
          delay="0ms"
        />
        <KpiCard
          label="Food Cost %"
          value={fmtPct(current_month.food_cost_pct)}
          icon={<Percent size={18} />}
          trend={-1.2}
          accent="bg-blue-50 text-blue-500"
          delay="80ms"
        />
        <KpiCard
          label="רווח גולמי"
          value={fmt(current_month.gross_profit)}
          icon={<TrendingUp size={18} />}
          trend={3.8}
          accent="bg-emerald-50 text-success"
          delay="160ms"
        />
        <KpiCard
          label="מע״מ לתשלום"
          value={fmt(current_month.vat_payable)}
          icon={<Receipt size={18} />}
          accent="bg-purple-50 text-purple-500"
          delay="240ms"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {/* Line chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">מחזור מול הוצאות</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gold-400 inline-block rounded" /> מחזור</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-navy-700 inline-block rounded" /> הוצאות</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success inline-block rounded" /> רווח</span>
            </div>
          </div>
          {monthly_trend.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-300 gap-2">
              <TrendingUp size={28} className="opacity-30" />
              <p className="text-sm">נתונים יופיעו לאחר הזנת חשבוניות</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly_trend} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₪${(v/1000).toFixed(0)}K`}
                width={55}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="revenue" name="מחזור" stroke="#C9A84C" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#C9A84C' }} />
              <Line type="monotone" dataKey="expenses" name="הוצאות" stroke="#162C58" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" name="רווח" stroke="#10B981" strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: '400ms' }}>
          <h2 className="section-title mb-5">פילוח הוצאות</h2>
          {expense_breakdown.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-300 gap-2">
              <p className="text-sm">אין נתונים להצגה</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={expense_breakdown}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                nameKey="category"
              >
                {expense_breakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: unknown) => [fmt(val as number), '']}
                contentStyle={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
          <div className="mt-3 space-y-1.5">
            {expense_breakdown.slice(0, 5).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-slate-600">{cat.category}</span>
                </div>
                <span className="font-semibold text-navy-800">{cat.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: P&L summary + Alerts */}
      <div className="grid grid-cols-3 gap-5">
        {/* P&L mini */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: '480ms' }}>
          <h2 className="section-title mb-5">סיכום פיננסי — מרץ 2026</h2>
          <div className="space-y-0">
            {[
              { label: 'מחזור', value: current_month.revenue, type: 'main' },
              { label: '− עלות מזון (Food Cost)', value: current_month.food_cost, type: 'expense' },
              { label: '− הוצאות קבועות', value: current_month.fixed_expenses, type: 'expense' },
              { label: '= רווח גולמי', value: current_month.gross_profit, type: 'result' },
              { label: '− מע״מ לתשלום (נטו)', value: current_month.vat_payable, type: 'expense' },
              { label: '= רווח נקי', value: current_month.net_profit, type: 'final' },
            ].map((row) => (
              <div key={row.label} className={`flex items-center justify-between py-2.5 border-b border-cream-200 last:border-b-0 ${row.type === 'final' ? 'bg-navy-900 -mx-6 px-6 rounded-b-xl mt-1' : ''}`}>
                <span className={`text-sm ${row.type === 'final' ? 'text-gold-300 font-semibold' : row.type === 'result' ? 'text-navy-800 font-semibold' : 'text-slate-500'}`}>
                  {row.label}
                </span>
                <span className={`font-mono text-sm font-semibold ${row.type === 'final' ? 'text-gold-400' : row.type === 'expense' ? 'text-danger' : row.type === 'result' ? 'text-success' : 'text-navy-800'}`}>
                  {fmt(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: '560ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">התראות פעילות</h2>
            {unresolvedAlerts.length > 0 && (
              <span className="w-6 h-6 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center alert-pulse">
                {unresolvedAlerts.length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {unresolvedAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Banknote size={18} className="text-success" />
                </div>
                <p className="text-slate-500 text-sm">אין התראות פעילות</p>
              </div>
            ) : (
              unresolvedAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
