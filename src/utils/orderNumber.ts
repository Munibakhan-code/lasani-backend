import { randomBytes } from 'crypto';

/** e.g. ORD-20250101-7F3A9C2B */
export function generateOrderNumber(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${y}${m}${day}-${rand}`;
}