'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import FooterSection from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { getVendor, getOffersForVendor } from '@/lib/firestore';
import { CATEGORY_ICONS } from '@/utils/constants';
import { isOfferActive } from '@/utils/validators';
import type { Vendor, Offer } from '@/types';
import { MapPin, Clock, QrCode, ArrowLeft, Loader2, Percent } from 'lucide-react';
import Link from 'next/link';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const vendorId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    async function loadData() {
      try {
        const [v, o] = await Promise.all([
          getVendor(vendorId),
          getOffersForVendor(vendorId),
        ]);
        setVendor(v);
        setOffers(o);
      } catch (e) {
        console.error('Failed to load vendor', e);
      } finally {
        setLoading(false);
      }
    }
    if (user && vendorId) loadData();
  }, [user, authLoading, vendorId, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <>
        <AppHeader />
        <main className="pt-20 pb-8">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <p className="text-muted-foreground">Vendor not found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="py-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="size-3.5" />
              <span className="font-mono text-xs">Back to dashboard</span>
            </Link>

            <div className="flex items-start gap-4 mb-6">
              <div className="size-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                {CATEGORY_ICONS[vendor.category] || '🏪'}
              </div>
              <div>
                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="text-2xl font-semibold md:text-3xl"
                >
                  {vendor.name}
                </TextEffect>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span className="text-sm">{vendor.location}</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">{vendor.category}</Badge>
                </div>
              </div>
            </div>

            {vendor.description && (
              <p className="text-muted-foreground mb-8">{vendor.description}</p>
            )}

            <Separator className="my-8" />

            {/* Offers */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Percent className="size-5" />
                Active Offers
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {offers.length === 0 ? 'No offers available right now' : `${offers.length} offer${offers.length > 1 ? 's' : ''} available`}
              </p>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.3 },
                  },
                },
                ...transitionVariants,
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {offers.map((offer) => {
                const active = isOfferActive(offer.startTime, offer.endTime);
                return (
                  <Card key={offer.id} className={`${!active ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{offer.discount}% OFF</CardTitle>
                        <Badge variant={active ? 'default' : 'secondary'}>
                          {active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>{offer.description || 'Student discount'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span className="font-mono text-xs">{offer.startTime} – {offer.endTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Max {offer.maxUsesPerUser} use{offer.maxUsesPerUser > 1 ? 's' : ''} per student
                      </p>
                      {active && (
                        <Button
                          className="w-full mt-2"
                          onClick={() => router.push(`/qr?vendorId=${vendor.id}&offerId=${offer.id}`)}
                        >
                          <QrCode className="size-4" />
                          <span>Get Discount</span>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </AnimatedGroup>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
