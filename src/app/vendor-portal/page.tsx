'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import FooterSection from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { getTransactionsForVendor } from '@/lib/firestore';
import { formatDate } from '@/utils/validators';
import type { Transaction } from '@/types';
import { Loader2, Users, QrCode, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VendorPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    async function load() {
      if (!user) return;
      try {
        const data = await getTransactionsForVendor(user.id);
        setTransactions(data);
      } catch (e) {
        console.error('Failed to load vendor data', e);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user, authLoading, router]);

  const totalScans = transactions.length;
  const uniqueUsers = new Set(transactions.map((t) => t.userId)).size;
  const avgDiscount = transactions.length > 0
    ? Math.round(transactions.reduce((sum, t) => sum + t.discount, 0) / transactions.length)
    : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="py-8 flex items-center justify-between">
            <div>
              <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-3xl font-semibold">
                Vendor Dashboard
              </TextEffect>
              <p className="mt-2 text-muted-foreground">Manage your store and track analytics</p>
            </div>
            <Button asChild>
              <Link href="/vendor-portal/scan">
                <QrCode className="size-4" />
                <span>Scan QR</span>
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <AnimatedGroup
            variants={{
              container: { visible: { transition: { staggerChildren: 0.05 } } },
              ...transitionVariants,
            }}
            className="grid gap-4 sm:grid-cols-3 mb-8"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <QrCode className="size-4" /> Total Scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono">{totalScans}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="size-4" /> Unique Students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono">{uniqueUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="size-4" /> Avg Discount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono">{avgDiscount}%</p>
              </CardContent>
            </Card>
          </AnimatedGroup>

          {/* Recent Activity */}
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((txn) => (
                <Card key={txn.id} className="py-3">
                  <CardContent className="flex items-center justify-between px-6 py-0">
                    <div>
                      <p className="text-sm font-medium">{txn.userName}</p>
                      <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                        <Clock className="size-3" />
                        <span className="text-xs font-mono">{formatDate(txn.timestamp)}</span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold">{txn.discount}%</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
