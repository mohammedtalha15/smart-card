import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, ArrowLeft, MapPin, Tag, Percent, QrCode, Clock } from 'lucide-react';

interface Vendor {
  vendor_id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
}

interface Offer {
  offer_id: string;
  vendor_id: string;
  discount: number;
  description: string;
  max_uses_per_user: number;
}

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={1.5} /> },
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

  const handleGetDiscount = (offerId: string) => {
    navigate(`/qr?vendor_id=${id}&offer_id=${offerId}`);
  };

  if (loading) {
    return (
      <SidebarLayout navItems={studentNav} title="Student">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-100 rounded w-48" />
          <div className="h-48 bg-zinc-100 rounded-lg" />
          <div className="h-4 bg-zinc-100 rounded w-3/4" />
        </div>
      </SidebarLayout>
    );
  }

  if (!vendor) {
    return (
      <SidebarLayout navItems={studentNav} title="Student">
        <p className="text-zinc-500">Vendor not found.</p>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="animate-fade-in-up max-w-3xl" data-testid="vendor-detail">
        <button
          data-testid="back-btn"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to vendors
        </button>

        {/* Vendor Header */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          {vendor.image && (
            <div className="w-full h-56 bg-zinc-100">
              <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight">{vendor.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    {vendor.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Tag className="w-4 h-4" strokeWidth={1.5} />
                    {vendor.category}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-zinc-600 leading-relaxed">{vendor.description}</p>
          </div>
        </div>

        {/* Active Offers */}
        <div className="mt-6">
          <h2 className="text-lg font-heading font-bold tracking-tight mb-4">Active Offers</h2>
          {offers.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
              <p className="text-zinc-500">No active offers at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="offers-list">
              {offers.map((offer) => (
                <div
                  key={offer.offer_id}
                  data-testid={`offer-${offer.offer_id}`}
                  className="bg-white border border-zinc-200 rounded-lg p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold">
                        <Percent className="w-3.5 h-3.5" strokeWidth={2} />
                        {offer.discount}% OFF
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 mt-1">{offer.description}</p>
                    <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      Max {offer.max_uses_per_user} uses per student
                    </p>
                  </div>
                  <button
                    data-testid={`get-discount-btn-${offer.offer_id}`}
                    onClick={() => handleGetDiscount(offer.offer_id)}
                    className="ml-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
                  >
                    <QrCode className="w-4 h-4" strokeWidth={1.5} />
                    Get Discount
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
