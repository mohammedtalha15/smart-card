export const isValidCollegeEmail = (email: string): boolean => {
  const allowedDomains = ['bmsit.in'];
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isOfferActive = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return currentTime >= startTime && currentTime <= endTime;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};
