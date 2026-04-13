import { Download, BarChart3 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

export default function Reports() {
  return (
    <div className="p-4 md:p-8 page-enter">
      <PageHeader
        title="דוחות פיננסיים"
        subtitle="ניתוח רווח והפסד, Food Cost ומע״מ"
        actions={
          <button className="btn-secondary" disabled>
            <Download size={15} /> ייצוא PDF
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-card p-16 text-center">
        <div className="w-14 h-14 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={24} className="text-slate-300" />
        </div>
        <p className="font-semibold text-navy-800 mb-1">אין נתונים להצגה</p>
        <p className="text-slate-400 text-sm">דוחות יופיעו לאחר הזנת חשבוניות ונתוני מחזור</p>
      </div>
    </div>
  );
}
