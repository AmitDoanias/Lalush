import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-cream-100 flex" dir="rtl">
      <Sidebar />
      <main className="flex-1 mr-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
