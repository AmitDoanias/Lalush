import { useState, useRef } from 'react';
import { X, Upload, Camera, ScanLine, CheckCircle, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GeminiItem {
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface GeminiResult {
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  items: GeminiItem[];
  subtotal: number;
  vat_amount: number;
  total_with_vat: number;
}

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

type Step = 'upload' | 'processing' | 'confirm' | 'saved';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(n);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InvoiceUploadModal({ onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<GeminiResult | null>(null);
  const [editableItems, setEditableItems] = useState<(GeminiItem & { received: number })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('processing');
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const mime_type = file.type || 'image/jpeg';

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/scan-invoice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_base64: base64, mime_type }),
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const result = json.data as GeminiResult;
      setOcrResult(result);
      setEditableItems((result.items || []).map(i => ({ ...i, received: i.quantity })));
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בסריקה — נסה שוב');
      setStep('upload');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = async () => {
    if (!ocrResult) return;
    setSaving(true);
    setError(null);

    try {
      const hasAlerts = editableItems.some(i => i.received !== i.quantity);

      const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .insert({
          supplier_name: ocrResult.supplier_name || 'לא זוהה',
          invoice_number: ocrResult.invoice_number || '',
          invoice_date: ocrResult.invoice_date || new Date().toISOString().split('T')[0],
          subtotal: ocrResult.subtotal || 0,
          vat_amount: ocrResult.vat_amount || 0,
          total_with_vat: ocrResult.total_with_vat || 0,
          entry_method: 'ocr',
          has_alerts: hasAlerts,
          ocr_raw_response: ocrResult,
        })
        .select()
        .single();

      if (invErr) throw invErr;

      if (editableItems.length > 0) {
        const items = editableItems.map(item => ({
          invoice_id: invoice.id,
          product_name: item.product_name,
          unit: item.unit || 'יח׳',
          quantity_ordered: item.quantity || 0,
          quantity_received: item.received || 0,
          unit_price: item.unit_price || 0,
          total: (item.unit_price || 0) * (item.received || 0),
        }));

        const { error: itemsErr } = await supabase.from('invoice_items').insert(items);
        if (itemsErr) throw itemsErr;
      }

      setStep('saved');
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setPreviewUrl(null);
    setOcrResult(null);
    setEditableItems([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
              <ScanLine size={15} className="text-gold-400" />
            </div>
            <h2 className="font-display font-semibold text-navy-800">
              {step === 'upload' && 'העלאת חשבונית'}
              {step === 'processing' && 'סורק עם Gemini Vision...'}
              {step === 'confirm' && 'אישור פרטים שחולצו'}
              {step === 'saved' && 'חשבונית נשמרה!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-cream-100 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-danger flex-shrink-0" />
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-cream-300 hover:border-gold-400 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
              >
                <div className="w-14 h-14 bg-cream-100 group-hover:bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload size={24} className="text-slate-400 group-hover:text-gold-500 transition-colors" />
                </div>
                <p className="font-semibold text-navy-800 mb-1">גרור תמונת חשבונית לכאן</p>
                <p className="text-slate-500 text-sm">או לחץ לבחירת קובץ</p>
                <p className="text-slate-400 text-xs mt-2">JPG, PNG, PDF — עד 10MB</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-cream-200" />
                <span className="text-slate-400 text-xs">או</span>
                <div className="flex-1 h-px bg-cream-200" />
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-secondary w-full justify-center mt-3"
              >
                <Camera size={15} /> צלם עם מצלמה
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              {previewUrl && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-6 border-4 border-cream-200">
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-center gap-3 mb-3">
                <Loader2 size={20} className="text-gold-400 animate-spin" />
                <p className="font-semibold text-navy-800">Gemini Vision מנתח את החשבונית...</p>
              </div>
              <p className="text-slate-500 text-sm">מזהה פריטים, כמויות ומחירים</p>
              <div className="mt-6 bg-navy-900 rounded-xl p-4 text-right">
                <p className="text-gold-400 text-xs font-mono mb-1">// Gemini Vision API</p>
                <p className="text-slate-300 text-xs font-mono">&#123; "supplier_name": "...", "items": [...]</p>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && ocrResult && (
            <div>
              <div className="bg-cream-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-800">{ocrResult.supplier_name || 'ספק לא זוהה'}</p>
                  <p className="text-slate-500 text-xs">
                    {ocrResult.invoice_number || 'ללא מספר'} · {ocrResult.invoice_date || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">סה״כ כולל מע״מ</p>
                  <p className="font-display font-semibold text-navy-800">
                    {fmt(ocrResult.total_with_vat || 0)}
                  </p>
                </div>
              </div>

              {editableItems.some(i => i.received !== i.quantity) && (
                <div className="bg-red-50 border border-danger/20 rounded-xl p-3 mb-4 flex gap-2">
                  <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger">
                    יש פריטים עם כמות שהתקבלה שונה מהמוזמן. בדוק לפני שמירה.
                  </p>
                </div>
              )}

              {editableItems.length > 0 ? (
                <div className="rounded-xl overflow-hidden border border-cream-200 mb-4">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header text-right">מוצר</th>
                        <th className="table-header text-center">מחיר</th>
                        <th className="table-header text-center">כמות</th>
                        <th className="table-header text-center">התקבל</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableItems.map((item, i) => (
                        <tr key={i} className={item.received !== item.quantity ? 'bg-red-50/50' : ''}>
                          <td className="table-cell font-medium text-navy-800">{item.product_name}</td>
                          <td className="table-cell text-center text-slate-600 text-sm">
                            {fmt(item.unit_price)}
                          </td>
                          <td className="table-cell text-center text-slate-600">{item.quantity}</td>
                          <td className="table-cell text-center">
                            <input
                              type="number"
                              value={item.received}
                              onChange={e => {
                                const updated = [...editableItems];
                                updated[i] = { ...updated[i], received: Number(e.target.value) };
                                setEditableItems(updated);
                              }}
                              className="w-16 text-center input-field py-1 text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center mb-4">לא זוהו פריטים בחשבונית</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="btn-secondary flex-1 justify-center">
                  חזור
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 justify-center"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'שומר...' : 'שמור חשבונית'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Saved */}
          {step === 'saved' && (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="font-display font-semibold text-navy-800 text-lg mb-2">
                החשבונית נשמרה בהצלחה!
              </h3>
              <p className="text-slate-500 text-sm mb-6">הוספה לארכיון ועודכנה היסטוריית המחירים</p>
              <div className="flex gap-3 justify-center">
                <button onClick={onClose} className="btn-secondary">
                  סגור
                </button>
                <button onClick={resetModal} className="btn-primary">
                  סרוק עוד
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
