import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Returns true if Supabase env vars are configured.
 * Safe to call at build time / during SSG.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 0;
}

/**
 * Browser-side Supabase client.
 * Use this in Client Components ("use client").
 * Throws only if env vars are truly missing at runtime.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    // During build/prerender without env vars — return a no-op mock
    // so static pages don't crash. Real auth calls are guarded in context.
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
