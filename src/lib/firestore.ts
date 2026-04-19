import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import type { User, Vendor, Offer, QRSession, Transaction } from '@/types';

// Helper to get collection reference (lazy, avoids calling collection() when db is null)
function getCol(name: string) {
  if (!db) throw new Error('Firebase not configured. Update .env.local with your Firebase credentials.');
  return collection(db, name);
}

function getDocRef(colName: string, id: string) {
  if (!db) throw new Error('Firebase not configured. Update .env.local with your Firebase credentials.');
  return doc(db, colName, id);
}

// ── Users ──
export async function getUser(id: string): Promise<User | null> {
  if (!isConfigured) return null;
  const snap = await getDoc(getDocRef('users', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function createUser(user: Omit<User, 'createdAt'>): Promise<void> {
  await setDoc(getDocRef('users', user.id), {
    ...user,
    createdAt: new Date().toISOString(),
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await updateDoc(getDocRef('users', id), data as DocumentData);
}

export async function getAllUsers(): Promise<User[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(getCol('users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

// ── Vendors ──
export async function getVendor(id: string): Promise<Vendor | null> {
  if (!isConfigured) return null;
  const snap = await getDoc(getDocRef('vendors', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Vendor) : null;
}

export async function getAllVendors(): Promise<Vendor[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(query(getCol('vendors'), where('active', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor));
}

export async function createVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(getCol('vendors'), {
    ...vendor,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<void> {
  await updateDoc(getDocRef('vendors', id), data as DocumentData);
}

// ── Offers ──
export async function getOffersForVendor(vendorId: string): Promise<Offer[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(query(getCol('offers'), where('vendorId', '==', vendorId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function getAllOffers(): Promise<Offer[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(getCol('offers'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function createOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(getCol('offers'), {
    ...offer,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

// ── QR Sessions ──
export async function createQRSession(
  session: Omit<QRSession, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(getCol('qr_sessions'), {
    ...session,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getQRSession(id: string): Promise<QRSession | null> {
  if (!isConfigured) return null;
  const snap = await getDoc(getDocRef('qr_sessions', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as QRSession) : null;
}

export async function markQRSessionUsed(id: string): Promise<void> {
  await updateDoc(getDocRef('qr_sessions', id), { used: true });
}

// ── Transactions ──
export async function createTransaction(
  txn: Omit<Transaction, 'id'>
): Promise<string> {
  const ref = await addDoc(getCol('transactions'), txn);
  return ref.id;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(
    query(getCol('transactions'), orderBy('timestamp', 'desc'), limit(100))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function getTransactionsForUser(userId: string): Promise<Transaction[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(
    query(getCol('transactions'), where('userId', '==', userId), orderBy('timestamp', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function getTransactionsForVendor(vendorId: string): Promise<Transaction[]> {
  if (!isConfigured) return [];
  const snap = await getDocs(
    query(getCol('transactions'), where('vendorId', '==', vendorId), orderBy('timestamp', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}
