import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, Store, Percent, Calendar } from 'lucide-react';

interface Transaction { transaction_id: string; vendor_name: string; discount: number; timestamp: string; }
const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={2} /> },
];

export default function TransactionHistory() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiFetch('/api/transactions/my', { token: token || undefined });
        setTransactions(data.transactions);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [token]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="anim-fade-up" data-testid="transaction-history">
        <h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A] mb-1">Transaction History</h1>
        <p className="text-slate-500 text-sm mb-6">Your past redemptions.</p>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse" style={{ borderRadius: '2px' }} />)}</div>
        ) : transactions.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center" data-testid="no-transactions" style={{ borderRadius: '2px' }}>
            <History className="w-8 h-8 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
            <p className="text-slate-400 text-xs mt-1">Your redeemed discounts will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 overflow-hidden" data-testid="transactions-table" style={{ borderRadius: '2px' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Vendor</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Discount</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.transaction_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5"><span className="flex items-center gap-2 text-sm font-medium text-[#0F172A]"><Store className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />{txn.vendor_name}</span></td>
                    <td className="px-5 py-3.5"><span className="text-xs font-bold text-[#002FA7]">{txn.discount}%</span></td>
                    <td className="px-5 py-3.5"><span className="flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="w-3 h-3" strokeWidth={2} />{formatDate(txn.timestamp)}</span></td>
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
