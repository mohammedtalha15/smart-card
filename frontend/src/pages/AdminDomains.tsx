import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Plus, Trash2, X } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={1.5} /> },
];

export default function AdminDomains() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchDomains = async () => {
    try {
      const data = await apiFetch('/api/admin/domains', { token: token || undefined });
      setDomains(data.domains);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchDomains(); }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAdding(true);
    try {
      await apiFetch('/api/admin/domains', {
        method: 'POST',
        body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
        token: token || undefined,
      });
      setNewDomain('');
      fetchDomains();
    } catch {}
    setAdding(false);
  };

  const handleDelete = async (domain: string) => {
    if (!window.confirm(`Remove domain "${domain}"?`)) return;
    try {
      await apiFetch(`/api/admin/domains/${domain}`, { method: 'DELETE', token: token || undefined });
      fetchDomains();
    } catch {}
  };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="animate-fade-in-up max-w-2xl" data-testid="admin-domains">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Allowed Domains</h1>
        <p className="text-zinc-500 mb-6">Manage which college email domains can sign up as students.</p>

        {/* Add Domain */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6" data-testid="add-domain-form">
          <input
            data-testid="domain-input"
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. college.edu.in"
            className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
          <button
            data-testid="add-domain-btn"
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add
          </button>
        </form>

        {/* Domain List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : domains.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
            <Globe className="w-8 h-8 text-zinc-300 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-zinc-500 text-sm">No allowed domains configured.</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="domains-list">
            {domains.map((d) => (
              <div
                key={d.domain}
                className="bg-white border border-zinc-200 rounded-lg px-5 py-3.5 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="text-sm font-medium font-mono">@{d.domain}</span>
                </div>
                <button
                  data-testid={`delete-domain-${d.domain}`}
                  onClick={() => handleDelete(d.domain)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
