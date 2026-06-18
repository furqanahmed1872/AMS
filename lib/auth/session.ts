import { cookies } from "next/headers";
import crypto from "crypto";
import type { Role } from "@/lib/academy-data/types";

const COOKIE_NAME = "ams_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  academyId: string;
  academyName: string;
  role: Role;
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

/**
 * Called once, right after a password check succeeds (see lib/auth/actions.ts).
 * Writes an httpOnly, signed cookie — never readable or forgeable client-side.
 */
export async function createSession(data: SessionData): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SignedPayload = { ...data, iat: now, exp: now + MAX_AGE_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
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
  if (!encoded || !signature || sign(encoded) !== signature) return null;

  try {
    const payload: SignedPayload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8")
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
