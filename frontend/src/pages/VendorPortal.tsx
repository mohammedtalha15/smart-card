import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, ScanLine, Users, ScanBarcode, TrendingUp, Calendar, Store, Percent } from 'lucide-react';

const vendorNav = [
  { label: 'Dashboard', path: '/vendor-portal', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Scan QR', path: '/vendor-portal/scan', icon: <ScanLine className="w-4 h-4" strokeWidth={1.5} /> },
];

interface DashboardData {
  vendor: any;
  total_scans: number;
  unique_users: number;
  recent_transactions: any[];
  offers: any[];
}

export default function VendorPortal() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const d = await apiFetch('/api/vendor/dashboard', { token: token || undefined });
        setData(d);
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

  if (loading) {
    return (
      <SidebarLayout navItems={vendorNav} title="Vendor">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-100 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-zinc-100 rounded-lg" />)}
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navItems={vendorNav} title="Vendor">
      <div className="animate-fade-in-up" data-testid="vendor-dashboard">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">{data?.vendor?.name || 'Vendor Dashboard'}</h1>
            <p className="mt-1 text-zinc-500">Overview of your discount redemptions.</p>
          </div>
          <button
            data-testid="open-scanner-btn"
            onClick={() => navigate('/vendor-portal/scan')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <ScanBarcode className="w-4 h-4" strokeWidth={1.5} />
            Scan QR Code
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-testid="vendor-stats">
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-zinc-400">Total Scans</p>
                <p className="text-2xl font-heading font-bold">{data?.total_scans || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-zinc-400">Unique Users</p>
                <p className="text-2xl font-heading font-bold">{data?.unique_users || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-zinc-400">Active Offers</p>
                <p className="text-2xl font-heading font-bold">{data?.offers?.filter((o: any) => o.active).length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <h2 className="text-lg font-heading font-bold tracking-tight mb-3">Recent Activity</h2>
        {!data?.recent_transactions?.length ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center" data-testid="no-recent-activity">
            <Store className="w-8 h-8 text-zinc-300 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-zinc-500 text-sm">No recent scans yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden" data-testid="recent-activity-table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Student</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Discount</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_transactions.map((txn: any) => (
                  <tr key={txn.transaction_id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">{txn.user_name || txn.user_email}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-emerald-600">{txn.discount}%</span>
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
