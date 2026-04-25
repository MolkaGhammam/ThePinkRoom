import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/reset-password", "/update-password"];

function getLocaleFromPath(pathname: string): string {
  const segment = pathname.split("/")[1] ?? "";
  return (routing.locales as readonly string[]).includes(segment)
    ? segment
    : routing.defaultLocale;
}

function isPublicPath(pathname: string): boolean {
  const locale = getLocaleFromPath(pathname);
  const stripped = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  return PUBLIC_PATHS.some((p) => stripped === p || stripped.startsWith(p + "/"));
}

export async function proxy(request: NextRequest) {
  // Run intl middleware first — handles locale-prefix redirects (e.g. / → /fr).
  const intlResponse = intlMiddleware(request);

  // If intl already redirected, honour that — no need to check auth on the redirect itself.
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const response = intlResponse ?? NextResponse.next({ request });

  // Refresh the Supabase session on every request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPath(pathname);

  // Redirect unauthenticated users away from protected routes.
  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login.
  if (user && isPublicPath(pathname)) {
    const homeUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
