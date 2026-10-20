import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCountdown } from './use-countdown';

// Simulates a backgrounded tab: wall-clock time passes but the browser fires
// no interval callbacks, then the tab becomes visible again.
function hideTabFor(ms: number) {
  vi.setSystemTime(Date.now() + ms);
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down one second per second', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 10 }));
    expect(result.current.secondsLeft).toBe(10);

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(result.current.secondsLeft).toBe(7);
  });

  it('keeps the wall-clock deadline when interval ticks are throttled in a background tab', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 60 }));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current.secondsLeft).toBe(59);

    // 40s pass with no ticks. A tick-counting timer would still show 59.
    act(() => {
      hideTabFor(40_000);
    });
    expect(result.current.secondsLeft).toBe(19);
  });

  it('expires once when the deadline passes while the tab is hidden', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ seconds: 5, onExpire }));

    act(() => {
      hideTabFor(30_000);
    });

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('pauses while disabled and resumes with the same time left', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useCountdown({ seconds: 20, enabled }),
      { initialProps: { enabled: true } },
    );

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.secondsLeft).toBe(15);

    rerender({ enabled: false });
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.secondsLeft).toBe(15);

    rerender({ enabled: true });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.secondsLeft).toBe(10);
  });

  it('restart sets a fresh deadline', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 10 }));

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current.isExpired).toBe(true);

    act(() => {
      result.current.restart();
    });
    expect(result.current.secondsLeft).toBe(10);

    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(result.current.secondsLeft).toBe(6);
  });
});
