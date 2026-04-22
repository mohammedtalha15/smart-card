import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Plus, X, Edit2, Trash2, Power, Ban } from 'lucide-react';

const CATEGORIES = ['cafe', 'restaurant', 'stationery', 'laundry', 'grocery', 'salon', 'gym', 'pharmacy', 'electronics', 'clothing', 'other'];

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={1.5} /> },
];

export default function AdminVendors() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', category: 'cafe', description: '', image: '', email: '', password: 'vendor123' });

  const fetchVendors = async () => {
    try {
      const data = await apiFetch('/api/admin/vendors', { token: token || undefined });
      setVendors(data.vendors);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, [token]);

  const resetForm = () => {
    setForm({ name: '', location: '', category: 'cafe', description: '', image: '', email: '', password: 'vendor123' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/api/admin/vendors/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: form.name, location: form.location, category: form.category, description: form.description, image: form.image }),
          token: token || undefined,
        });
      } else {
        await apiFetch('/api/admin/vendors', {
          method: 'POST',
          body: JSON.stringify(form),
          token: token || undefined,
        });
      }
      resetForm();
      fetchVendors();
    } catch {}
  };

  const handleEdit = (v: any) => {
    setForm({ name: v.name, location: v.location, category: v.category, description: v.description, image: v.image || '', email: '', password: '' });
    setEditingId(v.vendor_id);
    setShowForm(true);
  };

  const handleToggle = async (v: any, field: 'active' | 'blocked') => {
    try {
      await apiFetch(`/api/admin/vendors/${v.vendor_id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: !v[field] }),
        token: token || undefined,
      });
      fetchVendors();
    } catch {}
  };

  const handleDelete = async (vendorId: string) => {
    if (!window.confirm('Delete this vendor? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/admin/vendors/${vendorId}`, { method: 'DELETE', token: token || undefined });
      fetchVendors();
    } catch {}
  };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="animate-fade-in-up" data-testid="admin-vendors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Vendors</h1>
            <p className="mt-1 text-zinc-500">Manage vendor accounts and profiles.</p>
          </div>
          <button
            data-testid="add-vendor-btn"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Vendor
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={resetForm}>
            <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()} data-testid="vendor-form-modal">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                <button onClick={resetForm} data-testid="close-form-btn"><X className="w-5 h-5 text-zinc-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Name</label>
                  <input data-testid="vendor-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Location</label>
                  <input data-testid="vendor-location-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Category</label>
                  <select data-testid="vendor-category-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Description</label>
                  <textarea data-testid="vendor-description-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Image URL</label>
                  <input data-testid="vendor-image-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                </div>
                {!editingId && (
                  <>
                    <div>
                      <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Login Email</label>
                      <input data-testid="vendor-email-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="auto-generated if empty" className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">Login Password</label>
                      <input data-testid="vendor-password-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm mt-1" />
                    </div>
                  </>
                )}
                <button data-testid="submit-vendor-btn" type="submit" className="w-full h-10 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all">
                  {editingId ? 'Update Vendor' : 'Create Vendor'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Vendor Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden" data-testid="vendors-table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Vendor</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Category</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Login</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Stats</th>
                  <th className="text-right text-xs font-bold tracking-wider uppercase text-zinc-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.vendor_id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900">{v.name}</p>
                      <p className="text-xs text-zinc-500">{v.location}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 rounded-full">{v.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 font-mono">{v.account?.email || '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                          {v.active ? 'Active' : 'Inactive'}
                        </span>
                        {v.blocked && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">Blocked</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500">
                      {v.offer_count} offers &middot; {v.transaction_count} txns
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button data-testid={`edit-vendor-${v.vendor_id}`} onClick={() => handleEdit(v)} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button data-testid={`toggle-active-${v.vendor_id}`} onClick={() => handleToggle(v, 'active')} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500" title={v.active ? 'Deactivate' : 'Activate'}>
                          <Power className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button data-testid={`toggle-block-${v.vendor_id}`} onClick={() => handleToggle(v, 'blocked')} className={`p-1.5 rounded-md hover:bg-zinc-100 ${v.blocked ? 'text-red-500' : 'text-zinc-500'}`} title={v.blocked ? 'Unblock' : 'Block'}>
                          <Ban className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button data-testid={`delete-vendor-${v.vendor_id}`} onClick={() => handleDelete(v.vendor_id)} className="p-1.5 rounded-md hover:bg-red-50 text-zinc-500 hover:text-red-600" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
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
