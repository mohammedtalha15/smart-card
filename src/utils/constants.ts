export const VENDOR_CATEGORIES = [
  'cafe',
  'restaurant',
  'stationery',
  'laundry',
  'grocery',
  'salon',
  'gym',
  'pharmacy',
  'electronics',
  'clothing',
  'other',
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const CATEGORY_ICONS: Record<string, string> = {
  cafe: '☕',
  restaurant: '🍽️',
  stationery: '📝',
  laundry: '👕',
  grocery: '🛒',
  salon: '💇',
  gym: '💪',
  pharmacy: '💊',
  electronics: '📱',
  clothing: '👗',
  other: '🏪',
};

export const QR_EXPIRY_SECONDS = 30;
export const APP_NAME = 'Artha';
