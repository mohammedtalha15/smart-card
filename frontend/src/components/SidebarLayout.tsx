import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface SidebarLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function SidebarLayout({ children, navItems, title }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" data-testid="sidebar-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/10 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-56 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0F172A] flex items-center justify-center" style={{ borderRadius: '2px' }}>
                <span className="text-white font-heading font-bold text-xs">A</span>
              </div>
              <span className="font-heading font-bold text-base tracking-tighter text-[#0F172A]">Artha</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)} data-testid="close-sidebar-btn">
              <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
            </button>
          </div>
          <p className="mt-1.5 text-[10px] tracking-widest uppercase font-bold text-slate-300">{title}</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]'
                }`
              }
              style={{ borderRadius: '2px' }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500" style={{ borderRadius: '2px' }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0F172A] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            style={{ borderRadius: '2px' }}
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-12 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center px-6" data-testid="top-navbar">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)} data-testid="open-sidebar-btn">
            <Menu className="w-5 h-5 text-slate-500" strokeWidth={2} />
          </button>
        </header>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
