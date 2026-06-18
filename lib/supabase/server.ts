import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 *
 * This bypasses Row Level Security entirely — that's intentional for v1,
 * since there's no per-user Supabase Auth session yet (PRD §2.1: a single
 * shared password per role per academy). Every read/write the app makes
 * goes through this client, called only from Server Components, Server
 * Actions, or Route Handlers.
 *
 * NEVER import this file into a "use client" component — the service key
 * must never reach the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check your .env.local."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
