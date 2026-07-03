import type { HttpClient } from '../http.js';
import type { AuthValidateResponse } from '../types/auth.js';
import type { Health, LinksResponse, ServerInfo, VersionInfoResponse } from '../types/common.js';

/** API-Service system endpoints (health, version and links). */
export class SystemResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api` — links to the available API endpoints. */
  async links(): Promise<LinksResponse> {
    return this.http.request<LinksResponse>('/api');
  }

  /** `GET /api/health` — server health/time check. */
  async health(): Promise<Health> {
    return this.http.request<Health>('/api/health');
  }

  /** `GET /api/server-info` — API-Service version information. */
  async serverInfo(): Promise<ServerInfo> {
    return this.http.request<ServerInfo>('/api/server-info');
  }

  /** `GET /api/server-info/extra` — extra version information (PREVIEW). */
  async serverInfoExtra(): Promise<VersionInfoResponse> {
    return this.http.request<VersionInfoResponse>('/api/server-info/extra');
  }

  /** `GET /api/auth/validate` — validates the current access token. */
  async validateToken(): Promise<AuthValidateResponse> {
    return this.http.request<AuthValidateResponse>('/api/auth/validate');
  }
}
