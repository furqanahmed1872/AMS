import { cookies } from "next/headers";
import crypto from "crypto";
import type { Role } from "@/lib/academy-data/types";
import type { BranchScope } from "@/lib/branches/types";

const COOKIE_NAME = "ams_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  academyId: string;
  academyName: string;
  role: Role;
  /**
   * Which branch this session is scoped to. "all" = academy-wide
   * (admin only). Undefined on legacy cookies issued before
   * multi-branch shipped — treated as "all" by callers.
   */
  branchId?: BranchScope;
}

interface SignedPayload extends SessionData {
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — check your .env.local.");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Constant-time compare — avoids leaking signature bytes via timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf-8");
  const bb = Buffer.from(b, "utf-8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function encode(payload: SignedPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

async function writeCookie(value: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Called once, right after a password check succeeds (see lib/auth/actions.ts).
 * Writes an httpOnly, signed cookie — never readable or forgeable client-side.
 */
export async function createSession(data: SessionData): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SignedPayload = {
    ...data,
    iat: now,
    exp: now + MAX_AGE_SECONDS,
  };
  await writeCookie(encode(payload));
}

/**
 * Reads + verifies the session cookie. Returns null if missing, tampered
 * with, or expired — callers (app/app/layout.tsx) treat null as "not
 * logged in" and redirect to /login.
 */
export async function getSession(): Promise<SignedPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature || !safeEqual(sign(encoded), signature))
    return null;

  try {
    const payload: SignedPayload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8"),
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

/**
 * Re-issues the session cookie with a new active branch, preserving the
 * original issue/expiry window so switching branches never extends a session.
 */
export async function setActiveBranch(branchId: BranchScope): Promise<void> {
  const current = await getSession();
  if (!current) return;
  await writeCookie(encode({ ...current, branchId }));
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
