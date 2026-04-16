import { DEMO_ORGANIZATION_ID, DEMO_REPORTING_PERIOD_ID } from './workspace-settings';

export const DEMO_ORGANIZATIONS = [
  {
    id: DEMO_ORGANIZATION_ID,
    name: 'Blue Horizon Manufacturing',
    country: 'LK',
    industry: 'Industrial manufacturing',
    reporting_currency: 'USD',
    brand_primary: '#0f5f4b',
    brand_secondary: '#146c94',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Northwind Logistics',
    country: 'SG',
    industry: 'Logistics',
    reporting_currency: 'USD',
    brand_primary: '#8b5e34',
    brand_secondary: '#14532d',
  },
];

export const DEMO_REPORTING_PERIODS = [
  {
    id: DEMO_REPORTING_PERIOD_ID,
    organization_id: DEMO_ORGANIZATION_ID,
    name: 'FY2026',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION_ID,
    name: 'FY2025',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'closed',
  },
];
