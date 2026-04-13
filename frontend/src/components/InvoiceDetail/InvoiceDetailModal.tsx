import { useState, useEffect } from 'react';
import {
  X, Download, AlertTriangle, CheckCircle, ZoomIn, Edit3,
  ScanLine, FileText, Loader2, Save, Trash2, XCircle,
} from 'lucide-react';
import type { Invoice, InvoiceItem } from '../../types';
import { supabase } from '../../lib/supabase';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
}

type EditableItem = InvoiceItem & { _dirty?: boolean };

export default function InvoiceDetailModal({ invoice, onClose, onSaved, onDeleted }: Props) {
  const [items, setItems] = useState<EditableItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    supplier_name: invoice.supplier_name,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    subtotal: invoice.subtotal,
    vat_amount: invoice.vat_amount,
    total_with_vat: invoice.total_with_vat,
    notes: invoice.notes ?? '',
  });
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoice.id)
      .then(({ data }) => {
        if (data) {
          setItems(data as EditableItem[]);
          setEditItems(data as EditableItem[]);
        }
        setLoadingItems(false);
      });
  }, [invoice.id]);

  // ── Edit helpers ────────────────────────────────────────────────────────────

  const startEdit = () => {
    setForm({
      supplier_name: invoice.supplier_name,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      subtotal: invoice.subtotal,
      vat_amount: invoice.vat_amount,
      total_with_vat: invoice.total_with_vat,
      notes: invoice.notes ?? '',
    });
    setEditItems(items.map(i => ({ ...i })));
    setEditing(true);
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError(null);
  };

  const updateEditItem = (idx: number, field: keyof EditableItem, value: string | number) => {
    setEditItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value, _dirty: true };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const { error: invErr } = await supabase
        .from('invoices')
        .update({
          supplier_name: form.supplier_name,
          invoice_number: form.invoice_number,
          invoice_date: form.invoice_date,
          subtotal: Number(form.subtotal),
          vat_amount: Number(form.vat_amount),
          total_with_vat: Number(form.total_with_vat),
          notes: form.notes || null,
        })
        .eq('id', invoice.id);
      if (invErr) throw invErr;

      // Update each modified item
      const dirtyItems = editItems.filter(i => i._dirty);
      for (const item of dirtyItems) {
        const { error: itemErr } = await supabase
          .from('invoice_items')
          .update({
            product_name: item.product_name,
            unit: item.unit,
            quantity_ordered: Number(item.quantity_ordered),
            quantity_received: Number(item.quantity_received),
            unit_price: Number(item.unit_price),
            total: Number(item.total),
          })
          .eq('id', item.id);
        if (itemErr) throw itemErr;
      }

      // Reflect saved data locally
      setItems(editItems.map(i => ({ ...i, _dirty: false })));
      setEditing(false);
      onSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete helpers ──────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error: itemsErr } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoice.id);
      if (itemsErr) throw itemsErr;

      const { error: invErr } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);
      if (invErr) throw invErr;

      onDeleted?.();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'שגיאה במחיקה');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className={invoice.entry_method === 'ocr' ? 'badge-ocr' : 'badge-manual'}>
              {invoice.entry_method === 'ocr' ? <><ScanLine size={10} /> OCR</> : <><FileText size={10} /> ידנית</>}
            </span>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                <input
                  className="input-field py-1 text-sm font-semibold w-36"
                  value={form.supplier_name}
                  onChange={e => setForm(p => ({ ...p, supplier_name: e.target.value }))}
                  placeholder="שם ספק"
                />
                <input
                  className="input-field py-1 text-sm w-28"
                  value={form.invoice_number}
                  onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))}
                  placeholder="מס׳ חשבונית"
                />
                <input
                  type="date"
                  className="input-field py-1 text-sm w-36"
                  value={form.invoice_date}
                  onChange={e => setForm(p => ({ ...p, invoice_date: e.target.value }))}
                />
              </div>
            ) : (
              <div>
                <h2 className="font-display font-semibold text-navy-800">{invoice.supplier_name}</h2>
                <p className="text-slate-500 text-xs">{invoice.invoice_number} · {formatDate(invoice.invoice_date)}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-3"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {saving ? 'שומר...' : 'שמור'}
                </button>
                <button onClick={cancelEdit} className="btn-secondary text-xs py-2 px-3">
                  <XCircle size={13} /> ביטול
                </button>
              </>
            ) : (
              <>
                <button onClick={startEdit} className="btn-secondary text-xs py-2 px-3">
                  <Edit3 size={13} /> ערוך
                </button>
                {invoice.image_url && (
                  <a
                    href={invoice.image_url}
                    download
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                  >
                    <Download size={13} /> הורד
                  </a>
                )}
                {confirmDelete ? (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn-danger text-xs py-2 px-3"
                    >
                      {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      {deleting ? 'מוחק...' : 'אשר מחיקה'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      ביטול
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors group"
                  >
                    <Trash2 size={15} className="text-slate-400 group-hover:text-danger transition-colors" />
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream-100 flex items-center justify-center transition-colors">
              <X size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {saveError && (
          <div className="px-6 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
            <AlertTriangle size={13} className="text-danger flex-shrink-0" />
            <p className="text-xs text-danger">{saveError}</p>
          </div>
        )}

        {/* Content: Split view */}
        <div className="flex-1 overflow-hidden flex">
          {/* Image panel */}
          {invoice.image_url ? (
            <div className="w-80 flex-shrink-0 bg-cream-100 border-l border-cream-200 relative overflow-hidden">
              <img src={invoice.image_url} alt="תמונת חשבונית" className="w-full h-full object-cover" />
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

          {/* Data panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Alert / notes */}
            {editing ? (
              <textarea
                className="input-field w-full text-sm mb-4 resize-none"
                rows={2}
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="הערות (אופציונלי)"
              />
            ) : invoice.notes ? (
              <div className="mb-4 p-3 bg-red-50 border border-danger/20 rounded-xl flex gap-3">
                <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{invoice.notes}</p>
              </div>
            ) : null}

            {/* Totals summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {editing ? (
                <>
                  <div className="bg-cream-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-1">לפני מע״מ</p>
                    <input
                      type="number"
                      className="input-field py-1 text-sm w-full"
                      value={form.subtotal}
                      onChange={e => setForm(p => ({ ...p, subtotal: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="bg-cream-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-1">מע״מ (18%)</p>
                    <input
                      type="number"
                      className="input-field py-1 text-sm w-full"
                      value={form.vat_amount}
                      onChange={e => setForm(p => ({ ...p, vat_amount: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="bg-navy-900 rounded-xl p-3">
                    <p className="text-[10px] text-gold-400 mb-1">סה״כ לתשלום</p>
                    <input
                      type="number"
                      className="bg-transparent border border-white/20 rounded-lg px-2 py-1 text-sm text-white w-full"
                      value={form.total_with_vat}
                      onChange={e => setForm(p => ({ ...p, total_with_vat: Number(e.target.value) }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-cream-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">לפני מע״מ</p>
                    <p className="font-semibold text-navy-800 text-sm">{fmt(invoice.subtotal)}</p>
                  </div>
                  <div className="bg-cream-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">מע״מ (18%)</p>
                    <p className="font-semibold text-navy-800 text-sm">{fmt(invoice.vat_amount)}</p>
                  </div>
                  <div className="bg-navy-900 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gold-400 mb-1">סה״כ לתשלום</p>
                    <p className="font-semibold text-white text-sm">{fmt(invoice.total_with_vat)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Items */}
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
                    {(editing ? editItems : items).map((item, idx) => (
                      <tr
                        key={item.id}
                        className={item.discrepancy < 0 || (item.price_change_pct ?? 0) > 5 ? 'bg-red-50/50' : ''}
                      >
                        <td className="table-cell">
                          {editing ? (
                            <div className="flex flex-col gap-1">
                              <input
                                className="input-field py-1 text-sm"
                                value={item.product_name}
                                onChange={e => updateEditItem(idx, 'product_name', e.target.value)}
                              />
                              <input
                                className="input-field py-0.5 text-xs w-24"
                                value={item.unit}
                                onChange={e => updateEditItem(idx, 'unit', e.target.value)}
                                placeholder="יחידה"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-navy-800">{item.product_name}</p>
                              <p className="text-[10px] text-slate-400">{item.unit}</p>
                            </div>
                          )}
                        </td>
                        <td className="table-cell text-center">
                          {editing ? (
                            <input
                              type="number"
                              className="input-field py-1 text-sm w-16 text-center"
                              value={item.quantity_ordered}
                              onChange={e => updateEditItem(idx, 'quantity_ordered', Number(e.target.value))}
                            />
                          ) : (
                            <span className="text-slate-600">{item.quantity_ordered}</span>
                          )}
                        </td>
                        <td className="table-cell text-center">
                          {editing ? (
                            <input
                              type="number"
                              className="input-field py-1 text-sm w-16 text-center"
                              value={item.quantity_received}
                              onChange={e => updateEditItem(idx, 'quantity_received', Number(e.target.value))}
                            />
                          ) : (
                            <span className={item.discrepancy < 0 ? 'text-danger font-semibold' : 'text-slate-600'}>
                              {item.quantity_received}
                              {item.discrepancy < 0 && (
                                <span className="text-[10px] text-danger mr-1">({item.discrepancy})</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-center">
                          {editing ? (
                            <input
                              type="number"
                              className="input-field py-1 text-sm w-20 text-center"
                              value={item.unit_price}
                              onChange={e => updateEditItem(idx, 'unit_price', Number(e.target.value))}
                            />
                          ) : (
                            <div>
                              <p className={`text-sm ${(item.price_change_pct ?? 0) > 5 ? 'text-danger font-semibold' : 'text-slate-600'}`}>
                                {fmt(item.unit_price)}
                              </p>
                              {(item.price_change_pct ?? 0) > 0 && item.expected_price && (
                                <p className="text-[10px] text-danger">+{item.price_change_pct?.toFixed(1)}%</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="table-cell text-left">
                          {editing ? (
                            <input
                              type="number"
                              className="input-field py-1 text-sm w-20"
                              value={item.total}
                              onChange={e => updateEditItem(idx, 'total', Number(e.target.value))}
                            />
                          ) : (
                            <span className="font-mono font-medium text-navy-800">{fmt(item.total)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Status badge */}
            {!editing && (
              <div className="mt-4 flex items-center gap-2">
                {invoice.has_alerts ? (
                  <span className="badge badge-alert"><AlertTriangle size={10} /> נמצאו אי-התאמות</span>
                ) : (
                  <span className="badge badge-success"><CheckCircle size={10} /> הכל תקין</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
