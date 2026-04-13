import { useState } from 'react';
import { Plus, Search, Filter, Camera, FileText, AlertTriangle, CheckCircle, Eye, ScanLine } from 'lucide-react';
import { mockInvoices } from '../data/mockData';
import type { Invoice } from '../types';
import PageHeader from '../components/common/PageHeader';
import InvoiceDetailModal from '../components/InvoiceDetail/InvoiceDetailModal';
import InvoiceUploadModal from '../components/InvoiceUpload/InvoiceUploadModal';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: '2-digit' });

// ─── Invoice Card ──────────────────────────────────────────────────────────

function InvoiceCard({ invoice, onView }: { invoice: Invoice; onView: () => void }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden group"
      onClick={onView}
    >
      {/* Thumbnail */}
      <div className="h-36 bg-cream-100 relative overflow-hidden">
        {invoice.image_url ? (
          <img
            src={invoice.image_url}
            alt="חשבונית"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={36} className="text-slate-300" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs font-medium flex items-center gap-1">
            <Eye size={13} /> צפה בפרטים
          </span>
        </div>
        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 flex-wrap">
          <span className={invoice.entry_method === 'ocr' ? 'badge-ocr' : 'badge-manual'}>
            {invoice.entry_method === 'ocr' ? <><ScanLine size={10} /> OCR</> : <><FileText size={10} /> ידנית</>}
          </span>
        </div>
        {invoice.has_alerts && (
          <div className="absolute top-2.5 left-2.5">
            <span className="badge badge-alert alert-pulse">
              <AlertTriangle size={10} /> התראה
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-navy-800 text-sm">{invoice.supplier_name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{invoice.invoice_number}</p>
          </div>
          <p className="text-xs text-slate-400">{formatDate(invoice.invoice_date)}</p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-200">
          <div>
            <p className="text-[10px] text-slate-400">כולל מע״מ</p>
            <p className="font-display font-semibold text-navy-800">{fmt(invoice.total_with_vat)}</p>
          </div>
          {invoice.has_alerts ? (
            <AlertTriangle size={15} className="text-danger" />
          ) : (
            <CheckCircle size={15} className="text-success" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function Invoices() {
  const [search, setSearch] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterAlerts, setFilterAlerts] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const suppliers = [...new Set(mockInvoices.map(i => i.supplier_name))];

  const filtered = mockInvoices.filter(inv => {
    if (search && !inv.supplier_name.includes(search) && !inv.invoice_number.includes(search)) return false;
    if (filterSupplier !== 'all' && inv.supplier_name !== filterSupplier) return false;
    if (filterMethod !== 'all' && inv.entry_method !== filterMethod) return false;
    if (filterAlerts && !inv.has_alerts) return false;
    return true;
  });

  return (
    <div className="p-8 page-enter">
      <PageHeader
        title="חשבוניות"
        subtitle={`${mockInvoices.length} חשבוניות בארכיון`}
        actions={
          <>
            <button className="btn-secondary" onClick={() => setShowUpload(true)}>
              <Camera size={15} /> סרוק חשבונית
            </button>
            <button className="btn-primary" onClick={() => setShowUpload(true)}>
              <Plus size={15} /> הוסף חשבונית
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש לפי ספק או מספר חשבונית..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pr-9"
          />
        </div>
        <select
          value={filterSupplier}
          onChange={e => setFilterSupplier(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">כל הספקים</option>
          {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterMethod}
          onChange={e => setFilterMethod(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">כל השיטות</option>
          <option value="ocr">OCR</option>
          <option value="manual">ידנית</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 whitespace-nowrap">
          <input
            type="checkbox"
            checked={filterAlerts}
            onChange={e => setFilterAlerts(e.target.checked)}
            className="rounded border-cream-300 text-danger focus:ring-danger"
          />
          <Filter size={13} />
          יש התראה
        </label>
        <span className="text-slate-400 text-sm mr-auto">{filtered.length} תוצאות</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <FileText size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">לא נמצאו חשבוניות</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((inv, i) => (
            <div key={inv.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <InvoiceCard invoice={inv} onView={() => setSelectedInvoice(inv)} />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
      {showUpload && (
        <InvoiceUploadModal onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}
