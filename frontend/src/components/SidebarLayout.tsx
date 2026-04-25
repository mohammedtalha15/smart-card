import React, { ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, ChevronRight } from 'lucide-react';

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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Get current page name
  const currentPage = navItems.find((item) => item.path === location.pathname)?.label || title;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" data-testid="sidebar-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        {/* Brand accent stripe */}
        <div className="sidebar-accent" />

        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F172A] flex items-center justify-center" style={{ borderRadius: '2px' }}>
                <span className="text-white font-heading font-bold text-xs">A</span>
              </div>
              <div>
                <span className="font-heading font-bold text-base tracking-tighter text-[#0F172A] block leading-tight">Artha</span>
                <span className="text-[9px] tracking-widest uppercase font-bold text-slate-300">{title} Portal</span>
              </div>
            </div>
            <button className="lg:hidden p-1 hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(false)} data-testid="close-sidebar-btn" style={{ borderRadius: '2px' }}>
              <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]'
                }`
              }
              style={{ borderRadius: '2px' }}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" strokeWidth={2} />
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full ring-2 ring-slate-100" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-400 flex items-center justify-center text-xs font-bold text-white" style={{ borderRadius: '2px' }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
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
        <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center px-6 gap-4" data-testid="top-navbar">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} data-testid="open-sidebar-btn">
            <Menu className="w-5 h-5 text-slate-500" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-300 font-medium">{title}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" strokeWidth={2} />
            <span className="font-bold text-[#0F172A]">{currentPage}</span>
          </div>
        </header>

        <main className="p-5 lg:p-8 anim-fade-up">{children}</main>
      </div>
    </div>
  );
}
