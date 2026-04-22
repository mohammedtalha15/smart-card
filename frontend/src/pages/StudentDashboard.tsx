import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { LayoutDashboard, History, Search, MapPin, Tag, ChevronRight, Store, Percent } from 'lucide-react';

const CATEGORIES = ['all', 'cafe', 'restaurant', 'stationery', 'laundry', 'grocery', 'salon', 'gym', 'pharmacy', 'electronics', 'clothing'];

interface Vendor {
  vendor_id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
  offer_count: number;
}

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={2} /> },
];

export default function StudentDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category !== 'all') params.set('category', category);
        const data = await apiFetch(`/api/vendors?${params}`, { token: token || undefined });
        setVendors(data.vendors);
      } catch {}
      setLoading(false);
    };
    fetchVendors();
  }, [search, category, token]);

  return (
    <SidebarLayout navItems={studentNav} title="Student">
      <div className="anim-fade-up" data-testid="student-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tighter text-[#0F172A]">Discover Vendors</h1>
          <p className="mt-1 text-slate-500 text-sm">Find exclusive student discounts near you.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={2} />
            <input
              data-testid="vendor-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full h-10 pl-10 pr-4 border border-slate-200 bg-white text-sm focus:border-[#002FA7] focus:ring-1 focus:ring-[#002FA7] transition-all"
              style={{ borderRadius: '2px' }}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`filter-${cat}`}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                }`}
                style={{ borderRadius: '2px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 p-5 animate-pulse" style={{ borderRadius: '2px' }}>
                <div className="w-full h-36 bg-slate-100 mb-4" style={{ borderRadius: '2px' }} />
                <div className="h-5 bg-slate-100 w-3/4 mb-2" style={{ borderRadius: '2px' }} />
                <div className="h-4 bg-slate-100 w-1/2" style={{ borderRadius: '2px' }} />
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16" data-testid="no-vendors">
            <Store className="w-8 h-8 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 font-medium text-sm">No vendors found</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="vendor-grid">
            {vendors.map((v, i) => (
              <button
                key={v.vendor_id}
                data-testid={`vendor-card-${v.vendor_id}`}
                onClick={() => navigate(`/vendor/${v.vendor_id}`)}
                className="bg-white border border-slate-200 p-0 text-left hover:border-slate-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
                style={{ borderRadius: '2px', animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-full h-40 bg-slate-100 overflow-hidden">
                  {v.image && (
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-sm tracking-tight text-[#0F172A] truncate">{v.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-slate-300 shrink-0" strokeWidth={2} />
                        <span className="text-xs text-slate-400 truncate">{v.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-[10px] font-bold tracking-wider uppercase text-slate-500" style={{ borderRadius: '2px' }}>
                          <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                          {v.category}
                        </span>
                        {v.offer_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#002FA7]">
                            <Percent className="w-2.5 h-2.5" strokeWidth={2} />
                            {v.offer_count} offer{v.offer_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-500 shrink-0 transition-colors" strokeWidth={2} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
