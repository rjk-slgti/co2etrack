export const SCOPE_CATEGORIES = {
  'Scope 1': [
    { code: 'S1.1', name: 'Stationary Combustion' },
    { code: 'S1.2', name: 'Mobile Combustion' },
    { code: 'S1.3', name: 'Fugitive Emissions' },
  ],
  'Scope 2': [
    { code: 'S2.1', name: 'Purchased Electricity' },
    { code: 'S2.2', name: 'Purchased Heat/Steam' },
  ],
  'Scope 3': [
    { code: 'S3.1', name: 'Purchased Goods & Services' },
    { code: 'S3.2', name: 'Capital Goods' },
    { code: 'S3.3', name: 'Fuel & Energy-Related Activities' },
    { code: 'S3.4', name: 'Upstream Transport & Distribution' },
    { code: 'S3.5', name: 'Waste Generated in Operations' },
    { code: 'S3.6', name: 'Business Travel' },
    { code: 'S3.7', name: 'Employee Commuting' },
    { code: 'S3.8', name: 'Upstream Leased Assets' },
    { code: 'S3.9', name: 'Downstream Transport & Distribution' },
    { code: 'S3.10', name: 'Processing of Sold Products' },
    { code: 'S3.11', name: 'Use of Sold Products' },
    { code: 'S3.12', name: 'End-of-Life Treatment' },
    { code: 'S3.13', name: 'Downstream Leased Assets' },
    { code: 'S3.14', name: 'Franchises' },
    { code: 'S3.15', name: 'Investments' },
  ],
} as const;

export const EMISSION_CATEGORIES = [
  'Fuel', 'Electricity', 'Transport', 'Waste', 'Refrigerants', 'Materials', 'Other'
] as const;

export const DATA_QUALITY_OPTIONS = ['High', 'Medium', 'Low'] as const;

export const GWP_SETS = ['AR4', 'AR5', 'AR6'] as const;

export const EMISSION_TYPES = ['Direct/TTW', 'Indirect/Electricity', 'WTT', 'Lifecycle/LCA'] as const;

export const FACTOR_SOURCES = ['Country', 'DEFRA', 'NGER', 'IPCC', 'IEA', 'Other'] as const;

export const FACTOR_SOURCE_PRIORITY: Record<string, number> = {
  'Country': 1,
  'DEFRA': 3,
  'NGER': 3,
  'IPCC': 4,
  'IEA': 5,
  'Other': 6,
};

export const SCOPE_COLORS: Record<string, string> = {
  'Scope 1': 'hsl(152, 60%, 36%)',
  'Scope 2': 'hsl(210, 80%, 52%)',
  'Scope 3': 'hsl(38, 92%, 50%)',
};
