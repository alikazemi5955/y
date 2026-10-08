// احراز هویت سمت سرور: هش رمز (scrypt)، نشست‌های واقعی با توکن تصادفی، و محافظ نقش‌ها.
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response, NextFunction } from 'express';
import { readJsonFile, writeJsonFile } from './supplierEngine.js';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_FILE = path.resolve(MODULE_DIR, '..', 'data', 'sessions.json');
export type Role = 'admin' | 'accounting' | 'customer';
interface Session { tokenHash: string; role: Role; userId?: string; username?: string; exp: number }
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const hashPassword = (pw: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt$${salt}$${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
};
export const isHashed = (v: unknown) => typeof v === 'string' && v.startsWith('scrypt$');

const safeEq = (a: Buffer, b: Buffer) => a.length === b.length && crypto.timingSafeEqual(a, b);

/** رمز هش‌شده (scrypt) یا رمز قدیمیِ متنی را بررسی می‌کند. رمز خالی هرگز تأیید نمی‌شود. */
export function verifyPassword(stored: unknown, input: unknown): boolean {
  if (typeof stored !== 'string' || !stored || typeof input !== 'string' || !input) return false;
  if (isHashed(stored)) {
    const [, salt, hash] = stored.split('$');
    if (!salt || !hash) return false;
    const want = Buffer.from(hash, 'hex');
    for (const s of [salt, Buffer.from(salt, 'hex')]) {
      try { if (safeEq(crypto.scryptSync(input, s, want.length || 64), want)) return true; } catch { /* ادامه */ }
    }
    return false;
  }
  return safeEq(Buffer.from(stored), Buffer.from(input));
}

let sessions: Map<string, Session> | null = null;
const load = () => {
  if (!sessions) {
    sessions = new Map();
    const now = Date.now();
    for (const raw of readJsonFile<any[]>(SESSIONS_FILE, [])) {
      if (!raw || raw.exp <= now) continue;
      // Migrate legacy plaintext-token sessions once; never keep the raw token on disk.
      const tokenHash = raw.tokenHash || (raw.token ? hashToken(String(raw.token)) : '');
      if (tokenHash) sessions.set(tokenHash, { tokenHash, role: raw.role, userId: raw.userId, username: raw.username, exp: raw.exp });
    }
  }
  return sessions;
};
const persist = () => writeJsonFile(SESSIONS_FILE, [...load().values()]);

export function revokeToken(token: string): boolean {
  const key = hashToken(token);
  const removed = load().delete(key);
  if (removed) persist();
  return removed;
}

export function createSession(role: Role, who: { userId?: string; username?: string }): string {
  const token = crypto.randomBytes(32).toString('base64url');
  const days = role === 'customer' ? 30 : 7;
  load().set(hashToken(token), { tokenHash: hashToken(token), role, ...who, exp: Date.now() + days * 86400e3 });
  for (const [k, s] of load()) if (s.exp < Date.now()) load().delete(k);
  persist();
  return token;
}

export const getToken = (req: Request): string => {
  const h = String(req.headers.authorization || '');
  // Bearer is the canonical authentication mechanism. Legacy token headers are
  // accepted only as aliases for a real persisted session; their presence alone
  // never grants access.
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return String(req.headers['x-auth-token'] || req.headers['x-admin-token'] || '').trim();
};
export function getSession(req: Request): Session | null {
  const t = getToken(req);
  if (!t) return null;
  const s = load().get(hashToken(t));
  if (!s) return null;
  if (s.exp <= Date.now()) {
    load().delete(hashToken(t));
    persist();
    return null;
  }
  return s;
}
export const requireRole = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  const s = getSession(req);
  if (!s) return res.status(401).json({ success: false, message: 'ورود لازم است', error: 'unauthorized' });
  if (s.role !== 'admin' && !roles.includes(s.role)) return res.status(403).json({ success: false, message: 'دسترسی مجاز نیست', error: 'forbidden' });
  next();
};


export function revokeUserSessions(userId?: string, role?: Role): number {
  let removed = 0;
  for (const [tokenHash, session] of load()) {
    if ((userId && session.userId === userId) || (!userId && role && session.role === role)) {
      load().delete(tokenHash); removed++;
    }
  }
  if (removed) persist();
  return removed;
}

export const publicUser = (u: any) => {
  if (!u || typeof u !== 'object') return u;
  const SENSITIVE = new Set(['password','salt','adminSecret','token','accessToken','refreshToken','apiKey','secret','authorization','credentials','supplierCredentials']);
  const scrub = (value: any, depth = 0): any => {
    if (depth > 6 || value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
    const out: any = {};
    for (const [k, v] of Object.entries(value)) if (!SENSITIVE.has(k)) out[k] = scrub(v, depth + 1);
    return out;
  };
  return scrub(u);
};
export const digits = (v: any) => String(v ?? '').replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[^\d]/g, '');
export const normalizeDigits = (v: any) => String(v ?? '')
  .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
  .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
