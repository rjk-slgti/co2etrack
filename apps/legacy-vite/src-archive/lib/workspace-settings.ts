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
  objective: 'Compliance' | 'Internal tracking' | 'Net-zero';
  buildingType: 'commercial' | 'industrial' | 'smart' | 'educational' | 'residential';
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
  organizationName: 'SLGTI - Northern Campus',
  organizationCountry: 'LK',
  industry: 'Educational Facility',
  reportingCurrency: 'LKR',
  primaryStandard: 'GHG Protocol Corporate',
  secondaryStandards: ['ISO 14064-1'],
  gwpSet: 'AR6',
  defaultLanguage: 'en',
  boundaryApproach: 'Operational control',
  objective: 'Internal tracking',
  buildingType: 'educational',
  benchmarkSector: 'Education',
  logoUrl: '',
  brandPrimary: '#0f5f4b',
  brandSecondary: '#146c94',
  reportTitle: 'Professional Carbon Audit Report',
};
