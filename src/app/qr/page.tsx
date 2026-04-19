'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { createQRSession } from '@/lib/firestore';
import { QR_EXPIRY_SECONDS } from '@/utils/constants';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ArrowLeft, Timer, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function QRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const vendorId = searchParams.get('vendorId') || '';
  const offerId = searchParams.get('offerId') || '';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const generateQR = useCallback(async () => {
    if (!user || !vendorId || !offerId) return;
    setGenerating(true);
    setExpired(false);
    setTimeLeft(QR_EXPIRY_SECONDS);
    try {
      const expiresAt = new Date(Date.now() + QR_EXPIRY_SECONDS * 1000).toISOString();
      const id = await createQRSession({
        userId: user.id,
        vendorId,
        offerId,
        expiresAt,
        used: false,
      });
      setSessionId(id);
    } catch (e) {
      console.error('Failed to generate QR', e);
    } finally {
      setGenerating(false);
    }
  }, [user, vendorId, offerId]);

  useEffect(() => {
    if (user && vendorId && offerId && !sessionId) {
      generateQR();
    }
  }, [user, vendorId, offerId, sessionId, generateQR]);

  useEffect(() => {
    if (!sessionId || expired) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId, expired]);

  const progress = ((QR_EXPIRY_SECONDS - timeLeft) / QR_EXPIRY_SECONDS) * 100;

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
        <div className="mx-auto max-w-md px-6">
          <div className="py-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="size-3.5" />
              <span className="font-mono text-xs">Back</span>
            </Link>

            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="text-2xl font-semibold text-center"
            >
              Your QR Code
            </TextEffect>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Show this to the vendor to redeem your discount
            </p>

            <Card className="mt-8 border-border/50">
              <CardContent className="pt-6 flex flex-col items-center gap-6">
                {generating ? (
                  <div className="py-16 flex flex-col items-center gap-4">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-mono">Generating...</p>
                  </div>
                ) : expired ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <XCircle className="size-16 text-destructive" />
                    <p className="text-lg font-semibold">QR Expired</p>
                    <p className="text-sm text-muted-foreground text-center">
                      This QR code has expired. Generate a new one.
                    </p>
                    <Button onClick={generateQR} className="mt-2">
                      Generate New QR
                    </Button>
                  </div>
                ) : sessionId ? (
                  <>
                    <div className="p-4 rounded-xl bg-white">
                      <QRCodeSVG
                        value={JSON.stringify({ sessionId })}
                        size={200}
                        level="H"
                      />
                    </div>

                    {/* Timer */}
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Timer className="size-4" />
                          <span className="font-mono">Expires in</span>
                        </div>
                        <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                            timeLeft <= 10 ? 'bg-destructive' : 'bg-primary'
                          }`}
                          style={{ width: `${100 - progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center font-mono">
                      Session: {sessionId.slice(0, 8)}...
                    </p>
                  </>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-muted-foreground">Missing vendor or offer information</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
