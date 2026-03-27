export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  verified: boolean;
  role: 'student' | 'vendor' | 'admin';
  blocked: boolean;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
  ownerId: string;
  active: boolean;
  blocked: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  vendorId: string;
  vendorName: string;
  discount: number;
  description: string;
  startTime: string;
  endTime: string;
  maxUsesPerUser: number;
  active: boolean;
  createdAt: string;
}

export interface QRSession {
  id: string;
  userId: string;
  vendorId: string;
  offerId: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  vendorId: string;
  vendorName: string;
  offerId: string;
  discount: number;
  timestamp: string;
}
