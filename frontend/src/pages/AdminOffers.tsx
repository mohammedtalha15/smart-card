import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, Store, Tag, Receipt, Globe, Plus, X, Edit2, Trash2, Power } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Vendors', path: '/admin/vendors', icon: <Store className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-4 h-4" strokeWidth={2} /> },
  { label: 'Domains', path: '/admin/domains', icon: <Globe className="w-4 h-4" strokeWidth={2} /> },
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
      const [o, v] = await Promise.all([
        apiFetch('/api/admin/offers', { token: token || undefined }),
        apiFetch('/api/admin/vendors', { token: token || undefined }),
      ]);
      setOffers(o.offers); setVendors(v.vendors);
    } catch {} setLoading(false);
  };
  useEffect(() => { fetchData(); }, [token]);

  const resetForm = () => { setForm({ vendor_id: '', discount: 10, description: '', max_uses_per_user: 5 }); setEditingId(null); setShowForm(false); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await apiFetch(`/api/admin/offers/${editingId}`, { method: 'PUT', body: JSON.stringify({ discount: form.discount, description: form.description, max_uses_per_user: form.max_uses_per_user }), token: token || undefined }); }
      else { await apiFetch('/api/admin/offers', { method: 'POST', body: JSON.stringify(form), token: token || undefined }); }
      resetForm(); fetchData();
    } catch {}
  };
  const handleEdit = (o: any) => { setForm({ vendor_id: o.vendor_id, discount: o.discount, description: o.description, max_uses_per_user: o.max_uses_per_user }); setEditingId(o.offer_id); setShowForm(true); };
  const handleToggle = async (o: any) => { try { await apiFetch(`/api/admin/offers/${o.offer_id}`, { method: 'PUT', body: JSON.stringify({ active: !o.active }), token: token || undefined }); fetchData(); } catch {} };
  const handleDelete = async (id: string) => { if (!window.confirm('Delete this offer?')) return; try { await apiFetch(`/api/admin/offers/${id}`, { method: 'DELETE', token: token || undefined }); fetchData(); } catch {} };

  return (
    <SidebarLayout navItems={adminNav} title="Admin">
      <div className="anim-fade-up" data-testid="admin-offers">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A]">Offers</h1><p className="mt-1 text-slate-500 text-sm">Manage discount offers.</p></div>
          <button data-testid="add-offer-btn" onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#002FA7] text-white text-xs font-bold hover:bg-[#001D6C] transition-all" style={{ borderRadius: '2px' }}>
            <Plus className="w-4 h-4" strokeWidth={2} /> Add Offer
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4" onClick={resetForm}>
            <div className="bg-white border border-slate-200 w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()} data-testid="offer-form-modal" style={{ borderRadius: '2px' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold tracking-tighter">{editingId ? 'Edit Offer' : 'Create Offer'}</h2>
                <button onClick={resetForm} data-testid="close-offer-form-btn"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {!editingId && (
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Vendor</label>
                    <select data-testid="offer-vendor-select" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})} required className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }}>
                      <option value="">Select vendor</option>
                      {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                    </select></div>
                )}
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Discount %</label>
                  <input data-testid="offer-discount-input" type="number" min={1} max={100} value={form.discount} onChange={e => setForm({...form, discount: parseInt(e.target.value) || 0})} required className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Description</label>
                  <textarea data-testid="offer-description-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={2} className="w-full px-3 py-2 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Max Uses Per User</label>
                  <input data-testid="offer-max-uses-input" type="number" min={1} value={form.max_uses_per_user} onChange={e => setForm({...form, max_uses_per_user: parseInt(e.target.value) || 1})} className="w-full h-10 px-3 border border-slate-200 text-sm mt-1" style={{ borderRadius: '2px' }} /></div>
                <button data-testid="submit-offer-btn" type="submit" className="w-full h-10 bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800" style={{ borderRadius: '2px' }}>
                  {editingId ? 'Update Offer' : 'Create Offer'}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse" style={{ borderRadius: '2px' }} />)}</div> : (
          <div className="bg-white border border-slate-200 overflow-hidden" data-testid="offers-table" style={{ borderRadius: '2px' }}>
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Vendor</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Discount</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Description</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Usage</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Status</th>
                <th className="text-right text-[10px] font-bold tracking-widest uppercase text-slate-400 px-5 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {offers.map(o => (
                  <tr key={o.offer_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#0F172A]">{o.vendor_name}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-bold text-[#002FA7]">{o.discount}%</span></td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs truncate">{o.description}</td>
                    <td className="px-5 py-3.5 text-[10px] text-slate-400">{o.total_uses || 0} / {o.max_uses_per_user} per user</td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 ${o.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`} style={{ borderRadius: '2px' }}>{o.active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button data-testid={`edit-offer-${o.offer_id}`} onClick={() => handleEdit(o)} className="p-1.5 hover:bg-slate-100 text-slate-400" style={{ borderRadius: '2px' }}><Edit2 className="w-3.5 h-3.5" strokeWidth={2} /></button>
                        <button data-testid={`toggle-offer-${o.offer_id}`} onClick={() => handleToggle(o)} className="p-1.5 hover:bg-slate-100 text-slate-400" style={{ borderRadius: '2px' }}><Power className="w-3.5 h-3.5" strokeWidth={2} /></button>
                        <button data-testid={`delete-offer-${o.offer_id}`} onClick={() => handleDelete(o.offer_id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500" style={{ borderRadius: '2px' }}><Trash2 className="w-3.5 h-3.5" strokeWidth={2} /></button>
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
