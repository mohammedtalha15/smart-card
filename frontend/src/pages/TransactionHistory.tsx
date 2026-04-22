import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, Store, Percent, Calendar } from 'lucide-react';

interface Transaction {
  transaction_id: string;
  vendor_name: string;
  discount: number;
  timestamp: string;
}

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={1.5} /> },
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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="animate-fade-in-up" data-testid="transaction-history">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Transaction History</h1>
        <p className="text-zinc-500 mb-6">Your past redemptions.</p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-zinc-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zinc-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center" data-testid="no-transactions">
            <History className="w-10 h-10 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-zinc-500 font-medium">No transactions yet</p>
            <p className="text-zinc-400 text-sm mt-1">Your redeemed discounts will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden" data-testid="transactions-table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Vendor</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Discount</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.transaction_id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <Store className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                        {txn.vendor_name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        <Percent className="w-3 h-3" strokeWidth={2} />
                        {txn.discount}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {formatDate(txn.timestamp)}
                      </span>
                    </td>
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
