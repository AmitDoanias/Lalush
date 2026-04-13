import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, ChefHat } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 flex" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-950/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 lg:mr-64 min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-cream-200 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center"
          >
            <Menu size={18} className="text-navy-800" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-gold-400" />
            <span className="font-display font-semibold text-navy-800">לָלוּשׁ</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
