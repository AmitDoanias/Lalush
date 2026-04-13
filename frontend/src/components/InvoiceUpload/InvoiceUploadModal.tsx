import { useState, useRef } from 'react';
import { X, Upload, Camera, ScanLine, CheckCircle, AlertTriangle, Save, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

type Step = 'upload' | 'processing' | 'confirm' | 'saved';

const mockOcrResult = {
  supplier: 'גורמה בשרים',
  invoice_number: 'INV-2026-0413',
  date: '2026-04-13',
  subtotal: 2340,
  vat: 397.8,
  total: 2737.8,
  items: [
    { name: 'פילה בקר', qty: 18, unit: 'kg', unit_price: 96, total: 1728, price_change_pct: 7.9 },
    { name: 'עוף שלם', qty: 15, unit: 'kg', unit_price: 32, total: 480, price_change_pct: 0 },
    { name: 'כבש טחון', qty: 3, unit: 'kg', unit_price: 44, total: 132, price_change_pct: 0 },
  ],
};

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(n);

export default function InvoiceUploadModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState(mockOcrResult.items.map(i => ({ ...i, received: i.qty })));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('processing');
    setTimeout(() => setStep('confirm'), 2200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
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
              {step === 'processing' && 'מעבד עם Claude Vision...'}
              {step === 'confirm' && 'אישור פרטים שחולצו'}
              {step === 'saved' && 'חשבונית נשמרה!'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream-100 flex items-center justify-center transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
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
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-cream-200" />
                <span className="text-slate-400 text-xs">או</span>
                <div className="flex-1 h-px bg-cream-200" />
              </div>
              <button
                onClick={() => { fileRef.current?.click(); }}
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
                <p className="font-semibold text-navy-800">Claude Vision מנתח את החשבונית...</p>
              </div>
              <p className="text-slate-500 text-sm">מזהה פריטים, כמויות ומחירים</p>
              <div className="mt-6 bg-navy-900 rounded-xl p-4 text-right">
                <p className="text-gold-400 text-xs font-mono mb-1">// Claude Vision API</p>
                <p className="text-slate-300 text-xs font-mono">&#123; "supplier": "גורמה...", "items": [...]</p>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div>
              {/* OCR Header */}
              <div className="bg-cream-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-800">{mockOcrResult.supplier}</p>
                  <p className="text-slate-500 text-xs">{mockOcrResult.invoice_number} · {mockOcrResult.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">סה״כ כולל מע״מ</p>
                  <p className="font-display font-semibold text-navy-800">{fmt(mockOcrResult.total)}</p>
                </div>
              </div>

              {/* Price alert */}
              <div className="bg-red-50 border border-danger/20 rounded-xl p-3 mb-4 flex gap-2">
                <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger">פילה בקר — מחיר ממוצע: 89₪, חויב: 96₪ (+7.9%). בדוק לפני שמירה.</p>
              </div>

              {/* Editable items */}
              <div className="rounded-xl overflow-hidden border border-cream-200 mb-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header text-right">מוצר</th>
                      <th className="table-header text-center">מחיר</th>
                      <th className="table-header text-center">הוזמן</th>
                      <th className="table-header text-center">התקבל</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className={item.price_change_pct > 5 ? 'bg-red-50/50' : ''}>
                        <td className="table-cell font-medium text-navy-800">{item.name}</td>
                        <td className="table-cell text-center">
                          <span className={item.price_change_pct > 5 ? 'text-danger font-semibold text-sm' : 'text-slate-600 text-sm'}>
                            {fmt(item.unit_price)}
                          </span>
                        </td>
                        <td className="table-cell text-center text-slate-600">{item.qty}</td>
                        <td className="table-cell text-center">
                          <input
                            type="number"
                            value={item.received}
                            onChange={e => {
                              const updated = [...items];
                              updated[i] = { ...updated[i], received: Number(e.target.value) };
                              setItems(updated);
                            }}
                            className="w-16 text-center input-field py-1 text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="btn-secondary flex-1 justify-center">
                  חזור
                </button>
                <button onClick={() => setStep('saved')} className="btn-primary flex-1 justify-center">
                  <Save size={15} /> שמור חשבונית
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
              <h3 className="font-display font-semibold text-navy-800 text-lg mb-2">החשבונית נשמרה בהצלחה!</h3>
              <p className="text-slate-500 text-sm mb-6">הוספה לארכיון ועודכנה היסטוריית המחירים</p>
              <div className="flex gap-3 justify-center">
                <button onClick={onClose} className="btn-secondary">סגור</button>
                <button onClick={() => { setStep('upload'); setPreviewUrl(null); }} className="btn-primary">
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
