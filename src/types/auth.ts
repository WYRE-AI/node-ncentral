/** `AuthToken` — a single authentication token (access or refresh). */
export interface AuthToken {
  /** The JWT token. */
  token: string;
  /** The token type: `Bearer` or `Body`. */
  type: string;
  /** The expiry in seconds. */
  expirySeconds?: number;
}

/** `AuthTokens` — the access/refresh token pair. */
export interface AuthTokens {
  access: AuthToken;
  refresh: AuthToken;
}

/** `AuthenticateResponse` — response of `POST /api/auth/authenticate`. */
export interface AuthenticateResponse {
  tokens?: AuthTokens;
  /** Path of the refresh endpoint (`/api/auth/refresh`). */
  refresh?: string;
  /** Path of the validate endpoint (`/api/auth/validate`). */
  validate?: string;
}

/** `AuthRefreshResponse` — response of `POST /api/auth/refresh`. */
export type AuthRefreshResponse = AuthenticateResponse;

/** `AuthValidateResponse` — response of `GET /api/auth/validate`. */
export interface AuthValidateResponse {
  message?: string;
}
