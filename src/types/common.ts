/** `LinksResponse` — hypermedia links to related endpoints. */
export interface LinksResponse {
  _links?: Record<string, string>;
}

/** `Health` — response of `GET /api/health`. */
export interface Health {
  /** ISO-8601 server time. */
  currentTime?: string;
  [key: string]: unknown;
}

/** Response of `GET /api/server-info`. */
export interface ServerInfo {
  message?: string;
  [key: string]: unknown;
}

/** `VersionInfoResponse` — response of `GET /api/server-info/extra` (PREVIEW). */
export interface VersionInfoResponse {
  /** Map of version-info categories to their details. */
  data?: Record<string, unknown>;
  _links?: Record<string, string>;
}

/** `RegistrationToken` — agent/probe registration token for an org unit. */
export interface RegistrationToken {
  registrationToken?: string;
  registrationTokenExpiryDate?: string;
}
