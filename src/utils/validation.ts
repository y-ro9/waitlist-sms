export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Phone is required';
  const cleaned = phone.replace(/[\s-]/g, '');
  if (!/^\+?\d{10,15}$/.test(cleaned)) return 'Enter a valid phone number (10-15 digits)';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
}