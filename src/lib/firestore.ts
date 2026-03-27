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
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Vendor, Offer, QRSession, Transaction } from '@/types';

// Collection references
export const usersCol = collection(db, 'users');
export const vendorsCol = collection(db, 'vendors');
export const offersCol = collection(db, 'offers');
export const qrSessionsCol = collection(db, 'qr_sessions');
export const transactionsCol = collection(db, 'transactions');

// ── Users ──
export async function getUser(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function createUser(user: Omit<User, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', user.id), {
    ...user,
    createdAt: new Date().toISOString(),
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', id), data as DocumentData);
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(usersCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

// ── Vendors ──
export async function getVendor(id: string): Promise<Vendor | null> {
  const snap = await getDoc(doc(db, 'vendors', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Vendor) : null;
}

export async function getAllVendors(): Promise<Vendor[]> {
  const snap = await getDocs(query(vendorsCol, where('active', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor));
}

export async function createVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(vendorsCol, {
    ...vendor,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<void> {
  await updateDoc(doc(db, 'vendors', id), data as DocumentData);
}

// ── Offers ──
export async function getOffersForVendor(vendorId: string): Promise<Offer[]> {
  const snap = await getDocs(query(offersCol, where('vendorId', '==', vendorId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function getAllOffers(): Promise<Offer[]> {
  const snap = await getDocs(offersCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function createOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(offersCol, {
    ...offer,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

// ── QR Sessions ──
export async function createQRSession(
  session: Omit<QRSession, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(qrSessionsCol, {
    ...session,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getQRSession(id: string): Promise<QRSession | null> {
  const snap = await getDoc(doc(db, 'qr_sessions', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as QRSession) : null;
}

export async function markQRSessionUsed(id: string): Promise<void> {
  await updateDoc(doc(db, 'qr_sessions', id), { used: true });
}

// ── Transactions ──
export async function createTransaction(
  txn: Omit<Transaction, 'id'>
): Promise<string> {
  const ref = await addDoc(transactionsCol, txn);
  return ref.id;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const snap = await getDocs(
    query(transactionsCol, orderBy('timestamp', 'desc'), limit(100))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function getTransactionsForUser(userId: string): Promise<Transaction[]> {
  const snap = await getDocs(
    query(transactionsCol, where('userId', '==', userId), orderBy('timestamp', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function getTransactionsForVendor(vendorId: string): Promise<Transaction[]> {
  const snap = await getDocs(
    query(transactionsCol, where('vendorId', '==', vendorId), orderBy('timestamp', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}
