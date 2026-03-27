import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, vendorId, offerId } = body;

    if (!userId || !vendorId || !offerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 30 * 1000).toISOString();

    // In production, this would create a Firestore document server-side
    // For now, QR generation is handled client-side via Firestore SDK
    return NextResponse.json({
      success: true,
      session: { userId, vendorId, offerId, expiresAt, used: false },
      message: 'QR session created. Use client-side Firestore SDK for actual creation.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR session' }, { status: 500 });
  }
}
