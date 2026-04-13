import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Truck,
  Wallet,
  BarChart3,
  ChefHat,
  Bell,
} from 'lucide-react';
const navItems = [
  { path: '/', label: 'דשבורד', icon: LayoutDashboard },
  { path: '/invoices', label: 'חשבוניות', icon: FileText },
  { path: '/suppliers', label: 'ספקים ומוצרים', icon: Truck },
  { path: '/expenses', label: 'הוצאות קבועות', icon: Wallet },
  { path: '/reports', label: 'דוחות פיננסיים', icon: BarChart3 },
];

const activeAlerts = 0;

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-navy-900 flex flex-col z-40 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.6),transparent_70%)] pointer-events-none" />

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center shadow-glow-gold">
            <ChefHat size={18} className="text-navy-900" />
          </div>
          <div>
            <h1 className="font-display text-white font-semibold text-lg leading-none">לָלוּשׁ</h1>
            <p className="text-slate-500 text-[10px] mt-0.5 tracking-wider uppercase">Restaurant Finance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 sidebar-scroll overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">ניווט ראשי</p>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <Icon size={17} className={isActive ? 'text-gold-400' : ''} />
              <span>{label}</span>
              {path === '/invoices' && activeAlerts > 0 && (
                <span className="mr-auto bg-danger text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-soft">
                  {activeAlerts}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Alert summary */}
      {activeAlerts > 0 && (
        <div className="mx-3 mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-danger" />
            <span className="text-danger text-xs font-semibold">{activeAlerts} התראות פעילות</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            נמצאו שינויי מחיר וחוסרים שדורשים תשומת לב
          </p>
        </div>
      )}

      {/* Bottom */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center text-slate-300 text-xs font-bold">
            מ
          </div>
          <div>
            <p className="text-slate-300 text-xs font-medium">מנהל המסעדה</p>
            <p className="text-slate-600 text-[10px]">אפריל 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
