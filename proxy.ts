import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest, type ProxyConfig } from "next/server";

import type { Database } from "@/lib/supabase/database";
import { isAuthServiceUnavailable } from "@/lib/supabase/auth-errors";
import { HAS_SUPABASE_CONFIG, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/config/supabase";

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const login = new URL("/auth/login", request.url);
  const headers = new Headers({ "Cache-Control": "private, no-store" });
  if (!HAS_SUPABASE_CONFIG) return NextResponse.redirect(login, { headers });

  const refreshedCookies: Parameters<SetAllCookies>[0] = [];
  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies, cacheHeaders) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        refreshedCookies.push(...cookies);
        Object.entries(cacheHeaders).forEach(([name, value]) => headers.set(name, value));
      }
    }
  });

  const { data, error } = await supabase.auth.getClaims();

  let response: NextResponse;
  if (isAuthServiceUnavailable(error)) {
    headers.set("Retry-After", "30");
    response = new NextResponse("Sign-in is temporarily unavailable. Please try again.", { status: 503, headers });
  } else if (data?.claims.sub) {
    response = NextResponse.next({ request, headers });
  } else {
    response = NextResponse.redirect(login, { headers });
  }

  refreshedCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
};

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/logout"] } satisfies ProxyConfig;
