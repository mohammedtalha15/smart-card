import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Users, TrendingUp, Percent, Calendar } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={1.5} /> },
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiFetch('/api/admin/dashboard', { token: token || undefined });
        setStats(data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [token]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="animate-fade-in-up" data-testid="admin-dashboard">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Admin Dashboard</h1>
        <p className="text-zinc-500 mb-8">Platform overview and management.</p>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
              {[
                { label: 'Students', value: stats?.total_users || 0, icon: Users },
                { label: 'Vendors', value: stats?.total_vendors || 0, icon: Store },
                { label: 'Offers', value: stats?.total_offers || 0, icon: Tag },
                { label: 'Transactions', value: stats?.total_transactions || 0, icon: TrendingUp },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-zinc-200 rounded-lg p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider uppercase text-zinc-400">{s.label}</p>
                      <p className="text-2xl font-heading font-bold">{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-heading font-bold tracking-tight mb-3">Recent Transactions</h2>
            {!stats?.recent_transactions?.length ? (
              <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
                <p className="text-zinc-500 text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden" data-testid="admin-recent-txns">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Student</th>
                      <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Vendor</th>
                      <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Discount</th>
                      <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_transactions.map((txn: any) => (
                      <tr key={txn.transaction_id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                        <td className="px-5 py-3.5 text-sm font-medium">{txn.user_name || txn.user_email}</td>
                        <td className="px-5 py-3.5 text-sm text-zinc-600">{txn.vendor_name}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-bold text-emerald-600">{txn.discount}%</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-zinc-500">{formatDate(txn.timestamp)}</td>
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
