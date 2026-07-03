export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_REQUESTS_PER_SECOND = 10;
export const DEFAULT_RETRY_DELAY_MS = 1_000;

export interface NCentralConfig {
  /**
   * Base URL of the N-central server, e.g. `https://ncentral.example.com`.
   * A trailing slash is tolerated and stripped. `http://` is accepted for
   * lab servers, but production servers should always use `https://`.
   */
  serverUrl: string;
  /**
   * Permanent User-API Token (JWT) generated in the N-central UI
   * (Administration → User Management → Users → user → API Access →
   * Generate JSON Web Token).
   */
  jwt: string;
  /** Per-request timeout in milliseconds. Default: 30 000. */
  timeoutMs?: number;
  /** Max retries for 429/5xx responses (exponential backoff). Default: 3. */
  maxRetries?: number;
  /** Client-side token-bucket rate limit. Default: 10 requests/second. */
  requestsPerSecond?: number;
  /** Base delay for the exponential retry backoff in ms. Default: 1 000. */
  retryDelayMs?: number;
  /** Custom fetch implementation (defaults to `globalThis.fetch`). */
  fetchImpl?: typeof fetch;
}

export interface ResolvedNCentralConfig {
  serverUrl: string;
  jwt: string;
  timeoutMs: number;
  maxRetries: number;
  requestsPerSecond: number;
  retryDelayMs: number;
  fetchImpl?: typeof fetch;
}

/**
 * Normalizes a server URL: trims whitespace, strips trailing slashes and
 * validates that an http(s) scheme is present.
 */
export function normalizeServerUrl(serverUrl: string): string {
  const trimmed = serverUrl.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/.+/i.test(trimmed)) {
    throw new Error(
      `Invalid serverUrl "${serverUrl}": must start with https:// (or http:// for lab servers)`,
    );
  }
  return trimmed;
}

export function resolveConfig(config: NCentralConfig): ResolvedNCentralConfig {
  if (!config || typeof config.serverUrl !== 'string' || config.serverUrl.trim() === '') {
    throw new Error('NCentralClient requires a serverUrl');
  }
  if (typeof config.jwt !== 'string' || config.jwt.trim() === '') {
    throw new Error('NCentralClient requires a jwt (User-API Token)');
  }

  return {
    serverUrl: normalizeServerUrl(config.serverUrl),
    jwt: config.jwt,
    timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
    requestsPerSecond: config.requestsPerSecond ?? DEFAULT_REQUESTS_PER_SECOND,
    retryDelayMs: config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
    fetchImpl: config.fetchImpl,
  };
}
