import { describe, expect, it } from 'vitest';
import { buildExcelWorkbook, buildExecutiveNarrative, buildReportHtml } from './reporting';

const payload = {
  settings: {
    selectedOrganizationId: 'org-1',
    selectedReportingPeriodId: 'period-1',
    organizationName: 'Blue Horizon Manufacturing',
    organizationCountry: 'LK',
    industry: 'Manufacturing',
    reportingCurrency: 'USD',
    primaryStandard: 'GHG Protocol Corporate',
    secondaryStandards: ['ISO 14064-1'],
    gwpSet: 'AR6',
    defaultLanguage: 'en',
    boundaryApproach: 'Operational control',
    benchmarkSector: 'Manufacturing',
    logoUrl: '',
    brandPrimary: '#0f5f4b',
    brandSecondary: '#146c94',
    reportTitle: 'Standard Carbon Audit Report',
  },
  summary: {
    totalKg: 1200,
    qualityScore: 88,
    evidenceCoverage: 75,
    verifiedShare: 66.7,
    scopeSummary: [
      { scope: 'Scope 1', totalKg: 300, totalTonnes: 0.3, share: 25 },
      { scope: 'Scope 2', totalKg: 600, totalTonnes: 0.6, share: 50 },
      { scope: 'Scope 3', totalKg: 300, totalTonnes: 0.3, share: 25 },
    ],
    topDrivers: [{ label: 'Electricity', totalKg: 600, share: 50, scope: 'Scope 2' }],
    monthlyTrend: [],
    forecast: {
      nextPeriodLabel: 'Next month',
      nextPeriodKg: 430,
      quarterKg: 1290,
      trendPercent: 12,
    },
    signals: [],
    reductionOpportunities: [
      {
        id: 'op-1',
        title: 'Reduce electricity demand',
        description: 'Optimize HVAC scheduling.',
        estimatedReductionKg: 72,
        priority: 'high',
      },
    ],
    checklist: [
      {
        id: 'check-1',
        standard: 'GHG Protocol',
        requirement: 'Boundary documented',
        status: 'pass',
        detail: 'Scope mapping is complete.',
      },
    ],
    statusCounts: { verified: 2, pending_audit: 1 },
  },
  entries: [
    {
      id: 'entry-1',
      organization_id: 'org-1',
      scope: 'Scope 2',
      category: 'Electricity',
      activity_type: 'Grid electricity',
      quantity: 1000,
      unit: 'kWh',
      emission_kgco2e: 620,
      entry_date: '2026-01-01',
      status: 'verified',
    },
  ],
  generatedAt: '2026-04-16T00:00:00.000Z',
};

describe('reporting', () => {
  it('builds an executive narrative', () => {
    const narrative = buildExecutiveNarrative(payload as any);
    expect(narrative).toContain('Blue Horizon Manufacturing');
    expect(narrative).toContain('Electricity');
  });

  it('creates printable report html', () => {
    const html = buildPrintableReportHtml(payload as any);
    expect(html).toContain('Standard Carbon Audit Report');
    expect(html).toContain('Detailed Inventory');
  });

  it('creates an Excel-compatible workbook', () => {
    const workbook = buildExcelWorkbook(payload as any);
    expect(workbook).toContain('Workbook');
    expect(workbook).toContain('Carbon Audit Report');
  });
});
