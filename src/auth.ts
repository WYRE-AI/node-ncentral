import {
  AuthenticationError,
  ForbiddenError,
  NCentralError,
  ServerError,
} from './errors.js';
import type { AuthenticateResponse } from './types/auth.js';

/** Refresh the access token this many ms before it actually expires. */
const REFRESH_BUFFER_MS = 60_000;
const DEFAULT_ACCESS_EXPIRY_SECONDS = 3_600;
const DEFAULT_REFRESH_EXPIRY_SECONDS = 90_000;

export interface TokenManagerOptions {
  /** Normalized base URL (no trailing slash). */
  serverUrl: string;
  /** Permanent User-API Token (JWT). */
  jwt: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

/**
 * Manages the N-central token lifecycle:
 *
 * 1. Lazily exchanges the permanent User-API Token (JWT) for access +
 *    refresh tokens via `POST /api/auth/authenticate` on first use.
 * 2. Proactively refreshes via `POST /api/auth/refresh` (plain-text body
 *    containing the raw refresh token) 60 s before the access token expires.
 * 3. Falls back to a full re-authentication when the refresh fails or the
 *    refresh token itself has expired.
 *
 * Callers never see tokens; they only call {@link getAccessToken}.
 */
export class TokenManager {
  private accessToken: string | null = null;
  private accessExpiresAt = 0;
  private refreshToken: string | null = null;
  private refreshExpiresAt = 0;
  private inflight: Promise<string> | null = null;

  constructor(private readonly options: TokenManagerOptions) {}

  /** Returns a valid access token, authenticating or refreshing as needed. */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessExpiresAt - REFRESH_BUFFER_MS) {
      return this.accessToken;
    }
    if (!this.inflight) {
      this.inflight = this.renew().finally(() => {
        this.inflight = null;
      });
    }
    return this.inflight;
  }

  /**
   * Drops all cached tokens so the next {@link getAccessToken} performs a
   * full re-authentication. Used after an unexpected 401 from the API.
   */
  invalidate(): void {
    this.accessToken = null;
    this.accessExpiresAt = 0;
    this.refreshToken = null;
    this.refreshExpiresAt = 0;
  }

  private async renew(): Promise<string> {
    if (this.refreshToken && Date.now() < this.refreshExpiresAt - REFRESH_BUFFER_MS) {
      try {
        return await this.refresh();
      } catch {
        // Refresh failed (revoked/expired token, server hiccup, ...) —
        // fall back to a full re-authentication with the permanent JWT.
        this.invalidate();
      }
    }
    return this.authenticate();
  }

  private async authenticate(): Promise<string> {
    const body = await this.post('/api/auth/authenticate', {
      Authorization: `Bearer ${this.options.jwt}`,
      Accept: 'application/json',
    });
    return this.storeTokens(body, 'authenticate');
  }

  private async refresh(): Promise<string> {
    const body = await this.post(
      '/api/auth/refresh',
      {
        'Content-Type': 'text/plain',
        Accept: 'application/json',
      },
      this.refreshToken as string,
    );
    return this.storeTokens(body, 'refresh');
  }

  private async post(
    path: string,
    headers: Record<string, string>,
    body?: string,
  ): Promise<unknown> {
    const fetchImpl = this.options.fetchImpl ?? globalThis.fetch;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(`${this.options.serverUrl}${path}`, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        throw new NCentralError(
          `Authentication request timed out after ${this.options.timeoutMs}ms`,
        );
      }
      throw new NCentralError(`Authentication request failed: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    // SAFE body handling: read text once, then attempt JSON.parse.
    const rawText = await response.text().catch(() => '');
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = rawText;
    }

    if (!response.ok) {
      const message = buildAuthErrorMessage(path, response.status, parsed);
      if (response.status === 401) throw new AuthenticationError(message, parsed);
      if (response.status === 403) throw new ForbiddenError(message, parsed);
      if (response.status >= 500) throw new ServerError(message, response.status, parsed);
      throw new NCentralError(message, response.status, parsed);
    }

    return parsed;
  }

  private storeTokens(body: unknown, operation: 'authenticate' | 'refresh'): string {
    const tokens = (body as AuthenticateResponse | null)?.tokens;
    const access = tokens?.access;
    const refresh = tokens?.refresh;

    if (!access?.token) {
      throw new AuthenticationError(
        `N-central ${operation} response did not contain an access token`,
        body,
      );
    }

    const now = Date.now();
    this.accessToken = access.token;
    this.accessExpiresAt =
      now + (access.expirySeconds ?? DEFAULT_ACCESS_EXPIRY_SECONDS) * 1000;

    if (refresh?.token) {
      this.refreshToken = refresh.token;
      this.refreshExpiresAt =
        now + (refresh.expirySeconds ?? DEFAULT_REFRESH_EXPIRY_SECONDS) * 1000;
    }

    return this.accessToken;
  }
}

function buildAuthErrorMessage(path: string, status: number, body: unknown): string {
  let detail = '';
  if (body && typeof body === 'object') {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message) detail = `: ${message}`;
  } else if (typeof body === 'string' && body) {
    detail = `: ${body.substring(0, 200)}`;
  }
  return `POST ${path} failed with HTTP ${status}${detail}`;
}
