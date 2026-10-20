import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/auth/login', '/auth/signup', '/courses', '/certificates'];

/**
 * Whether `pathname` is one of PUBLIC_PATHS or nested under one. Matches whole
 * path segments, so `/courses/abc` is public but `/courses-admin` is not.
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public: auth page, public course browsing, certificate verification
  if (isPublicPath(pathname)) return NextResponse.next();
  // Root and static
  if (pathname === '/') return NextResponse.next();

  const token = request.cookies.get('sorobanlard_token')?.value;
  if (!token && pathname.startsWith('/dashboard')) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|public).*)'],
};
