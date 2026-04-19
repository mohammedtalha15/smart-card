'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { createVendor, getAllVendors, updateVendor } from '@/lib/firestore';
import { VENDOR_CATEGORIES, CATEGORY_ICONS } from '@/utils/constants';
import type { Vendor } from '@/types';
import { Loader2, Plus, MapPin, Store, Ban, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminVendorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', category: 'cafe', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    loadVendors();
  }, [user, authLoading, router]);

  async function loadVendors() {
    try {
      const data = await getAllVendors();
      setVendors(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createVendor({
        name: form.name, location: form.location, category: form.category,
        description: form.description, image: '', ownerId: user?.id || '',
        active: true, blocked: false,
      });
      toast.success('Vendor created');
      setForm({ name: '', location: '', category: 'cafe', description: '' });
      setShowForm(false);
      loadVendors();
    } catch (e) { toast.error('Failed to create vendor'); }
    finally { setSubmitting(false); }
  }

  async function toggleBlock(vendor: Vendor) {
    try {
      await updateVendor(vendor.id, { blocked: !vendor.blocked, active: !!vendor.blocked });
      toast.success(vendor.blocked ? 'Vendor unblocked' : 'Vendor blocked');
      loadVendors();
    } catch (e) { toast.error('Failed to update vendor'); }
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
                Manage Vendors
              </TextEffect>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="size-4" /><span>{showForm ? 'Cancel' : 'Add Vendor'}</span>
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader><CardTitle>New Vendor</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Location</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Category</Label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    >
                      {VENDOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase text-muted-foreground">Description</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Vendor'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <Store className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vendors yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((v) => (
                <Card key={v.id} className="py-3">
                  <CardContent className="flex items-center justify-between px-6 py-0">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-secondary flex items-center justify-center text-lg">
                        {CATEGORY_ICONS[v.category] || '🏪'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{v.name}</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="size-3" /><span className="text-xs">{v.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={v.blocked ? 'destructive' : 'secondary'}>
                        {v.blocked ? 'Blocked' : 'Active'}
                      </Badge>
                      <Button variant="ghost" size="icon-xs" onClick={() => toggleBlock(v)}>
                        {v.blocked ? <CheckCircle2 className="size-4 text-green-500" /> : <Ban className="size-4 text-destructive" />}
                      </Button>
                    </div>
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
