import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Users, TrendingUp, Calendar } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={2} /> },
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const data = await apiFetch('/api/admin/dashboard', { token: token || undefined }); setStats(data); } catch {}
      setLoading(false);
    };
    fetch();
  }, [token]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="anim-fade-up" data-testid="admin-dashboard">
        <h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A] mb-1">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mb-8">Platform overview and management.</p>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse" style={{ borderRadius: '2px' }} />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
              {[
                { label: 'Students', value: stats?.total_users || 0, icon: Users },
                { label: 'Vendors', value: stats?.total_vendors || 0, icon: Store },
                { label: 'Offers', value: stats?.total_offers || 0, icon: Tag },
                { label: 'Transactions', value: stats?.total_transactions || 0, icon: TrendingUp },
              ].map(s => (
                <div key={s.label} className="bg-white border border-slate-200 p-5 hover:border-slate-400 hover:-translate-y-0.5 transition-all" style={{ borderRadius: '2px' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 flex items-center justify-center" style={{ borderRadius: '2px' }}>
                      <s.icon className="w-4 h-4 text-slate-500" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-300">{s.label}</p>
                      <p className="text-2xl font-heading font-bold tracking-tighter text-[#0F172A]">{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-300 mb-3">Recent Transactions</p>
            {!stats?.recent_transactions?.length ? (
              <div className="bg-white border border-slate-200 p-8 text-center" style={{ borderRadius: '2px' }}><p className="text-slate-400 text-sm">No transactions yet.</p></div>
            ) : (
              <div className="bg-white border border-slate-200 overflow-hidden" data-testid="admin-recent-txns" style={{ borderRadius: '2px' }}>
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Student</th>
                    <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Vendor</th>
                    <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Discount</th>
                    <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Time</th>
                  </tr></thead>
                  <tbody>
                    {stats.recent_transactions.map((txn: any) => (
                      <tr key={txn.transaction_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 text-sm font-medium text-[#0F172A]">{txn.user_name || txn.user_email}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{txn.vendor_name}</td>
                        <td className="px-5 py-3.5"><span className="text-xs font-bold text-[#002FA7]">{txn.discount}%</span></td>
                        <td className="px-5 py-3.5"><span className="flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="w-3 h-3" strokeWidth={2} />{formatDate(txn.timestamp)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
