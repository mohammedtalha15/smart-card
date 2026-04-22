import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, ScanLine, Users, ScanBarcode, TrendingUp, Calendar, Percent } from 'lucide-react';

const vendorNav = [
  { label: 'Dashboard', path: '/vendor-portal', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Scan QR', path: '/vendor-portal/scan', icon: <ScanLine className="w-4 h-4" strokeWidth={2} /> },
];

export default function VendorPortal() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const d = await apiFetch('/api/vendor/dashboard', { token: token || undefined }); setData(d); } catch {}
      setLoading(false);
    };
    fetch();
  }, [token]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (loading) return <SidebarLayout navItems={vendorNav} title="Vendor"><div className="animate-pulse space-y-4"><div className="h-8 bg-slate-100 w-48" style={{ borderRadius: '2px' }} /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100" style={{ borderRadius: '2px' }} />)}</div></div></SidebarLayout>;

  return (
    <SidebarLayout navItems={vendorNav} title="Vendor">
      <div className="anim-fade-up" data-testid="vendor-dashboard">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A]">{data?.vendor?.name || 'Dashboard'}</h1>
            <p className="mt-1 text-slate-500 text-sm">Overview of your discount redemptions.</p>
          </div>
          <button data-testid="open-scanner-btn" onClick={() => navigate('/vendor-portal/scan')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#002FA7] text-white text-xs font-bold hover:bg-[#001D6C] transition-all active:scale-[0.97]" style={{ borderRadius: '2px' }}>
            <ScanBarcode className="w-4 h-4" strokeWidth={2} /> Scan QR Code
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-testid="vendor-stats">
          {[
            { label: 'Total Scans', value: data?.total_scans || 0, icon: TrendingUp },
            { label: 'Unique Users', value: data?.unique_users || 0, icon: Users },
            { label: 'Active Offers', value: data?.offers?.filter((o: any) => o.active).length || 0, icon: Percent },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 p-5" style={{ borderRadius: '2px' }}>
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

        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-300 mb-3">Recent Activity</p>
        {!data?.recent_transactions?.length ? (
          <div className="bg-white border border-slate-200 p-8 text-center" data-testid="no-recent-activity" style={{ borderRadius: '2px' }}>
            <p className="text-slate-400 text-sm">No recent scans yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 overflow-hidden" data-testid="recent-activity-table" style={{ borderRadius: '2px' }}>
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Student</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Discount</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Time</th>
              </tr></thead>
              <tbody>
                {data.recent_transactions.map((txn: any) => (
                  <tr key={txn.transaction_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#0F172A]">{txn.user_name || txn.user_email}</td>
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
