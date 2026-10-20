// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { isPublicPath, middleware } from './middleware';

describe('isPublicPath', () => {
  it('matches public paths and anything nested under them', () => {
    expect(isPublicPath('/courses')).toBe(true);
    expect(isPublicPath('/courses/stellar-101')).toBe(true);
    expect(isPublicPath('/certificates/abc123')).toBe(true);
    expect(isPublicPath('/auth/login')).toBe(true);
  });

  it('does not treat a route that only shares a string prefix as public', () => {
    // Regression: startsWith('/courses') used to make these public.
    expect(isPublicPath('/courses-admin')).toBe(false);
    expect(isPublicPath('/coursesx')).toBe(false);
    expect(isPublicPath('/login-history')).toBe(false);
    expect(isPublicPath('/certificates-export')).toBe(false);
  });
});

describe('middleware', () => {
  it('lets a nested public route through without a token', () => {
    const res = middleware(new NextRequest('http://localhost:3001/courses/stellar-101'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects an unauthenticated dashboard request to login', () => {
    const res = middleware(new NextRequest('http://localhost:3001/dashboard/courses'));
    const location = new URL(res.headers.get('location') ?? '');
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('callbackUrl')).toBe('/dashboard/courses');
  });
});
