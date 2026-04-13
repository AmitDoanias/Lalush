import { Plus, TrendingUp } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

export default function Suppliers() {
  return (
    <div className="p-4 md:p-8 page-enter">
      <PageHeader
        title="ספקים ומוצרים"
        subtitle="0 ספקים פעילים"
        actions={
          <button className="btn-primary">
            <Plus size={15} /> הוסף ספק
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-card p-16 text-center">
        <div className="w-14 h-14 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={24} className="text-slate-300" />
        </div>
        <p className="font-semibold text-navy-800 mb-1">אין ספקים רשומים</p>
        <p className="text-slate-400 text-sm">ספקים יתווספו אוטומטית בעת סריקת חשבוניות</p>
      </div>
    </div>
  );
}
