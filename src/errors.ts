/**
 * Detail of a single field validation failure, as returned in the
 * `errors` array of the N-central `ErrorResponse` body.
 */
export interface ValidationErrorDetail {
  field?: string;
  message?: string;
}

/**
 * Base error for all failures raised by the N-central client.
 * Carries the HTTP status code (when applicable) and the parsed
 * response body.
 */
export class NCentralError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

/** HTTP 401 — the JWT, access token or refresh token was rejected. */
export class AuthenticationError extends NCentralError {
  constructor(message: string, response?: unknown) {
    super(message, 401, response);
  }
}

/** HTTP 403 — authenticated but not permitted to access the resource. */
export class ForbiddenError extends NCentralError {
  constructor(message: string, response?: unknown) {
    super(message, 403, response);
  }
}

/** HTTP 404 — the requested entity does not exist. */
export class NotFoundError extends NCentralError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
  }
}

/** HTTP 400/422 — the request was malformed or failed validation. */
export class ValidationError extends NCentralError {
  constructor(
    message: string,
    statusCode: number,
    public errors: ValidationErrorDetail[],
    response?: unknown,
  ) {
    super(message, statusCode, response);
  }
}

/** HTTP 429 — the API-Service rate limit was reached. */
export class RateLimitError extends NCentralError {
  /**
   * @param retryAfter Seconds to wait before retrying (from the
   *   `Retry-After` header when present, otherwise an estimate).
   */
  constructor(
    message: string,
    public retryAfter: number,
    response?: unknown,
  ) {
    super(message, 429, response);
  }
}

/** HTTP 5xx — the N-central server failed to process the request. */
export class ServerError extends NCentralError {}
