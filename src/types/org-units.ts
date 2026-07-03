/**
 * Contact and address fields shared by every org-unit representation
 * (service organizations, customers, sites and generic org units).
 */
export interface OrgUnitContactInfo {
  externalId?: string;
  externalId2?: string;
  contactFirstName?: string;
  contactLastName?: string;
  phone?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPhoneExt?: string;
  contactDepartment?: string;
  street1?: string;
  street2?: string;
  city?: string;
  stateProv?: string;
  country?: string;
  postalCode?: string;
}

/** `ServiceOrganization` — a service organization org unit. */
export interface ServiceOrganization extends OrgUnitContactInfo {
  soId?: string;
  soName?: string;
  orgUnitType?: string;
  parentId?: string;
  isSystem?: boolean;
  isServiceOrg?: boolean;
  [key: string]: unknown;
}

/** `Customer` — a customer org unit. */
export interface Customer extends OrgUnitContactInfo {
  customerId?: string;
  customerName?: string;
  orgUnitType?: string;
  parentId?: string;
  county?: string;
  isSystem?: boolean;
  isServiceOrg?: boolean;
  [key: string]: unknown;
}

/** `Site` — a site org unit. */
export interface Site extends OrgUnitContactInfo {
  siteId?: string;
  siteName?: string;
  orgUnitType?: string;
  parentId?: string;
  isSystem?: boolean;
  isServiceOrg?: boolean;
  [key: string]: unknown;
}

/** `OrganizationUnit` — a generic org unit of any type. */
export interface OrganizationUnit extends OrgUnitContactInfo {
  orgUnitId?: string;
  orgUnitName?: string;
  orgUnitType?: string;
  parentId?: string;
  [key: string]: unknown;
}

/** `ServiceOrganizationCreation` — body of `POST /api/service-orgs` (PREVIEW). */
export interface ServiceOrganizationCreation extends OrgUnitContactInfo {
  soName: string;
  contactFirstName: string;
  contactLastName: string;
}

/** `ServiceOrganizationCreated` — response of `POST /api/service-orgs`. */
export interface ServiceOrganizationCreated {
  soId?: number;
}

/** `CustomerCreation` — body of `POST /api/service-orgs/{soId}/customers` (PREVIEW). */
export interface CustomerCreation extends OrgUnitContactInfo {
  customerName: string;
  contactFirstName: string;
  contactLastName: string;
  licenseType?: string;
}

/** `SiteCreation` — body of `POST /api/customers/{customerId}/sites` (PREVIEW). */
export interface SiteCreation extends OrgUnitContactInfo {
  siteName: string;
  contactFirstName: string;
  contactLastName: string;
  licenseType?: string;
}

/** `SiteCreated` — response of `POST /api/customers/{customerId}/sites`. */
export interface SiteCreated {
  siteId?: number;
}

/** `OrganizationCustomProperty` — an org-unit (or device) custom property. */
export interface OrganizationCustomProperty {
  propertyId?: number;
  propertyName?: string;
  propertyType?: string;
  value?: string;
  enumeratedValueList?: string[];
}

/** `OrganizationPropertyUpdated` — response of an org-unit property update. */
export interface OrganizationPropertyUpdated {
  _warnings?: string[];
}

/**
 * Update payload for `PUT /api/org-units/{orgUnitId}/org-custom-property-defaults`
 * (`DefaultCustomPropertyModifyRequest`, minus `propertyId` which the SDK
 * injects from its method parameter).
 */
export interface DefaultCustomPropertyUpdate {
  propagate?: boolean;
  propertyName?: string;
  propagationType?: string;
  defaultValue?: string;
  selectedOrgUnitIds?: number[];
  enumeratedValueList?: string[];
}

/** `DeviceCustomPropertyEnumeratedValue` — enumerated value of a default device property. */
export interface DeviceCustomPropertyEnumeratedValue {
  customerId?: number;
  customerName?: string;
  customerType?: number;
  propertyId?: number;
  propertyValue?: string;
}

/** `DefaultDeviceCustomProperty` — a device custom-property default on an org unit. */
export interface DefaultDeviceCustomProperty {
  propertyId?: number;
  customerId?: number;
  propertyName?: string;
  propertyLevel?: string;
  propertyType?: string;
  value?: string;
  enumeratedValues?: DeviceCustomPropertyEnumeratedValue[];
  deviceClasses?: string[];
  supportedOs?: string[];
}
