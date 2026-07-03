import type { TokenManager } from './auth.js';
import type { RateLimiter } from './rate-limiter.js';
import {
  AuthenticationError,
  ForbiddenError,
  NCentralError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  type ValidationErrorDetail,
} from './errors.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /**
   * Query-string parameters. `undefined`/`null` values are skipped.
   * Typed as `object` so typed param interfaces (e.g. `PaginationParams`)
   * are accepted without an index signature.
   */
  params?: object;
  /** JSON request body. */
  body?: unknown;
}

export interface HttpClientOptions {
  /** Normalized base URL (no trailing slash). */
  serverUrl: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  tokenManager: TokenManager;
  rateLimiter: RateLimiter;
  fetchImpl?: typeof fetch;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ErrorResponseBody {
  status?: number;
  message?: string;
  errors?: ValidationErrorDetail[];
}

/**
 * HTTP client for the N-central API-Service. Handles bearer-token
 * injection (via the {@link TokenManager}), client-side rate limiting,
 * retries with exponential backoff on 429/5xx, a single re-authenticate
 * retry on 401, and mapping of error responses onto the typed error
 * hierarchy.
 */
export class HttpClient {
  constructor(private readonly options: HttpClientOptions) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', params, body } = options;
    const url = this.buildUrl(path, params);
    const fetchImpl = this.options.fetchImpl ?? globalThis.fetch;

    let reauthAttempted = false;
    let lastError: Error | null = null;
    let overrideDelayMs: number | undefined;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      if (attempt > 0) {
        await sleep(overrideDelayMs ?? this.backoffMs(attempt));
      }
      overrideDelayMs = undefined;

      await this.options.rateLimiter.acquire();
      const accessToken = await this.options.tokenManager.getAccessToken();

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeoutMs);

      let response: Response;
      try {
        response = await fetchImpl(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch (err) {
        lastError = err as Error;
        if (lastError.name === 'AbortError') {
          lastError = new NCentralError(`Request timeout after ${this.options.timeoutMs}ms`);
        }
        continue; // network errors are retryable
      } finally {
        clearTimeout(timeoutId);
      }

      // SAFE body handling: always read the body as text once, then
      // attempt JSON.parse. Never call response.json() then .text() —
      // the body can only be consumed once.
      const rawText = await response.text().catch(() => '');
      let parsed: unknown;
      try {
        parsed = rawText === '' ? undefined : JSON.parse(rawText);
      } catch {
        parsed = rawText;
      }

      if (response.ok) {
        return parsed as T;
      }

      const status = response.status;
      const message = this.buildErrorMessage(method, path, status, parsed);

      switch (status) {
        case 401: {
          if (!reauthAttempted) {
            // The access token may have been revoked server-side.
            // Force a full re-authentication and retry exactly once.
            reauthAttempted = true;
            this.options.tokenManager.invalidate();
            attempt -= 1; // the re-auth retry does not consume a retry slot
            continue;
          }
          throw new AuthenticationError(message, parsed);
        }

        case 403:
          throw new ForbiddenError(message, parsed);

        case 404:
          throw new NotFoundError(message, parsed);

        case 400:
        case 422: {
          const errors = (parsed as ErrorResponseBody | undefined)?.errors ?? [];
          throw new ValidationError(message, status, errors, parsed);
        }

        case 429: {
          const retryAfterSeconds = this.parseRetryAfter(response);
          if (attempt < this.options.maxRetries) {
            // Honour Retry-After when present; otherwise the top-of-loop
            // exponential backoff applies.
            if (retryAfterSeconds !== undefined) {
              overrideDelayMs = retryAfterSeconds * 1000;
            }
            lastError = new RateLimitError(
              message,
              retryAfterSeconds ?? this.backoffMs(attempt + 1) / 1000,
              parsed,
            );
            continue;
          }
          throw new RateLimitError(message, retryAfterSeconds ?? 0, parsed);
        }

        default: {
          if (status >= 500) {
            lastError = new ServerError(message, status, parsed);
            if (attempt < this.options.maxRetries) continue;
            throw lastError;
          }
          throw new NCentralError(message, status, parsed);
        }
      }
    }

    throw lastError ?? new NCentralError('Request failed after retries');
  }

  private buildUrl(path: string, params?: object): string {
    let url = `${this.options.serverUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (value === undefined || value === null) continue;
        searchParams.set(key, String(value));
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return url;
  }

  private backoffMs(attempt: number): number {
    const base = this.options.retryDelayMs * 2 ** (attempt - 1);
    return Math.min(base, 30_000) + Math.random() * 250;
  }

  private parseRetryAfter(response: Response): number | undefined {
    const header = response.headers.get('retry-after');
    if (!header) return undefined;
    const seconds = Number(header);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
  }

  private buildErrorMessage(
    method: string,
    path: string,
    status: number,
    body: unknown,
  ): string {
    let detail = '';
    if (body && typeof body === 'object') {
      const message = (body as ErrorResponseBody).message;
      if (typeof message === 'string' && message) {
        detail = `: ${message}`;
      } else {
        const bodyStr = JSON.stringify(body);
        if (bodyStr && bodyStr.length > 2) detail = `: ${bodyStr.substring(0, 200)}`;
      }
    } else if (typeof body === 'string' && body) {
      detail = `: ${body.substring(0, 200)}`;
    }
    return `${method} ${path} failed with HTTP ${status}${detail}`;
  }
}
