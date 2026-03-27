'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import FooterSection from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { getTransactionsForUser } from '@/lib/firestore';
import { formatDate } from '@/utils/validators';
import type { Transaction } from '@/types';
import { Loader2, Receipt, Clock } from 'lucide-react';

export default function HistoryPage() {
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
        const data = await getTransactionsForUser(user.id);
        setTransactions(data);
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user, authLoading, router]);

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
        <div className="mx-auto max-w-4xl px-6">
          <div className="py-8">
            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-3xl font-semibold">
              Transaction History
            </TextEffect>
            <p className="mt-2 text-muted-foreground">Your past discount redemptions</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20">
              <Receipt className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Redeem a discount to see it here
              </p>
            </div>
          ) : (
            <AnimatedGroup
              variants={{
                container: { visible: { transition: { staggerChildren: 0.03 } } },
                ...transitionVariants,
              }}
              className="space-y-3"
            >
              {transactions.map((txn) => (
                <Card key={txn.id} className="py-4">
                  <CardContent className="flex items-center justify-between px-6 py-0">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Receipt className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.vendorName}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                          <Clock className="size-3" />
                          <span className="text-xs font-mono">{formatDate(txn.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="font-mono text-sm">
                      {txn.discount}% OFF
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </AnimatedGroup>
          )}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
