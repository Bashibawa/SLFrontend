import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteAnnouncer } from './RouteAnnouncer';

let currentPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
}));

describe('RouteAnnouncer', () => {
  beforeEach(() => {
    currentPathname = '/';
    document.title = '';
    document.body.innerHTML = '';
  });

  it('renders with accessibility attributes', () => {
    document.title = 'Home Page';
    render(<RouteAnnouncer />);

    const announcer = screen.getByRole('status');
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute('aria-live', 'assertive');
    expect(announcer).toHaveAttribute('aria-atomic', 'true');
    expect(announcer).toHaveClass('sr-only');
    expect(announcer).toHaveTextContent('Navigated to Home Page');
  });

  it('announces dynamic route client-side navigations using document.title', () => {
    document.title = 'Course 101 | SorobanLard';
    currentPathname = '/dashboard/courses/101';
    const { rerender } = render(<RouteAnnouncer />);

    expect(screen.getByRole('status')).toHaveTextContent('Navigated to Course 101 | SorobanLard');

    // Simulate navigation to another dynamic route
    document.title = 'Course 102 | SorobanLard';
    currentPathname = '/dashboard/courses/102';
    rerender(<RouteAnnouncer />);

    expect(screen.getByRole('status')).toHaveTextContent('Navigated to Course 102 | SorobanLard');
  });

  it('falls back to h1 heading text when document.title is empty', () => {
    document.title = '';
    const h1 = document.createElement('h1');
    h1.textContent = 'Dashboard Overview';
    document.body.appendChild(h1);

    currentPathname = '/dashboard';
    render(<RouteAnnouncer />);

    expect(screen.getByRole('status')).toHaveTextContent('Navigated to Dashboard Overview');
  });

  it('falls back to pathname when both document.title and h1 are unavailable', () => {
    document.title = '';
    currentPathname = '/dashboard/courses/42';
    render(<RouteAnnouncer />);

    expect(screen.getByRole('status')).toHaveTextContent('Navigated to /dashboard/courses/42');
  });
});
