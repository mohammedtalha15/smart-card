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
    <div className="min-h-screen bg-background flex" data-testid="sidebar-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-50/80 border-r border-zinc-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm font-heading">A</span>
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">Artha</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)} data-testid="close-sidebar-btn">
              <X className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
            </button>
          </div>
          <p className="mt-1.5 text-xs tracking-widest uppercase font-bold text-zinc-400">{title}</p>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3 mb-3 px-1">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-all"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center px-6 gap-4" data-testid="top-navbar">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} data-testid="open-sidebar-btn">
            <Menu className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
          </button>
          <div className="flex-1" />
        </header>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
