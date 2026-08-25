import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 * Use this in Server Components, Route Handlers, and Server Actions.
 * Reads/writes cookies via Next.js `next/headers`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Guard against placeholder / missing env values during build-time prerender
  if (!supabaseUrl.startsWith("http")) {
    // Return a no-op client when Supabase is not configured yet
    // (build-time prerendering with placeholder .env.local values)
    return createServerClient(
      "https://placeholder.supabase.co",
      "placeholder-key",
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components cookies cannot be set — handled by middleware
          }
        },
      },
    }
  );
}
