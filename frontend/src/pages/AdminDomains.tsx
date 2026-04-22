import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Plus, Trash2 } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={2} /> },
];

export default function AdminDomains() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchDomains = async () => { try { const d = await apiFetch('/api/admin/domains', { token: token || undefined }); setDomains(d.domains); } catch {} setLoading(false); };
  useEffect(() => { fetchDomains(); }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newDomain.trim()) return; setAdding(true);
    try { await apiFetch('/api/admin/domains', { method: 'POST', body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }), token: token || undefined }); setNewDomain(''); fetchDomains(); } catch {} setAdding(false);
  };

  const handleDelete = async (domain: string) => {
    if (!window.confirm(`Remove "${domain}"?`)) return;
    try { await apiFetch(`/api/admin/domains/${domain}`, { method: 'DELETE', token: token || undefined }); fetchDomains(); } catch {}
  };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="anim-fade-up max-w-2xl" data-testid="admin-domains">
        <h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A] mb-1">Allowed Domains</h1>
        <p className="text-slate-500 text-sm mb-6">Manage which college email domains can sign up.</p>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6" data-testid="add-domain-form">
          <input data-testid="domain-input" type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="e.g. college.edu.in"
            className="flex-1 h-10 px-3 border border-slate-200 text-sm focus:border-[#002FA7] focus:ring-1 focus:ring-[#002FA7]" style={{ borderRadius: '2px' }} />
          <button data-testid="add-domain-btn" type="submit" disabled={adding}
            className="flex items-center gap-2 px-4 h-10 bg-[#002FA7] text-white text-xs font-bold hover:bg-[#001D6C] disabled:opacity-50 transition-all" style={{ borderRadius: '2px' }}>
            <Plus className="w-4 h-4" strokeWidth={2} /> Add
          </button>
        </form>

        {loading ? <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-slate-100 animate-pulse" style={{ borderRadius: '2px' }} />)}</div>
        : domains.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 text-center" style={{ borderRadius: '2px' }}>
            <Globe className="w-8 h-8 text-slate-200 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-slate-400 text-sm">No domains configured.</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="domains-list">
            {domains.map(d => (
              <div key={d.domain} className="bg-white border border-slate-200 px-5 py-3.5 flex items-center justify-between hover:border-slate-400 transition-all" style={{ borderRadius: '2px' }}>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-300" strokeWidth={2} />
                  <span className="text-sm font-medium font-mono text-[#0F172A]">@{d.domain}</span>
                </div>
                <button data-testid={`delete-domain-${d.domain}`} onClick={() => handleDelete(d.domain)}
                  className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors" style={{ borderRadius: '2px' }}>
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
