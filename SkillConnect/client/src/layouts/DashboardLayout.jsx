import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function DashboardLayout({ navItems, roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper md:flex">
      <aside className="hidden w-64 flex-col border-r border-ink-100 bg-white px-5 py-6 md:flex">
        <div className="mb-8">
          <p className="font-display text-lg font-bold text-ink-900">SkillConnect</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-400">{roleLabel} panel</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-ink-50 text-ink-900' : 'text-ink-600 hover:bg-ink-50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-ink-100 pt-4">
          <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
          <p className="truncate text-xs text-ink-400">{user?.email}</p>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-ink-100 bg-white py-2 md:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="flex flex-col items-center gap-0.5 px-2 py-1 text-ink-500">
            <item.icon size={18} />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-5 py-6 pb-20 md:px-8 md:py-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
