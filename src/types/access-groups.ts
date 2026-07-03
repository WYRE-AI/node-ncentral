/** `AccessGroupDetails` — full detail of an access group (PREVIEW). */
export interface AccessGroupDetails {
  groupId?: number;
  orgUnitId?: number;
  groupName?: string;
  groupDescription?: string;
  orgUnitIds?: number[];
  deviceIds?: number[];
  userIds?: number[];
  autoIncludeNewOrgUnits?: boolean;
  /** Additional non-default fields returned by the server. */
  _extra?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * An access group as returned by the org-unit access-group list endpoint
 * (the API docs model list items as an untyped object).
 */
export type AccessGroup = Record<string, unknown>;

/** `DeviceAccessGroupCreateRequest` — body of `POST /api/org-units/{orgUnitId}/device-access-groups` (PREVIEW). */
export interface DeviceAccessGroupCreateRequest {
  groupName: string;
  groupDescription: string;
  deviceIds?: string[];
  userIds?: string[];
}

/** `OrgUnitTypeAccessGroupCreateRequest` — body of `POST /api/org-units/{orgUnitId}/access-groups` (PREVIEW). */
export interface OrgUnitAccessGroupCreateRequest {
  groupName: string;
  groupDescription: string;
  orgUnitIds?: string[];
  userIds?: string[];
  autoIncludeNewOrgUnits?: string;
}
