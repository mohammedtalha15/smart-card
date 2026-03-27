'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { getQRSession, markQRSessionUsed, createTransaction, getVendor, getOffersForVendor } from '@/lib/firestore';
import { ArrowLeft, Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const startScanner = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setResult(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            const sessionId = data.sessionId;
            if (!sessionId) throw new Error('Invalid QR');

            const session = await getQRSession(sessionId);
            if (!session) {
              setResult('error');
              setResultMessage('QR session not found');
              return;
            }
            if (session.used) {
              setResult('error');
              setResultMessage('QR already used');
              return;
            }
            if (new Date(session.expiresAt) < new Date()) {
              setResult('error');
              setResultMessage('QR has expired');
              return;
            }

            // Mark used and create transaction
            await markQRSessionUsed(sessionId);

            const vendor = await getVendor(session.vendorId);
            const offers = await getOffersForVendor(session.vendorId);
            const offer = offers.find((o) => o.id === session.offerId);

            await createTransaction({
              userId: session.userId,
              userName: 'Student',
              vendorId: session.vendorId,
              vendorName: vendor?.name || 'Unknown',
              offerId: session.offerId,
              discount: offer?.discount || 0,
              timestamp: new Date().toISOString(),
            });

            setResult('success');
            setResultMessage(`${offer?.discount || 0}% discount applied!`);
            toast.success('Transaction recorded successfully');
          } catch (e) {
            setResult('error');
            setResultMessage('Invalid QR code');
          }

          scanner.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      );
    } catch (e) {
      console.error('Scanner error', e);
      setScanning(false);
      toast.error('Camera access denied or unavailable');
    }
  }, []);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop?.().catch(() => {});
    };
  }, []);

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
              href="/vendor-portal"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="size-3.5" />
              <span className="font-mono text-xs">Back</span>
            </Link>

            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="text-2xl font-semibold text-center">
              Scan Student QR
            </TextEffect>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Point camera at the student&apos;s QR code
            </p>

            <Card className="mt-8">
              <CardContent className="pt-6">
                {result === 'success' ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="size-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="size-10 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-green-500">Success!</p>
                    <p className="text-muted-foreground text-center">{resultMessage}</p>
                    <Button onClick={() => { setResult(null); startScanner(); }} className="mt-2">
                      Scan Another
                    </Button>
                  </div>
                ) : result === 'error' ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="size-20 rounded-full bg-destructive/20 flex items-center justify-center">
                      <XCircle className="size-10 text-destructive" />
                    </div>
                    <p className="text-xl font-bold text-destructive">Failed</p>
                    <p className="text-muted-foreground text-center">{resultMessage}</p>
                    <Button onClick={() => { setResult(null); startScanner(); }} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      id="qr-reader"
                      ref={containerRef}
                      className="w-full aspect-square rounded-lg overflow-hidden bg-secondary"
                    />
                    {!scanning && (
                      <Button onClick={startScanner} className="w-full mt-4">
                        <Camera className="size-4" />
                        <span>Start Camera</span>
                      </Button>
                    )}
                    {scanning && (
                      <p className="text-sm text-muted-foreground text-center mt-4 font-mono animate-pulse">
                        Scanning...
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
