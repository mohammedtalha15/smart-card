import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Calendar, User, Percent } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={1.5} /> },
];

export default function AdminTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiFetch('/api/admin/transactions', { token: token || undefined });
        setTransactions(data.transactions);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [token]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="animate-fade-in-up" data-testid="admin-transactions">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Transactions</h1>
        <p className="text-zinc-500 mb-6">All discount redemptions across the platform.</p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center" data-testid="no-admin-transactions">
            <Receipt className="w-10 h-10 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-zinc-500 font-medium">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden" data-testid="admin-transactions-table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Student</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Vendor</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Discount</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Date</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.transaction_id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <User className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                        {txn.user_name || txn.user_email}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 text-sm text-zinc-600">
                        <Store className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                        {txn.vendor_name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                        <Percent className="w-3 h-3" strokeWidth={2} />
                        {txn.discount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {formatDate(txn.timestamp)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono">{txn.transaction_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
