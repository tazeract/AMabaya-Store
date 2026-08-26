import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Proxy / Middleware (Next.js 16+ convention)
 *
 * 1. Refreshes the Supabase session cookie on every request (keeps JWT alive).
 * 2. Protects /account — redirects unauthenticated users to /auth/login.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Skip Supabase when env vars are not configured (e.g., during local dev without .env)
  if (!supabaseUrl.startsWith("http")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do NOT remove this call
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /account routes
  const isAccountRoute = request.nextUrl.pathname.startsWith("/account");
  if (isAccountRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

// Keep backwards-compatible middleware export if needed
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, favicon.svg, manifest.json
     * - public files
     */
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|glb)).*)",
  ],
};
