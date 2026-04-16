export interface WorkspaceSettings {
  selectedOrganizationId: string;
  selectedReportingPeriodId: string;
  organizationName: string;
  organizationCountry: string;
  industry: string;
  reportingCurrency: string;
  primaryStandard: string;
  secondaryStandards: string[];
  gwpSet: string;
  defaultLanguage: string;
  boundaryApproach: string;
  benchmarkSector: string;
  logoUrl: string;
  brandPrimary: string;
  brandSecondary: string;
  reportTitle: string;
}

export const DEMO_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_REPORTING_PERIOD_ID = '10000000-0000-0000-0000-000000000001';

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  selectedOrganizationId: DEMO_ORGANIZATION_ID,
  selectedReportingPeriodId: DEMO_REPORTING_PERIOD_ID,
  organizationName: 'Blue Horizon Manufacturing',
  organizationCountry: 'LK',
  industry: 'Industrial manufacturing',
  reportingCurrency: 'USD',
  primaryStandard: 'GHG Protocol Corporate',
  secondaryStandards: ['ISO 14064-1', 'CDP', 'GRI 305'],
  gwpSet: 'AR6',
  defaultLanguage: 'en',
  boundaryApproach: 'Operational control',
  benchmarkSector: 'Manufacturing',
  logoUrl: '',
  brandPrimary: '#0f5f4b',
  brandSecondary: '#146c94',
  reportTitle: 'Standard Carbon Audit Report',
};
