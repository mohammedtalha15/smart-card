'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { createOffer, getAllOffers, getAllVendors } from '@/lib/firestore';
import type { Offer, Vendor } from '@/types';
import { Loader2, Plus, Clock, ArrowLeft, Percent } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminOffersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendorId: '', discount: 10, description: '',
    startTime: '09:00', endTime: '21:00', maxUsesPerUser: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    loadData();
  }, [user, authLoading, router]);

  async function loadData() {
    try {
      const [o, v] = await Promise.all([getAllOffers(), getAllVendors()]);
      setOffers(o);
      setVendors(v);
      if (v.length > 0 && !form.vendorId) setForm((f) => ({ ...f, vendorId: v[0].id }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const vendor = vendors.find((v) => v.id === form.vendorId);
      await createOffer({
        vendorId: form.vendorId, vendorName: vendor?.name || '',
        discount: form.discount, description: form.description,
        startTime: form.startTime, endTime: form.endTime,
        maxUsesPerUser: form.maxUsesPerUser, active: true,
      });
      toast.success('Offer created');
      setShowForm(false);
      loadData();
    } catch (e) { toast.error('Failed to create offer'); }
    finally { setSubmitting(false); }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  return (
    <>
      <AppHeader />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="py-8">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="size-3.5" /><span className="font-mono text-xs">Admin</span>
            </Link>
            <div className="flex items-center justify-between">
              <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-2xl font-semibold">
                Manage Offers
              </TextEffect>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="size-4" /><span>{showForm ? 'Cancel' : 'Add Offer'}</span>
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader><CardTitle>New Offer</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Vendor</Label>
                    <select
                      value={form.vendorId}
                      onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      required
                    >
                      {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Discount %</Label>
                    <Input type="number" min={1} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: +e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Max Uses / User</Label>
                    <Input type="number" min={1} value={form.maxUsesPerUser} onChange={(e) => setForm({ ...form, maxUsesPerUser: +e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Start Time</Label>
                    <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">End Time</Label>
                    <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Description</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Flat 15% off on all beverages" />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Offer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No offers yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {offers.map((o) => (
                <Card key={o.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{o.discount}% OFF</CardTitle>
                      <Badge variant="secondary">{o.vendorName}</Badge>
                    </div>
                    <CardDescription>{o.description || 'Student discount'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      <span className="font-mono text-xs">{o.startTime} – {o.endTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Max {o.maxUsesPerUser} uses/student</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
