import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, ArrowLeft, MapPin, Tag, Percent, QrCode, Clock } from 'lucide-react';

interface Vendor { vendor_id: string; name: string; location: string; category: string; description: string; image: string; }
interface Offer { offer_id: string; vendor_id: string; discount: number; description: string; max_uses_per_user: number; }

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={2} /> },
];

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiFetch(`/api/vendors/${id}`, { token: token || undefined });
        setVendor(data.vendor);
        setOffers(data.offers);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [id, token]);

  if (loading) return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="animate-pulse space-y-4 max-w-3xl">
        <div className="h-6 bg-slate-100 w-32" style={{ borderRadius: '2px' }} />
        <div className="h-48 bg-slate-100" style={{ borderRadius: '2px' }} />
      </div>
    </SidebarLayout>
  );

  if (!vendor) return <SidebarLayout navItems={studentNav} title="Student"><p className="text-slate-500 text-sm">Vendor not found.</p></SidebarLayout>;

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="anim-fade-up max-w-3xl" data-testid="vendor-detail">
        <button data-testid="back-btn" onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0F172A] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> Back to vendors
        </button>

        <div className="bg-white border border-slate-200 overflow-hidden" style={{ borderRadius: '2px' }}>
          {vendor.image && (
            <div className="w-full h-56 bg-slate-100">
              <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-2xl font-heading font-bold tracking-tighter text-[#0F172A]">{vendor.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5" strokeWidth={2} /> {vendor.location}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Tag className="w-3.5 h-3.5" strokeWidth={2} /> {vendor.category}
              </span>
            </div>
            <p className="mt-4 text-slate-500 text-sm leading-relaxed">{vendor.description}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-4">Active Offers</h2>
          {offers.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 text-center" style={{ borderRadius: '2px' }}>
              <p className="text-slate-400 text-sm">No active offers right now.</p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="offers-list">
              {offers.map((offer) => (
                <div key={offer.offer_id} data-testid={`offer-${offer.offer_id}`} className="bg-white border border-slate-200 p-5 flex items-center justify-between hover:border-slate-400 transition-all" style={{ borderRadius: '2px' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#002FA710] text-[#002FA7] text-sm font-bold" style={{ borderRadius: '2px' }}>
                        <Percent className="w-3.5 h-3.5" strokeWidth={2} /> {offer.discount}% OFF
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5">{offer.description}</p>
                    <p className="text-[10px] text-slate-300 mt-1.5 flex items-center gap-1 font-bold tracking-wider uppercase">
                      <Clock className="w-3 h-3" strokeWidth={2} /> Max {offer.max_uses_per_user} uses per student
                    </p>
                  </div>
                  <button
                    data-testid={`get-discount-btn-${offer.offer_id}`}
                    onClick={() => navigate(`/qr?vendor_id=${id}&offer_id=${offer.offer_id}`)}
                    className="ml-4 flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.97]"
                    style={{ borderRadius: '2px' }}
                  >
                    <QrCode className="w-4 h-4" strokeWidth={2} /> Get Discount
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
