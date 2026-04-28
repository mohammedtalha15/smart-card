'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { getAllTransactions } from '@/lib/firestore';
import { formatDate } from '@/utils/validators';
import type { Transaction } from '@/types';
import { Loader2, Receipt, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminTransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    async function load() {
      try {
        const data = await getAllTransactions();
        setTransactions(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    if (user) load();
  }, [user, authLoading, router]);

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
            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-2xl font-semibold">
              All Transactions
            </TextEffect>
            <p className="mt-2 text-muted-foreground">{transactions.length} total transactions</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="size-16 mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-mono text-xs uppercase text-muted-foreground">User</th>
                    <th className="py-3 px-4 font-mono text-xs uppercase text-muted-foreground">Vendor</th>
                    <th className="py-3 px-4 font-mono text-xs uppercase text-muted-foreground">Discount</th>
                    <th className="py-3 px-4 font-mono text-xs uppercase text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">{txn.userName}</td>
                      <td className="py-3 px-4">{txn.vendorName}</td>
                      <td className="py-3 px-4 font-mono font-semibold">{txn.discount}%</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{formatDate(txn.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
