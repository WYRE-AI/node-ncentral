import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimiter } from '../src/rate-limiter.js';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows a burst up to the bucket capacity without waiting', async () => {
    const limiter = new RateLimiter(10);
    const start = Date.now();
    for (let i = 0; i < 10; i++) {
      await limiter.acquire();
    }
    expect(Date.now() - start).toBe(0);
  });

  it('makes callers wait once the bucket is drained', async () => {
    const limiter = new RateLimiter(10);
    for (let i = 0; i < 10; i++) {
      await limiter.acquire();
    }

    let acquired = false;
    const pending = limiter.acquire().then(() => {
      acquired = true;
    });

    await vi.advanceTimersByTimeAsync(20);
    expect(acquired).toBe(false);

    // After ~100ms one token (at 10/s) has refilled.
    await vi.advanceTimersByTimeAsync(200);
    await pending;
    expect(acquired).toBe(true);
  });

  it('rejects a non-positive rate', () => {
    expect(() => new RateLimiter(0)).toThrow();
  });
});
