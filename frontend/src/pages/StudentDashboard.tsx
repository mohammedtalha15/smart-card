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
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
  { label: 'History', path: '/history', icon: <History className="w-4 h-4" strokeWidth={1.5} /> },
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
      <div className="animate-fade-in-up" data-testid="student-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Discover Vendors</h1>
          <p className="mt-1 text-zinc-500">Find exclusive student discounts near you.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <input
              data-testid="vendor-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 bg-white text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`filter-${cat}`}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-lg p-5 animate-pulse">
                <div className="w-full h-36 bg-zinc-100 rounded-md mb-4" />
                <div className="h-5 bg-zinc-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-zinc-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16" data-testid="no-vendors">
            <Store className="w-10 h-10 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-zinc-500 font-medium">No vendors found</p>
            <p className="text-zinc-400 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="vendor-grid">
            {vendors.map((v) => (
              <button
                key={v.vendor_id}
                data-testid={`vendor-card-${v.vendor_id}`}
                onClick={() => navigate(`/vendor/${v.vendor_id}`)}
                className="bg-white border border-zinc-200 rounded-lg p-5 text-left hover:shadow-md hover:border-zinc-300 transition-all group"
              >
                <div className="w-full h-36 bg-zinc-100 rounded-md mb-4 overflow-hidden">
                  {v.image && (
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-base truncate">{v.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-xs text-zinc-500 truncate">{v.location}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                        <Tag className="w-3 h-3" strokeWidth={1.5} />
                        {v.category}
                      </span>
                      {v.offer_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Percent className="w-3 h-3" strokeWidth={1.5} />
                          {v.offer_count} offer{v.offer_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 shrink-0 mt-1 transition-colors" strokeWidth={1.5} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
