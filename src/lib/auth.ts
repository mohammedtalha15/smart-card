import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isConfigured } from './firebase';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithPopup(auth, googleProvider);
};

export const signInWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  if (!auth) throw new Error('Firebase not configured');
  return firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    // Not configured — immediately call back with null and return a no-op unsubscribe
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const isValidCollegeEmail = (email: string): boolean => {
  const allowedDomains = ['bmsit.in'];
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

export { isConfigured };
