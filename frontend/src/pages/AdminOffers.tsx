import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Plus, X, Edit2, Trash2, Power } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={1.5} /> },
];

export default function AdminOffers() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ vendor_id: '', discount: 10, description: '', max_uses_per_user: 5 });

  const fetchData = async () => {
    try {
      const [offersData, vendorsData] = await Promise.all([
        apiFetch('/api/admin/offers', { token: token || undefined }),
        apiFetch('/api/admin/vendors', { token: token || undefined }),
      ]);
      setOffers(offersData.offers);
      setVendors(vendorsData.vendors);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [token]);

  const resetForm = () => {
    setForm({ vendor_id: '', discount: 10, description: '', max_uses_per_user: 5 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/api/admin/offers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ discount: form.discount, description: form.description, max_uses_per_user: form.max_uses_per_user }),
          token: token || undefined,
        });
      } else {
        await apiFetch('/api/admin/offers', {
          method: 'POST',
          body: JSON.stringify(form),
          token: token || undefined,
        });
      }
      resetForm();
      fetchData();
    } catch {}
  };

  const handleEdit = (o: any) => {
    setForm({ vendor_id: o.vendor_id, discount: o.discount, description: o.description, max_uses_per_user: o.max_uses_per_user });
    setEditingId(o.offer_id);
    setShowForm(true);
  };

  const handleToggle = async (o: any) => {
    try {
      await apiFetch(`/api/admin/offers/${o.offer_id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !o.active }),
        token: token || undefined,
      });
      fetchData();
    } catch {}
  };

  const handleDelete = async (offerId: string) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await apiFetch(`/api/admin/offers/${offerId}`, { method: 'DELETE', token: token || undefined });
      fetchData();
    } catch {}
  };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="animate-fade-in-up" data-testid="admin-offers">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Offers</h1>
            <p className="mt-1 text-zinc-500">Manage discount offers across vendors.</p>
          </div>
          <button
            data-testid="add-offer-btn"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Offer
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={resetForm}>
            <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()} data-testid="offer-form-modal">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Offer' : 'Create Offer'}</h2>
                <button onClick={resetForm} data-testid="close-offer-form-btn"><X className="w-5 h-5 text-zinc-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {!editingId && (
                  <div>
                    <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Vendor</label>
                    <select data-testid="offer-vendor-select" value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} required className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1">
                      <option value="">Select vendor</option>
                      {vendors.map((v) => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Discount %</label>
                  <input data-testid="offer-discount-input" type="number" min={1} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} required className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Description</label>
                  <textarea data-testid="offer-description-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={2} className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Max Uses Per User</label>
                  <input data-testid="offer-max-uses-input" type="number" min={1} value={form.max_uses_per_user} onChange={(e) => setForm({ ...form, max_uses_per_user: parseInt(e.target.value) || 1 })} className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                <button data-testid="submit-offer-btn" type="submit" className="w-full h-10 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all">
                  {editingId ? 'Update Offer' : 'Create Offer'}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden" data-testid="offers-table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Vendor</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Discount</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Description</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Usage</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Status</th>
                  <th className="text-right text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.offer_id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium">{o.vendor_name}</td>
                    <td className="px-5 py-3.5"><span className="text-sm font-bold text-emerald-600">{o.discount}%</span></td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600 max-w-xs truncate">{o.description}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500">{o.total_uses || 0} / {o.max_uses_per_user} per user</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {o.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button data-testid={`edit-offer-${o.offer_id}`} onClick={() => handleEdit(o)} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500"><Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                        <button data-testid={`toggle-offer-${o.offer_id}`} onClick={() => handleToggle(o)} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500"><Power className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                        <button data-testid={`delete-offer-${o.offer_id}`} onClick={() => handleDelete(o.offer_id)} className="p-1.5 rounded-md hover:bg-red-50 text-zinc-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                      </div>
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
