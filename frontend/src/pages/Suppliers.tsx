import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { mockSuppliers, mockProducts, mockPriceHistory } from '../data/mockData';
import PageHeader from '../components/common/PageHeader';

const fmt = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });

export default function Suppliers() {
  const [expandedSupplier, setExpandedSupplier] = useState<number | null>(1);

  return (
    <div className="p-8 page-enter">
      <PageHeader
        title="ספקים ומוצרים"
        subtitle={`${mockSuppliers.length} ספקים פעילים`}
        actions={
          <button className="btn-primary">
            <Plus size={15} /> הוסף ספק
          </button>
        }
      />

      <div className="space-y-4">
        {mockSuppliers.map((supplier, si) => {
          const isOpen = expandedSupplier === supplier.id;
          const supplierProducts = mockProducts.filter(p =>
            mockPriceHistory.some(h => h.supplier_id === supplier.id && h.product_id === p.id)
          );

          return (
            <div
              key={supplier.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-up"
              style={{ animationDelay: `${si * 60}ms` }}
            >
              {/* Supplier header */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream-50 transition-colors"
                onClick={() => setExpandedSupplier(isOpen ? null : supplier.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-gold-400 font-bold text-sm">
                    {supplier.name[0]}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-800">{supplier.name}</p>
                    <p className="text-slate-500 text-xs">{supplier.category} · {supplier.payment_terms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">טלפון</p>
                    <p className="text-sm text-navy-700">{supplier.phone}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">מוצרים</p>
                    <p className="text-sm font-semibold text-navy-800">{supplierProducts.length}</p>
                  </div>
                  <span className={`badge ${supplier.active ? 'badge-success' : 'badge-manual'}`}>
                    {supplier.active ? 'פעיל' : 'לא פעיל'}
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded: price history per product */}
              {isOpen && (
                <div className="border-t border-cream-200 p-6 animate-fade-in">
                  <h3 className="text-sm font-semibold text-slate-500 mb-4">היסטוריית מחירים</h3>
                  {supplierProducts.length === 0 ? (
                    <p className="text-slate-400 text-sm">אין מוצרים רשומים לספק זה</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supplierProducts.map(product => {
                        const history = mockPriceHistory
                          .filter(h => h.product_id === product.id && h.supplier_id === supplier.id)
                          .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());

                        if (history.length === 0) return null;

                        const latest = history[0];
                        const prev = history[1];
                        const trend = prev ? ((latest.price - prev.price) / prev.price) * 100 : 0;

                        return (
                          <div key={product.id} className="bg-cream-50 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold text-navy-800 text-sm">{product.name}</p>
                                <p className="text-xs text-slate-400">{product.unit}</p>
                              </div>
                              <div className="text-left">
                                <p className="font-mono font-semibold text-navy-800">{fmt(latest.price)}</p>
                                {trend !== 0 && (
                                  <div className={`flex items-center gap-0.5 text-xs justify-end ${trend > 0 ? 'text-danger' : 'text-success'}`}>
                                    {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                    {Math.abs(trend).toFixed(1)}%
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Mini price timeline */}
                            <div className="space-y-1.5">
                              {history.slice(0, 4).map((h, i) => (
                                <div key={h.id} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">{formatDate(h.effective_date)}</span>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-1 rounded-full bg-gold-400/30"
                                      style={{ width: `${Math.min(60, (h.price / latest.price) * 40)}px` }}
                                    />
                                    <span className={`font-mono ${i === 0 ? 'text-navy-800 font-semibold' : 'text-slate-500'}`}>
                                      {fmt(h.price)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
