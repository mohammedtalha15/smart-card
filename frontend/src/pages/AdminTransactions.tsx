import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Calendar, User, Percent } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={2} /> },
];

export default function AdminTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { try { const d = await apiFetch('/api/admin/transactions', { token: token || undefined }); setTransactions(d.transactions); } catch {} setLoading(false); };
    fetch();
  }, [token]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="anim-fade-up" data-testid="admin-transactions">
        <h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A] mb-1">Transactions</h1>
        <p className="text-slate-500 text-sm mb-6">All discount redemptions across the platform.</p>

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse" style={{ borderRadius: '2px' }} />)}</div>
        : transactions.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center" data-testid="no-admin-transactions" style={{ borderRadius: '2px' }}>
            <Receipt className="w-8 h-8 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-400 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 overflow-hidden" data-testid="admin-transactions-table" style={{ borderRadius: '2px' }}>
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Student</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Vendor</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Discount</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Date</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">ID</th>
              </tr></thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.transaction_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5"><span className="flex items-center gap-2 text-sm font-medium text-[#0F172A]"><User className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />{txn.user_name || txn.user_email}</span></td>
                    <td className="px-5 py-3.5"><span className="flex items-center gap-2 text-sm text-slate-500"><Store className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />{txn.vendor_name}</span></td>
                    <td className="px-5 py-3.5"><span className="text-xs font-bold text-[#002FA7]">{txn.discount}%</span></td>
                    <td className="px-5 py-3.5"><span className="flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="w-3 h-3" strokeWidth={2} />{formatDate(txn.timestamp)}</span></td>
                    <td className="px-5 py-3.5 text-[10px] text-slate-300 font-mono">{txn.transaction_id}</td>
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
