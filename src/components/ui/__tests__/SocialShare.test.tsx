import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialShare } from '../SocialShare';

// Mock navigator.clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
});

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen, writable: true });

describe('SocialShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders share buttons', () => {
    render(<SocialShare url="https://sorobanlard.com/certificates/abc" courseTitle="React Basics" />);
    expect(screen.getByRole('button', { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('uses an absolute URL when url prop is already absolute (regression #134)', () => {
    render(<SocialShare url="https://sorobanlard.com/certificates/abc" />);
    fireEvent.click(screen.getByRole('button', { name: /linkedin/i }));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent('https://sorobanlard.com/certificates/abc'));
  });

  it('resolves a relative url prop to an absolute URL (regression #134)', () => {
    // jsdom sets window.location.origin to 'http://localhost'
    render(<SocialShare url="/certificates/abc123" />);
    fireEvent.click(screen.getByRole('button', { name: /linkedin/i }));
    const calledUrl = mockWindowOpen.mock.calls[0][0] as string;
    // Should contain the resolved absolute URL, not the raw relative path
    expect(calledUrl).not.toContain('%2Fcertificates%2Fabc123');
    expect(calledUrl).toContain('http%3A%2F%2Flocalhost%2Fcertificates%2Fabc123');
  });

  it('LinkedIn share link contains encoded absolute URL', () => {
    render(<SocialShare url="https://sorobanlard.com/certificates/test-id" />);
    fireEvent.click(screen.getByRole('button', { name: /linkedin/i }));
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing/share-offsite/?url='),
      '_blank',
      expect.any(String),
    );
    const linkedinUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(linkedinUrl).toContain(encodeURIComponent('https://sorobanlard.com/certificates/test-id'));
  });

  it('Twitter share link contains encoded absolute URL', () => {
    render(<SocialShare url="https://sorobanlard.com/certificates/test-id" courseTitle="Web Dev" />);
    fireEvent.click(screen.getByRole('button', { name: /twitter/i }));
    const twitterUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(twitterUrl).toContain('twitter.com/intent/tweet');
    expect(twitterUrl).toContain(encodeURIComponent('https://sorobanlard.com/certificates/test-id'));
  });

  it('Facebook share link contains encoded absolute URL', () => {
    render(<SocialShare url="https://sorobanlard.com/certificates/test-id" />);
    fireEvent.click(screen.getByRole('button', { name: /facebook/i }));
    const fbUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(fbUrl).toContain('facebook.com/sharer/sharer.php');
    expect(fbUrl).toContain(encodeURIComponent('https://sorobanlard.com/certificates/test-id'));
  });

  it('copy link button copies the absolute URL to clipboard', async () => {
    render(<SocialShare url="https://sorobanlard.com/certificates/abc" />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await vi.waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://sorobanlard.com/certificates/abc');
    });
  });
});
