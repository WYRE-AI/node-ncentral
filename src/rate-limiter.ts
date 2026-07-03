function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simple token-bucket rate limiter. The bucket holds up to `capacity`
 * tokens (default: one second's worth) and refills continuously at
 * `ratePerSecond`. Each request consumes one token; callers wait when
 * the bucket is empty.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;

  constructor(private readonly ratePerSecond: number, capacity?: number) {
    if (ratePerSecond <= 0) {
      throw new Error('ratePerSecond must be > 0');
    }
    this.capacity = capacity ?? Math.max(1, ratePerSecond);
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    for (;;) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      const deficit = 1 - this.tokens;
      const waitMs = Math.max(5, Math.ceil((deficit / this.ratePerSecond) * 1000));
      await sleep(waitMs);
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    if (elapsedMs <= 0) return;
    this.tokens = Math.min(this.capacity, this.tokens + (elapsedMs / 1000) * this.ratePerSecond);
    this.lastRefill = now;
  }
}
