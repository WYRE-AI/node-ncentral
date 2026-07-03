/**
 * MSW response fixtures shaped from the OpenAPI schemas embedded in the
 * N-central API reference (developer.n-able.com/n-central/reference).
 */

export const ACCESS_TOKEN = 'access-token-1';
export const REFRESH_TOKEN = 'refresh-token-1';
export const REFRESHED_ACCESS_TOKEN = 'access-token-2';
export const REFRESHED_REFRESH_TOKEN = 'refresh-token-2';

/** `AuthenticateResponse` */
export const authenticateResponse = {
  tokens: {
    access: { token: ACCESS_TOKEN, type: 'Bearer', expirySeconds: 3600 },
    refresh: { token: REFRESH_TOKEN, type: 'Body', expirySeconds: 90000 },
  },
  refresh: '/api/auth/refresh',
  validate: '/api/auth/validate',
};

/** `AuthRefreshResponse` */
export const refreshResponse = {
  tokens: {
    access: { token: REFRESHED_ACCESS_TOKEN, type: 'Bearer', expirySeconds: 3600 },
    refresh: { token: REFRESHED_REFRESH_TOKEN, type: 'Body', expirySeconds: 90000 },
  },
  refresh: '/api/auth/refresh',
  validate: '/api/auth/validate',
};

/** `AuthValidateResponse` */
export const validateResponse = { message: 'The token is valid.' };

/** `LinksResponse` for `GET /api` */
export const apiLinks = {
  _links: {
    root: '/api',
    health: '/api/health',
    'server-info': '/api/server-info',
    devices: '/api/devices',
    'org-units': '/api/org-units',
  },
};

/** `Health` */
export const health = { currentTime: '2026-07-03T15:43:16.793Z' };

/** `GET /api/server-info` */
export const serverInfo = { message: '2025.4.0.15' };

/** `VersionInfoResponse` for `GET /api/server-info/extra` */
export const serverInfoExtra = {
  data: {
    _extra: {
      'Installation: Deployment Type': 'N-central',
      'Installation: Deployment Product Version': '2025.4.0.15',
    },
  },
  _links: { root: '/api' },
};

/** `ServiceOrganization` */
export const serviceOrganization = {
  soId: '100',
  soName: 'WYRE Technology',
  orgUnitType: 'SERVICE_ORG',
  parentId: '50',
  contactFirstName: 'Aaron',
  contactLastName: 'Sachs',
  city: 'Chattanooga',
  stateProv: 'TN',
  country: 'US',
  isSystem: false,
  isServiceOrg: true,
};

/** `ListResponseServiceOrganization` (data + totalItems only) */
export const serviceOrganizationList = {
  data: [serviceOrganization],
  totalItems: 1,
};

/** `ServiceOrganizationCreated` */
export const serviceOrganizationCreated = { soId: 101 };

/** `Customer` */
export const customer = {
  customerId: '200',
  customerName: 'Acme Corp',
  orgUnitType: 'CUSTOMER',
  parentId: '100',
  contactFirstName: 'Jane',
  contactLastName: 'Doe',
  city: 'Nashville',
  stateProv: 'TN',
  country: 'US',
  county: 'Davidson',
  isSystem: false,
  isServiceOrg: false,
};

export const customerList = { data: [customer], totalItems: 1 };

/** `CustomerCreation` echo returned by POST /api/service-orgs/{soId}/customers */
export const customerCreated = {
  customerName: 'Acme Corp',
  contactFirstName: 'Jane',
  contactLastName: 'Doe',
  licenseType: 'Professional',
};

/** `Site` */
export const site = {
  siteId: '300',
  siteName: 'Acme HQ',
  orgUnitType: 'SITE',
  parentId: '200',
  contactFirstName: 'Jane',
  contactLastName: 'Doe',
  isSystem: false,
  isServiceOrg: false,
};

export const siteList = { data: [site], totalItems: 1 };

/** `SiteCreated` */
export const siteCreated = { siteId: 301 };

/** `OrganizationUnit` */
export const organizationUnit = {
  orgUnitId: '200',
  orgUnitName: 'Acme Corp',
  orgUnitType: 'CUSTOMER',
  parentId: '100',
};

export const organizationUnitList = { data: [organizationUnit], totalItems: 1 };

/** `RegistrationTokenGetResponse` */
export const registrationTokenResponse = {
  data: {
    registrationToken: 'c5c1b3f0-1234-5678-9abc-def012345678',
    registrationTokenExpiryDate: '2026-07-10T00:00:00Z',
  },
};

/** `Device` */
export const device = {
  deviceId: 987654321,
  longName: 'ACME-DC01',
  deviceClass: 'Servers - Windows',
  description: 'Primary domain controller',
  isProbe: false,
  supportedOs: 'WINDOWS_SERVER_2022',
  discoveredName: 'acme-dc01.acme.local',
  orgUnitId: 200,
  soId: 100,
  soName: 'WYRE Technology',
  customerId: 200,
  customerName: 'Acme Corp',
  siteId: 300,
  siteName: 'Acme HQ',
  lastLoggedInUser: 'ACME\\administrator',
  lastApplianceCheckinTime: '2026-07-03T12:00:00Z',
};

/** `QueryResponseDevice` (full paginated envelope) */
export const deviceList = {
  data: [device],
  pageNumber: 1,
  pageSize: 50,
  itemCount: 1,
  totalItems: 1,
  totalPages: 1,
  _links: {
    firstPage: '/api/devices?pageNumber=1&pageSize=50',
    lastPage: '/api/devices?pageNumber=1&pageSize=50',
  },
};

/** `DeviceResponse` (single-entity envelope) */
export const deviceResponse = { data: device, _links: { self: '/api/devices/987654321' } };

/** `DeviceAssetInfoResponse` */
export const deviceAssets = {
  data: {
    os: { reportedos: 'Microsoft Windows Server 2022', osarchitecture: '64-bit' },
    computersystem: { serialnumber: 'VMware-42 1c', netbiosname: 'ACME-DC01' },
    processor: { name: 'Intel Xeon Gold 6338', maxclockspeed: '2000 MHz' },
  },
  _links: { device: '/api/devices/987654321' },
};

/** `AssetLifecycleDetails` */
export const lifecycleInfo = {
  warrantyExpiryDate: '2027-01-15',
  leaseExpiryDate: '2027-01-15',
  expectedReplacementDate: '2028-01-15',
  purchaseDate: '2024-01-15',
  cost: 4200.5,
  location: 'Rack A4',
  assetTag: 'ACME-0042',
  description: 'Primary domain controller',
};

/** `ListResponseDeviceServiceMonitoringStatus` */
export const serviceMonitorStatus = {
  data: [
    {
      taskId: 111,
      serviceId: 5,
      stateStatus: 'Normal',
      moduleName: 'CPU',
      lastUpdate: '2026-07-03T12:00:00Z',
      applianceId: 42,
      applianceName: 'ACME-DC01',
      isManagedTask: true,
    },
  ],
  totalItems: 1,
};

/** `ListResponseTaskStatusResponse` (tasks associated with a device) */
export const deviceTasks = {
  data: [{ taskId: 555, taskName: 'Disk Cleanup', status: 'Completed' }],
  totalItems: 1,
};

/** `ListResponseMaintenanceWindowGetResponse` */
export const maintenanceWindows = {
  data: [
    {
      scheduleID: 777,
      name: 'Patch Tuesday',
      type: 'action',
      cron: '0 0 3 ? * WED',
      duration: 120,
      enabled: true,
      applicableAction: [{ type: 'patch', actions: [{ Key: 'patch', Value: 'install' }] }],
      rebootMethod: 'allow_reboot',
      downtimeOnAction: false,
    },
  ],
  totalItems: 1,
};

/** `MaintenanceWindowResponse` */
export const maintenanceWindowResult = { success: true };

/** `ListResponseFilter` */
export const deviceFilterList = {
  data: [
    { filterId: '1', filterName: 'Windows Servers', description: 'All Windows servers' },
    { filterId: '2', filterName: 'Probes', description: 'All probe devices' },
  ],
  totalItems: 2,
};

/** `QueryResponseActiveIssue` */
export const activeIssues = {
  data: [
    {
      orgUnitId: 200,
      deviceId: 987654321,
      notificationState: 1,
      serviceId: 5,
      serviceName: 'CPU',
      serviceType: 'WMI',
      taskId: 111,
      serviceItemId: 9,
    },
  ],
  pageNumber: 1,
  pageSize: 50,
  itemCount: 1,
  totalItems: 1,
  totalPages: 1,
};

/** `ListResponse` (job statuses; items are untyped) */
export const jobStatuses = {
  data: [{ jobId: 12, jobName: 'AV Definition Update', status: 'Completed' }],
  totalItems: 1,
};

/** `ListResponseOrganizationCustomProperty` */
export const orgUnitCustomProperties = {
  data: [
    {
      propertyId: 1001,
      propertyName: 'Contract Tier',
      propertyType: 'ENUMERATED',
      value: 'Gold',
      enumeratedValueList: ['Gold', 'Silver', 'Bronze'],
    },
  ],
  totalItems: 1,
};

/** `OrganizationCustomProperty` */
export const orgUnitCustomProperty = orgUnitCustomProperties.data[0];

/** `OrganizationPropertyUpdated` / `DevicePropertyUpdated` */
export const propertyUpdated = { _warnings: [] };

/** `DeviceCustomPropertyResponse` (default device custom property) */
export const deviceDefaultCustomProperty = {
  data: {
    propertyId: 2001,
    customerId: 200,
    propertyName: 'Backup Policy',
    propertyLevel: 'CUSTOMER',
    propertyType: 'TEXT',
    value: 'Nightly',
    deviceClasses: ['Servers - Windows'],
    supportedOs: ['WINDOWS_SERVER_2022'],
  },
  _links: {},
};

/** `ListResponseDeviceCustomProperty` */
export const deviceCustomProperties = {
  data: [
    {
      propertyId: 3001,
      propertyName: 'Patch Ring',
      propertyType: 'TEXT',
      value: 'Ring 1',
    },
  ],
  totalItems: 1,
};

export const deviceCustomProperty = deviceCustomProperties.data[0];

/** `ScheduledTaskCreateResponse` */
export const taskCreated = { data: { taskId: 4242 }, _links: {} };

/** `ScheduledTaskInfoResponse` */
export const taskInfo = {
  data: {
    taskId: 4242,
    name: 'Reboot Device',
    taskName: 'Reboot Device',
    itemId: 1,
    type: 'MacroScript',
    customerId: 200,
    deviceIds: ['987654321'],
    isEnabled: true,
    isReactive: false,
  },
  _links: {},
};

/** `ScheduledTaskAggregatedStatusResponse` */
export const taskStatus = {
  data: { taskName: 'Reboot Device', statusCounts: { Completed: 1 } },
  _links: {},
};

/** `ListResponseDetailsResponse` */
export const taskStatusDetails = {
  data: [
    {
      taskId: 4242,
      deviceId: 987654321,
      deviceName: 'ACME-DC01',
      taskName: 'Reboot Device',
      status: 'Completed',
      output: 'Reboot scheduled.',
    },
  ],
  totalItems: 1,
};

/** `ApplianceTaskInformation` */
export const applianceTaskInfo = {
  scanTime: '2026-07-03T12:00:00Z',
  state: 'Normal',
  serviceDetails: [
    {
      scanDetailId: 1,
      detailName: 'Result',
      detailValue: '0',
      state: 'Normal',
      monitoringType: 'STATE',
      thresholds: [{ state: 'Normal', lowValue: 0, highValue: 0 }],
    },
  ],
};

/** `LinksResponse` for `GET /api/access-groups` */
export const accessGroupLinks = {
  _links: { accessGroups: '/api/org-units/{orgUnitId}/access-groups' },
};

/** `QueryResponse` for org-unit access groups */
export const accessGroupList = {
  data: [{ groupId: 10, groupName: 'Techs', groupDescription: 'All technicians' }],
  pageNumber: 1,
  pageSize: 50,
  itemCount: 1,
  totalItems: 1,
  totalPages: 1,
};

/** `AccessGroupGetResponse` */
export const accessGroupDetails = {
  data: {
    groupId: 10,
    orgUnitId: 200,
    groupName: 'Techs',
    groupDescription: 'All technicians',
    orgUnitIds: [200],
    deviceIds: [987654321],
    userIds: [7],
    autoIncludeNewOrgUnits: false,
  },
  _links: {},
};

/** N-central `ErrorResponse` bodies */
export const errorResponse400 = {
  status: 400,
  message: "[ID=2b85998f] BAD REQUEST: Invalid customerId format: 'abc'.",
  errors: [{ field: 'customerId', message: 'must be an integer' }],
};

export const errorResponse401 = { status: 401, message: 'Authentication Failure.' };
export const errorResponse403 = { status: 403, message: 'Forbidden.' };
export const errorResponse404 = { status: 404, message: 'Device not found.' };
export const errorResponse422 = {
  status: 422,
  message: 'Validation failed.',
  errors: [{ field: 'cron', message: 'invalid cron expression' }],
};
export const errorResponse429 = { status: 429, message: 'Too Many Requests.' };
export const errorResponse500 = { status: 500, message: 'Internal Server Error.' };
