'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/header';
import FooterSection from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { getAllVendors } from '@/lib/firestore';
import { CATEGORY_ICONS } from '@/utils/constants';
import type { Vendor } from '@/types';
import { Search, MapPin, Store, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendors() {
      try {
        const data = await getAllVendors();
        setVendors(data);
      } catch (e) {
        console.error('Failed to load vendors', e);
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const categories = ['all', ...Array.from(new Set(vendors.map((v) => v.category)))];

  const filtered = vendors.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || v.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <AppHeader />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="py-8">
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-3xl font-semibold md:text-4xl"
            >
              Artha Student Network
            </TextEffect>
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.2}
              as="p"
              className="mt-2 text-muted-foreground"
            >
              Discover exclusive discounts from vendors near you
            </TextEffect>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                aria-label="Search vendors"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap" aria-label="Filter by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat !== 'all' && <span>{CATEGORY_ICONS[cat] || '🏪'}</span>}
                  <span className="capitalize">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Store className="size-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No vendors found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {vendors.length === 0 ? 'Vendors will appear here once added by admin' : 'Try a different search or filter'}
              </p>
            </div>
          ) : (
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
                  },
                },
                ...transitionVariants,
              }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((vendor) => (
                <Link key={vendor.id} href={`/vendor/${vendor.id}`}>
                  <Card className="group hover:border-foreground/20 transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                            {CATEGORY_ICONS[vendor.category] || '🏪'}
                          </div>
                          <div>
                            <CardTitle className="text-base">{vendor.name}</CardTitle>
                            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                              <MapPin className="size-3" />
                              <span className="text-xs">{vendor.location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {vendor.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vendor.description || 'Exclusive student discounts available'}
                      </p>
                      <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        <span className="font-mono text-xs">View offers</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </AnimatedGroup>
          )}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
