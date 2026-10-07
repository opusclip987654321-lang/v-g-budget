import { cookies } from 'next/headers';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Connexion par lien envoyé par e-mail : pas de mot de passe. Le lien crée une
// session signée (cookie httpOnly) valable SESSION_DAYS jours.
export type SessionUser = { userId: string; displayName: string; email: string; fullName: string | null };

export const SESSION_COOKIE = 'vb_session';
export const SESSION_DAYS = 30;
export const LOGIN_TOKEN_MINUTES = 20;
export const SIGN_OUT_PATH = '/api/auth/logout';

export function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET doit contenir au moins 32 caractères.');
  return 'vegebudget-secret-de-developpement-local-uniquement';
}

const sign = (payload: string) => createHmac('sha256', authSecret()).update(payload).digest('base64url');

export function createSessionValue(userId: string, email: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, email, exp: now + SESSION_DAYS * 86400000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(value: string | undefined, now = Date.now()): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { uid?: unknown; email?: unknown; exp?: unknown };
    if (typeof data.uid !== 'string' || typeof data.email !== 'string' || typeof data.exp !== 'number' || data.exp < now) return null;
    return { userId: data.uid, email: data.email, displayName: data.email, fullName: null };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return readSessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}

export function sessionCookie(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export const newLoginToken = () => randomBytes(32).toString('base64url');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
