import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "ams_parent_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days — parents shouldn't re-enter PIN often

export interface ParentSessionData {
  studentId: string;
  academyId: string;
}

interface SignedPayload extends ParentSessionData {
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
  return crypto
    .createHmac("sha256", getSecret())
    .update(`parent:${value}`)
    .digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function createParentSession(
  data: ParentSessionData,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SignedPayload = {
    ...data,
    iat: now,
    exp: now + MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/parent",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getParentSession(): Promise<SignedPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature || !timingSafeEqual(sign(encoded), signature)) {
    return null;
  }

  try {
    const payload: SignedPayload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8"),
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function destroyParentSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: COOKIE_NAME, path: "/parent" });
}
