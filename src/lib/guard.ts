export const HONEYPOT_FIELD = '_website';
export const CONSENT_FIELD = 'consent';

export const RATE_LIMIT = { perWindowMs: 60_000, max: 6 } as const;

const MAX_BUCKETS = 5000;

interface Bucket {
  hits: number[];
  touched: number;
}

const rateBuckets = new Map<string, Bucket>();

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export function checkRateLimit(
  key: string,
  limit: number = RATE_LIMIT.max,
  windowMs: number = RATE_LIMIT.perWindowMs
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket) {
    bucket = { hits: [], touched: now };
    rateBuckets.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => now - t <= windowMs);
  bucket.touched = now;

  if (bucket.hits.length >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.hits[0] + windowMs - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  bucket.hits.push(now);

  if (rateBuckets.size > MAX_BUCKETS) {
    for (const [k, b] of rateBuckets) {
      if (b.hits.length === 0 || now - b.touched > windowMs * 2) rateBuckets.delete(k);
    }
  }

  return { allowed: true, retryAfterSec: 0 };
}

export function isHoneypotFilled(data: FormData): boolean {
  const v = data.get(HONEYPOT_FIELD);
  return typeof v === 'string' && v.trim().length > 0;
}

export function consentAccepted(data: FormData): boolean {
  const v = data.get(CONSENT_FIELD);
  return typeof v === 'string' && v.length > 0;
}

const FIELD_LIMITS: Record<string, number> = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  product: 200,
  quantity: 60,
  date: 40,
  message: 5000,
  category: 200,
  origin: 80,
  exports: 80,
  markets: 200,
  moq: 80,
  capability: 240,
  lang: 8,
  consent: 8,
};

export function anyFieldOver(data: FormData): string | null {
  for (const [k, v] of data.entries()) {
    if (typeof v !== 'string') continue;
    const limit = FIELD_LIMITS[k];
    if (limit && v.length > limit) return k;
  }
  return null;
}