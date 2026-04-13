import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Save, Truck, Phone, CreditCard, Tag, Loader2, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/common/PageHeader';

interface Supplier {
  id: string;
  name: string;
  contact_info: string;
  phone: string;
  payment_terms: string;
  category: string;
  active: boolean;
}

const categoryColors: Record<string, string> = {
  'בשר': 'bg-red-100 text-red-700',
  'ירקות': 'bg-green-100 text-green-700',
  'חלב': 'bg-blue-100 text-blue-700',
  'דגים': 'bg-cyan-100 text-cyan-700',
  'יבשים': 'bg-amber-100 text-amber-700',
  'שמנים': 'bg-yellow-100 text-yellow-700',
  'אחר': 'bg-slate-100 text-slate-600',
};

function supplierInitialColor(name: string): string {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
                  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xff;
  return colors[hash % colors.length];
}

const EMPTY_FORM = { name: '', category: 'אחר', phone: '', contact_info: '', payment_terms: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    if (data) setSuppliers(data as Supplier[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase.from('suppliers').insert({
      name: form.name.trim(),
      category: form.category,
      phone: form.phone,
      contact_info: form.contact_info,
      payment_terms: form.payment_terms,
      active: true,
    });
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setForm(EMPTY_FORM);
    setShowAdd(false);
    setSaving(false);
    loadSuppliers();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setConfirmDeleteId(null);
    loadSuppliers();
  };

  const startEdit = (s: Supplier) => {
    setEditId(s.id);
    setEditForm({ name: s.name, category: s.category, phone: s.phone, contact_info: s.contact_info, payment_terms: s.payment_terms });
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    await supabase.from('suppliers').update({
      name: editForm.name,
      category: editForm.category,
      phone: editForm.phone,
      contact_info: editForm.contact_info,
      payment_terms: editForm.payment_terms,
    }).eq('id', editId);
    setEditId(null);
    setSaving(false);
    loadSuppliers();
  };

  return (
    <div className="p-4 md:p-8 page-enter">
      <PageHeader
        title="ספקים ומוצרים"
        subtitle={`${suppliers.length} ספקים פעילים`}
        actions={
          <button className="btn-primary" onClick={() => { setShowAdd(true); setSaveError(null); }}>
            <Plus size={15} /> הוסף ספק
          </button>
        }
      />

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6 border-2 border-gold-300/40 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-800">ספק חדש</h3>
            <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-lg hover:bg-cream-100 flex items-center justify-center">
              <X size={14} />
            </button>
          </div>
          {saveError && <p className="text-xs text-danger mb-3">{saveError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              placeholder="שם הספק *"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field"
            />
            <input
              placeholder="קטגוריה (בשר / ירקות / ...)"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="input-field"
            />
            <input
              placeholder="טלפון"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="input-field"
            />
            <input
              placeholder="איש קשר"
              value={form.contact_info}
              onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))}
              className="input-field"
            />
            <input
              placeholder="תנאי תשלום (שוטף 30 / מזומן...)"
              value={form.payment_terms}
              onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))}
              className="input-field sm:col-span-2 lg:col-span-1"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">ביטול</button>
            <button onClick={handleAdd} disabled={saving || !form.name.trim()} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'שומר...' : 'שמור ספק'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 shadow-card flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-gold-400 animate-spin" />
          <p className="text-slate-500 text-sm">טוען ספקים...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center">
          <div className="w-14 h-14 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={24} className="text-slate-300" />
          </div>
          <p className="font-semibold text-navy-800 mb-1">אין ספקים רשומים</p>
          <p className="text-slate-400 text-sm">לחץ "הוסף ספק" להוספה ידנית, או ספקים יתווספו אוטומטית בסריקת חשבוניות</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-card p-5 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              {editId === s.id ? (
                /* Edit mode */
                <div className="space-y-2">
                  <input className="input-field text-sm w-full" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="שם" />
                  <input className="input-field text-sm w-full" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} placeholder="קטגוריה" />
                  <input className="input-field text-sm w-full" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="טלפון" />
                  <input className="input-field text-sm w-full" value={editForm.contact_info} onChange={e => setEditForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="איש קשר" />
                  <input className="input-field text-sm w-full" value={editForm.payment_terms} onChange={e => setEditForm(p => ({ ...p, payment_terms: e.target.value }))} placeholder="תנאי תשלום" />
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 justify-center text-xs py-2">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} שמור
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-2 px-3">ביטול</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${supplierInitialColor(s.name)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">{s.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-navy-800">{s.name}</p>
                        {s.category && (
                          <span className={`badge text-[10px] ${categoryColors[s.category] ?? 'bg-slate-100 text-slate-600'}`}>
                            <Tag size={9} /> {s.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(s)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <Edit2 size={13} className="text-blue-500" />
                      </button>
                      {confirmDeleteId === s.id ? (
                        <>
                          <button onClick={() => handleDelete(s.id)} className="btn-danger text-[10px] py-1 px-2">מחק</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary text-[10px] py-1 px-2">ביטול</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors">
                          <Trash2 size={13} className="text-slate-400 hover:text-danger transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={11} className="flex-shrink-0" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.contact_info && (
                      <div className="flex items-center gap-2">
                        <Truck size={11} className="flex-shrink-0" />
                        <span>{s.contact_info}</span>
                      </div>
                    )}
                    {s.payment_terms && (
                      <div className="flex items-center gap-2">
                        <CreditCard size={11} className="flex-shrink-0" />
                        <span>{s.payment_terms}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
