import { describe, expect, it } from 'vitest';
import { buildSignals, buildWorkspaceSummary } from './audit-analytics';
import type { ActivityEntryRecord } from './audit-model';

const entries: ActivityEntryRecord[] = [
  {
    id: '1',
    organization_id: 'org-1',
    scope: 'Scope 2',
    scope_category: 'S2.1',
    category: 'Electricity',
    activity_type: 'Grid electricity',
    quantity: 100,
    unit: 'kWh',
    emission_kgco2e: 62,
    data_quality: 'High',
    entry_date: '2026-01-01',
    status: 'verified',
    activity_evidence: [{ file_name: 'jan.pdf', file_path: 'jan.pdf' }],
  },
  {
    id: '2',
    organization_id: 'org-1',
    scope: 'Scope 2',
    scope_category: 'S2.1',
    category: 'Electricity',
    activity_type: 'Grid electricity',
    quantity: 102,
    unit: 'kWh',
    emission_kgco2e: 63.24,
    data_quality: 'High',
    entry_date: '2026-02-01',
    status: 'verified',
  },
  {
    id: '3',
    organization_id: 'org-1',
    scope: 'Scope 2',
    scope_category: 'S2.1',
    category: 'Electricity',
    activity_type: 'Grid electricity',
    quantity: 140,
    unit: 'kWh',
    emission_kgco2e: 86.8,
    data_quality: 'Low',
    entry_date: '2026-03-01',
    status: 'pending_audit',
    is_assumed_factor: true,
  },
];

describe('audit analytics', () => {
  it('builds a workspace summary with coverage metrics', () => {
    const summary = buildWorkspaceSummary(entries);
    expect(summary.totalKg).toBeGreaterThan(200);
    expect(summary.scopeSummary[1].scope).toBe('Scope 2');
    expect(summary.verifiedShare).toBeGreaterThan(60);
  });

  it('surfaces anomaly and quality signals', () => {
    const signals = buildSignals(entries);
    expect(signals.some((signal) => signal.type === 'anomaly')).toBe(true);
    expect(signals.some((signal) => signal.type === 'data_quality')).toBe(true);
  });
});
