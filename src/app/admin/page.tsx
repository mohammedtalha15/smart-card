'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import FooterSection from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { transitionVariants } from '@/lib/utils';
import { getAllVendors, getAllTransactions, getAllUsers } from '@/lib/firestore';
import { Loader2, Users, Store, Receipt, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ vendors: 0, users: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    async function load() {
      try {
        const [vendors, transactions, users] = await Promise.all([
          getAllVendors(), getAllTransactions(), getAllUsers(),
        ]);
        setStats({ vendors: vendors.length, transactions: transactions.length, users: users.length });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    if (user) load();
  }, [user, authLoading, router]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, href: '/admin' },
    { label: 'Vendors', value: stats.vendors, icon: Store, href: '/admin/vendors' },
    { label: 'Transactions', value: stats.transactions, icon: Receipt, href: '/admin/transactions' },
  ];

  return (
    <>
      <AppHeader />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="py-8">
            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-3xl font-semibold">
              Admin Panel
            </TextEffect>
            <p className="mt-2 text-muted-foreground">Manage the Artha platform</p>
          </div>

          <AnimatedGroup
            variants={{ container: { visible: { transition: { staggerChildren: 0.05 } } }, ...transitionVariants }}
            className="grid gap-4 sm:grid-cols-3 mb-8"
          >
            {cards.map((c) => (
              <Link key={c.label} href={c.href}>
                <Card className="hover:border-foreground/20 transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <c.icon className="size-4" /> {c.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold font-mono">{loading ? '—' : c.value}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </AnimatedGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin/vendors">
              <Card className="hover:border-foreground/20 transition-all cursor-pointer py-8">
                <CardContent className="flex flex-col items-center gap-3">
                  <Store className="size-8 text-muted-foreground" />
                  <p className="font-semibold">Manage Vendors</p>
                  <p className="text-sm text-muted-foreground">Add, edit, or block vendors</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/offers">
              <Card className="hover:border-foreground/20 transition-all cursor-pointer py-8">
                <CardContent className="flex flex-col items-center gap-3">
                  <TrendingUp className="size-8 text-muted-foreground" />
                  <p className="font-semibold">Manage Offers</p>
                  <p className="text-sm text-muted-foreground">Create and manage discount offers</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
