import { useState, useEffect } from 'react';
import { X, Download, AlertTriangle, CheckCircle, ZoomIn, Edit3, ScanLine, FileText, Loader2 } from 'lucide-react';
import type { Invoice, InvoiceItem } from '../../types';
import { supabase } from '../../lib/supabase';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceDetailModal({ invoice, onClose }: Props) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoice.id)
      .then(({ data }) => {
        if (data) setItems(data as InvoiceItem[]);
        setLoadingItems(false);
      });
  }, [invoice.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <span className={invoice.entry_method === 'ocr' ? 'badge-ocr' : 'badge-manual'}>
              {invoice.entry_method === 'ocr' ? <><ScanLine size={10} /> OCR</> : <><FileText size={10} /> ידנית</>}
            </span>
            <div>
              <h2 className="font-display font-semibold text-navy-800">{invoice.supplier_name}</h2>
              <p className="text-slate-500 text-xs">{invoice.invoice_number} · {formatDate(invoice.invoice_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs py-2 px-3">
              <Edit3 size={13} /> ערוך
            </button>
            {invoice.image_url && (
              <button className="btn-secondary text-xs py-2 px-3">
                <Download size={13} /> הורד
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream-100 flex items-center justify-center transition-colors">
              <X size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content: Split view */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: image */}
          {invoice.image_url ? (
            <div className="w-80 flex-shrink-0 bg-cream-100 border-l border-cream-200 relative overflow-hidden">
              <img
                src={invoice.image_url}
                alt="תמונת חשבונית"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-navy-900/40">
                <div className="bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2 text-navy-800 text-sm">
                  <ZoomIn size={14} /> הגדל
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy-900/80 to-transparent p-4">
                <p className="text-white/70 text-xs">תמונת חשבונית מקורית</p>
              </div>
            </div>
          ) : (
            <div className="w-80 flex-shrink-0 bg-cream-100 border-l border-cream-200 flex items-center justify-center">
              <div className="text-center">
                <FileText size={40} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">אין תמונה</p>
              </div>
            </div>
          )}

          {/* Right: extracted data */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Alerts */}
            {invoice.notes && (
              <div className="mb-4 p-3 bg-red-50 border border-danger/20 rounded-xl flex gap-3">
                <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{invoice.notes}</p>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-cream-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 mb-1">לפני מע״מ</p>
                <p className="font-semibold text-navy-800 text-sm">{fmt(invoice.subtotal)}</p>
              </div>
              <div className="bg-cream-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 mb-1">מע״מ (17%)</p>
                <p className="font-semibold text-navy-800 text-sm">{fmt(invoice.vat_amount)}</p>
              </div>
              <div className="bg-navy-900 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gold-400 mb-1">סה״כ לתשלום</p>
                <p className="font-semibold text-white text-sm">{fmt(invoice.total_with_vat)}</p>
              </div>
            </div>

            {/* Items table */}
            <h3 className="text-sm font-semibold text-navy-800 mb-3">
              פריטים {!loadingItems && `(${items.length})`}
            </h3>
            {loadingItems ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" /> טוען פריטים...
              </div>
            ) : items.length === 0 ? (
              <p className="text-slate-400 text-sm">אין פריטים</p>
            ) : (
              <div className="rounded-xl overflow-hidden border border-cream-200">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header text-right">מוצר</th>
                      <th className="table-header text-center">הוזמן</th>
                      <th className="table-header text-center">התקבל</th>
                      <th className="table-header text-center">מחיר יח׳</th>
                      <th className="table-header text-left">סה״כ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className={item.discrepancy !== 0 || (item.price_change_pct ?? 0) > 5 ? 'bg-red-50/50' : ''}>
                        <td className="table-cell">
                          <div>
                            <p className="font-medium text-navy-800">{item.product_name}</p>
                            <p className="text-[10px] text-slate-400">{item.unit}</p>
                          </div>
                        </td>
                        <td className="table-cell text-center text-slate-600">{item.quantity_ordered}</td>
                        <td className="table-cell text-center">
                          <span className={item.discrepancy < 0 ? 'text-danger font-semibold' : 'text-slate-600'}>
                            {item.quantity_received}
                            {item.discrepancy < 0 && (
                              <span className="text-[10px] text-danger mr-1">({item.discrepancy})</span>
                            )}
                          </span>
                        </td>
                        <td className="table-cell text-center">
                          <div>
                            <p className={`text-sm ${(item.price_change_pct ?? 0) > 5 ? 'text-danger font-semibold' : 'text-slate-600'}`}>
                              {fmt(item.unit_price)}
                            </p>
                            {(item.price_change_pct ?? 0) > 0 && item.expected_price && (
                              <p className="text-[10px] text-danger">+{item.price_change_pct?.toFixed(1)}%</p>
                            )}
                          </div>
                        </td>
                        <td className="table-cell text-left font-mono font-medium text-navy-800">
                          {fmt(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 flex items-center gap-2">
              {invoice.has_alerts ? (
                <span className="badge badge-alert"><AlertTriangle size={10} /> נמצאו אי-התאמות</span>
              ) : (
                <span className="badge badge-success"><CheckCircle size={10} /> הכל תקין</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
