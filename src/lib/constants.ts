export const SCOPE_CATEGORIES = {
  'Scope 1': [
    { code: 'S1.1', name: 'Stationary combustion' },
    { code: 'S1.2', name: 'Mobile combustion' },
    { code: 'S1.3', name: 'Process and fugitive emissions' },
  ],
  'Scope 2': [
    { code: 'S2.1', name: 'Purchased electricity' },
    { code: 'S2.2', name: 'Purchased steam, heat, and cooling' },
  ],
  'Scope 3': [
    { code: 'S3.1', name: 'Purchased goods and services' },
    { code: 'S3.2', name: 'Capital goods' },
    { code: 'S3.3', name: 'Fuel and energy related activities' },
    { code: 'S3.4', name: 'Upstream transport and distribution' },
    { code: 'S3.5', name: 'Waste generated in operations' },
    { code: 'S3.6', name: 'Business travel' },
    { code: 'S3.7', name: 'Employee commuting' },
    { code: 'S3.8', name: 'Upstream leased assets' },
    { code: 'S3.9', name: 'Downstream transport and distribution' },
    { code: 'S3.10', name: 'Processing of sold products' },
    { code: 'S3.11', name: 'Use of sold products' },
    { code: 'S3.12', name: 'End-of-life treatment of sold products' },
    { code: 'S3.13', name: 'Downstream leased assets' },
    { code: 'S3.14', name: 'Franchises' },
    { code: 'S3.15', name: 'Investments' },
  ],
} as const;

export const EMISSION_CATEGORIES = [
  'Fuel',
  'Electricity',
  'Transport',
  'Waste',
  'Refrigerants',
  'Materials',
  'Other',
] as const;

export const DATA_QUALITY_OPTIONS = ['High', 'Medium', 'Low'] as const;
export const GWP_SETS = ['AR4', 'AR5', 'AR6'] as const;
export const REPORT_LANGUAGES = ['en', 'fr', 'de', 'es'] as const;
export const WORKFLOW_STAGES = ['Collect', 'Validate', 'Verify', 'Approve', 'Report'] as const;
export const STANDARD_OPTIONS = ['GHG Protocol Corporate', 'ISO 14064-1', 'CDP', 'GRI 305'] as const;

export const EMISSION_TYPES = [
  'Direct/TTW',
  'Indirect/Electricity',
  'WTT',
  'Lifecycle/LCA',
] as const;

export const FACTOR_SOURCES = ['Country', 'DEFRA', 'NGER', 'IPCC', 'IEA', 'Other'] as const;

export const FACTOR_SOURCE_PRIORITY: Record<string, number> = {
  Country: 1,
  DEFRA: 2,
  NGER: 3,
  IPCC: 4,
  IEA: 5,
  Other: 6,
};

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'approver', label: 'Approver' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'data_entry', label: 'Data entry' },
] as const;

export const SCOPE_COLORS: Record<string, string> = {
  'Scope 1': '#0f766e',
  'Scope 2': '#2563eb',
  'Scope 3': '#c2410c',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: '#64748b',
  pending_audit: '#d97706',
  verified: '#15803d',
  rejected: '#b91c1c',
};
