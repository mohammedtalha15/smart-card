import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Plus, X, Edit2, Trash2, Power, Ban } from 'lucide-react';

const CATEGORIES = ['cafe', 'restaurant', 'stationery', 'laundry', 'grocery', 'salon', 'gym', 'pharmacy', 'electronics', 'clothing', 'other'];
const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={2} /> },
];

export default function AdminVendors() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', category: 'cafe', description: '', image: '', email: '', password: 'vendor123' });

  const fetchVendors = async () => { try { const d = await apiFetch('/api/admin/vendors', { token: token || undefined }); setVendors(d.vendors); } catch {} setLoading(false); };
  useEffect(() => { fetchVendors(); }, [token]);

  const resetForm = () => { setForm({ name: '', location: '', category: 'cafe', description: '', image: '', email: '', password: 'vendor123' }); setEditingId(null); setShowForm(false); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await apiFetch(`/api/admin/vendors/${editingId}`, { method: 'PUT', body: JSON.stringify({ name: form.name, location: form.location, category: form.category, description: form.description, image: form.image }), token: token || undefined }); }
      else { await apiFetch('/api/admin/vendors', { method: 'POST', body: JSON.stringify(form), token: token || undefined }); }
      resetForm(); fetchVendors();
    } catch {}
  };
  const handleEdit = (v: any) => { setForm({ name: v.name, location: v.location, category: v.category, description: v.description, image: v.image || '', email: '', password: '' }); setEditingId(v.vendor_id); setShowForm(true); };
  const handleToggle = async (v: any, field: 'active' | 'blocked') => { try { await apiFetch(`/api/admin/vendors/${v.vendor_id}`, { method: 'PUT', body: JSON.stringify({ [field]: !v[field] }), token: token || undefined }); fetchVendors(); } catch {} };
  const handleDelete = async (id: string) => { if (!window.confirm('Delete this vendor?')) return; try { await apiFetch(`/api/admin/vendors/${id}`, { method: 'DELETE', token: token || undefined }); fetchVendors(); } catch {} };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="anim-fade-up" data-testid="admin-vendors">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A]">Vendors</h1><p className="mt-1 text-slate-500 text-sm">Manage vendor accounts.</p></div>
          <button data-testid="add-vendor-btn" onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#002FA7] text-white text-xs font-bold hover:bg-[#001D6C] transition-all" style={{ borderRadius: '2px' }}>
            <Plus className="w-4 h-4" strokeWidth={2} /> Add Vendor
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4" onClick={resetForm}>
            <div className="bg-white border border-slate-200 w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()} data-testid="vendor-form-modal" style={{ borderRadius: '2px' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold tracking-tighter">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h2>
                <button onClick={resetForm} data-testid="close-form-btn"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Name</label>
                  <input data-testid="vendor-name-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full h-10 px-3 border border-slate-200 text-sm mt-1 focus:border-[#002FA7] focus:ring-1 focus:ring-[#002FA7]" style={{ borderRadius: '2px' }} /></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Location</label>
                  <input data-testid="vendor-location-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required className="w-full h-10 px-3 border border-slate-200 text-sm mt-1 focus:border-[#002FA7]" style={{ borderRadius: '2px' }} /></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Category</label>
                  <select data-testid="vendor-category-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Description</label>
                  <textarea data-testid="vendor-description-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Image URL</label>
                  <input data-testid="vendor-image-input" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                {!editingId && (<>
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Login Email</label>
                    <input data-testid="vendor-email-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="auto-generated" className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Login Password</label>
                    <input data-testid="vendor-password-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                </>)}
                <button data-testid="submit-vendor-btn" type="submit" className="w-full h-10 bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-all" style={{ borderRadius: '2px' }}>
                  {editingId ? 'Update Vendor' : 'Create Vendor'}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse" style={{ borderRadius: '2px' }} />)}</div> : (
          <div className="bg-white border border-slate-200 overflow-hidden" data-testid="vendors-table" style={{ borderRadius: '2px' }}>
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Vendor</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Category</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Login</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Status</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Stats</th>
                <th className="text-right text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.vendor_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-[#0F172A]">{v.name}</p><p className="text-[10px] text-slate-400">{v.location}</p></td>
                    <td className="px-5 py-3.5"><span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-slate-50 text-slate-500" style={{ borderRadius: '2px' }}>{v.category}</span></td>
                    <td className="px-5 py-3.5 text-[10px] text-slate-400 font-mono">{v.account?.email || '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 ${v.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`} style={{ borderRadius: '2px' }}>{v.active ? 'Active' : 'Inactive'}</span>
                        {v.blocked && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-500" style={{ borderRadius: '2px' }}>Blocked</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-slate-400">{v.offer_count} offers &middot; {v.transaction_count} txns</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button data-testid={`edit-vendor-${v.vendor_id}`} onClick={() => handleEdit(v)} className="p-1.5 hover:bg-slate-100 text-slate-400 transition-colors" style={{ borderRadius: '2px' }}><Edit2 className="w-3.5 h-3.5" strokeWidth={2} /></button>
                        <button data-testid={`toggle-active-${v.vendor_id}`} onClick={() => handleToggle(v, 'active')} className="p-1.5 hover:bg-slate-100 text-slate-400 transition-colors" style={{ borderRadius: '2px' }}><Power className="w-3.5 h-3.5" strokeWidth={2} /></button>
                        <button data-testid={`toggle-block-${v.vendor_id}`} onClick={() => handleToggle(v, 'blocked')} className={`p-1.5 hover:bg-slate-100 transition-colors ${v.blocked ? 'text-red-500' : 'text-slate-400'}`} style={{ borderRadius: '2px' }}><Ban className="w-3.5 h-3.5" strokeWidth={2} /></button>
                        <button data-testid={`delete-vendor-${v.vendor_id}`} onClick={() => handleDelete(v.vendor_id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" style={{ borderRadius: '2px' }}><Trash2 className="w-3.5 h-3.5" strokeWidth={2} /></button>
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
