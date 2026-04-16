import { DEMO_ORGANIZATION_ID, DEMO_REPORTING_PERIOD_ID } from './workspace-settings';

const ENTRIES_KEY = 'mock_entries';
const AUDIT_LOGS_KEY = 'mock_audit_logs';
const CUSTOM_FACTORS_KEY = 'mock_custom_factors';

export const MOCK_HEADERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    category: 'Fuel',
    activity_type: 'Diesel generator',
    region: 'LK',
    source: 'DEFRA',
    source_version: '2025',
    methodology_note: 'Stationary combustion factor for diesel consumed on site.',
    is_locked: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    category: 'Electricity',
    activity_type: 'Grid electricity',
    region: 'LK',
    source: 'Country',
    source_version: '2025',
    methodology_note: 'Country-specific grid factor.',
    is_locked: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    category: 'Transport',
    activity_type: 'Short-haul flight',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2025',
    methodology_note: 'Economy passenger-km flight factor.',
    is_locked: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    category: 'Waste',
    activity_type: 'Mixed waste to landfill',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2025',
    methodology_note: 'Operational waste factor.',
    is_locked: true,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    category: 'Materials',
    activity_type: 'Copy paper',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2025',
    methodology_note: 'Purchased goods cradle-to-gate factor.',
    is_locked: true,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    category: 'Transport',
    activity_type: 'Road freight',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2025',
    methodology_note: 'Freight tonne-km factor.',
    is_locked: true,
  },
];

export const MOCK_VALUES = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    factor_id: '11111111-1111-1111-1111-111111111111',
    unit_input: 'litre',
    unit_standard: 'litre',
    emission_factor: 2.68697,
    emission_type: 'Direct/TTW',
    gwp_set: 'AR6',
    co2_fraction: 0.99,
    ch4_fraction: 0.005,
    n2o_fraction: 0.005,
    data_quality: 'High',
  },
  {
    id: '22222222-0000-0000-0000-000000000001',
    factor_id: '22222222-2222-2222-2222-222222222222',
    unit_input: 'kWh',
    unit_standard: 'kWh',
    emission_factor: 0.62,
    emission_type: 'Indirect/Electricity',
    gwp_set: 'AR6',
    co2_fraction: 1,
    ch4_fraction: 0,
    n2o_fraction: 0,
    data_quality: 'High',
  },
  {
    id: '33333333-0000-0000-0000-000000000001',
    factor_id: '33333333-3333-3333-3333-333333333333',
    unit_input: 'passenger_km',
    unit_standard: 'passenger_km',
    emission_factor: 0.156,
    emission_type: 'Lifecycle/LCA',
    gwp_set: 'AR6',
    data_quality: 'Medium',
  },
  {
    id: '44444444-0000-0000-0000-000000000001',
    factor_id: '44444444-4444-4444-4444-444444444444',
    unit_input: 'kg',
    unit_standard: 'kg',
    emission_factor: 0.45,
    emission_type: 'Lifecycle/LCA',
    gwp_set: 'AR6',
    data_quality: 'Medium',
  },
  {
    id: '55555555-0000-0000-0000-000000000001',
    factor_id: '55555555-5555-5555-5555-555555555555',
    unit_input: 'kg',
    unit_standard: 'kg',
    emission_factor: 1.28,
    emission_type: 'Lifecycle/LCA',
    gwp_set: 'AR6',
    data_quality: 'Medium',
  },
  {
    id: '66666666-0000-0000-0000-000000000001',
    factor_id: '66666666-6666-6666-6666-666666666666',
    unit_input: 'tonne_km',
    unit_standard: 'tonne_km',
    emission_factor: 0.115,
    emission_type: 'Lifecycle/LCA',
    gwp_set: 'AR6',
    data_quality: 'High',
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function seedEntries() {
  return [
    createSeedEntry({
      id: 'entry-001',
      scope: 'Scope 2',
      scope_category: 'S2.1',
      category: 'Electricity',
      activity_type: 'Grid electricity',
      quantity: 11850,
      unit: 'kWh',
      factorId: MOCK_HEADERS[1].id,
      factorValueId: MOCK_VALUES[1].id,
      emission_kgco2e: 7347,
      data_quality: 'High',
      status: 'verified',
      validation_status: 'validated',
      approval_status: 'approved',
      confidence_score: 95,
      entry_date: '2026-01-18',
      site_name: 'Main plant',
      activity_evidence: [
        { file_path: 'mock/electricity-jan.pdf', file_name: 'electricity-jan.pdf' },
      ],
    }),
    createSeedEntry({
      id: 'entry-002',
      scope: 'Scope 2',
      scope_category: 'S2.1',
      category: 'Electricity',
      activity_type: 'Grid electricity',
      quantity: 12420,
      unit: 'kWh',
      factorId: MOCK_HEADERS[1].id,
      factorValueId: MOCK_VALUES[1].id,
      emission_kgco2e: 7700.4,
      data_quality: 'High',
      status: 'verified',
      validation_status: 'validated',
      approval_status: 'approved',
      confidence_score: 95,
      entry_date: '2026-02-18',
      site_name: 'Main plant',
      activity_evidence: [
        { file_path: 'mock/electricity-feb.pdf', file_name: 'electricity-feb.pdf' },
      ],
    }),
    createSeedEntry({
      id: 'entry-003',
      scope: 'Scope 1',
      scope_category: 'S1.1',
      category: 'Fuel',
      activity_type: 'Diesel generator',
      quantity: 880,
      unit: 'litre',
      factorId: MOCK_HEADERS[0].id,
      factorValueId: MOCK_VALUES[0].id,
      emission_kgco2e: 2364.53,
      data_quality: 'High',
      status: 'pending_audit',
      validation_status: 'under_review',
      approval_status: 'pending',
      confidence_score: 88,
      entry_date: '2026-03-03',
      site_name: 'Backup power',
    }),
    createSeedEntry({
      id: 'entry-004',
      scope: 'Scope 3',
      scope_category: 'S3.6',
      category: 'Transport',
      activity_type: 'Short-haul flight',
      quantity: 12400,
      unit: 'passenger_km',
      factorId: MOCK_HEADERS[2].id,
      factorValueId: MOCK_VALUES[2].id,
      emission_kgco2e: 1934.4,
      data_quality: 'Medium',
      status: 'verified',
      validation_status: 'validated',
      approval_status: 'approved',
      confidence_score: 82,
      entry_date: '2026-03-11',
      supplier_name: 'Airline travel agent',
      activity_evidence: [
        { file_path: 'mock/flights-q1.xlsx', file_name: 'flights-q1.xlsx' },
      ],
    }),
    createSeedEntry({
      id: 'entry-005',
      scope: 'Scope 3',
      scope_category: 'S3.5',
      category: 'Waste',
      activity_type: 'Mixed waste to landfill',
      quantity: 410,
      unit: 'kg',
      factorId: MOCK_HEADERS[3].id,
      factorValueId: MOCK_VALUES[3].id,
      emission_kgco2e: 184.5,
      data_quality: 'Medium',
      status: 'draft',
      validation_status: 'pending',
      approval_status: 'not_required',
      confidence_score: 67,
      entry_date: '2026-04-01',
      site_name: 'Main plant',
    }),
    createSeedEntry({
      id: 'entry-006',
      scope: 'Scope 3',
      scope_category: 'S3.1',
      category: 'Materials',
      activity_type: 'Copy paper',
      quantity: 620,
      unit: 'kg',
      factorId: MOCK_HEADERS[4].id,
      factorValueId: MOCK_VALUES[4].id,
      emission_kgco2e: 793.6,
      data_quality: 'Low',
      status: 'pending_audit',
      validation_status: 'pending',
      approval_status: 'pending',
      confidence_score: 59,
      entry_date: '2026-04-07',
      supplier_name: 'Office supplies vendor',
      is_assumed_factor: true,
    }),
    createSeedEntry({
      id: 'entry-007',
      scope: 'Scope 3',
      scope_category: 'S3.4',
      category: 'Transport',
      activity_type: 'Road freight',
      quantity: 5620,
      unit: 'tonne_km',
      factorId: MOCK_HEADERS[5].id,
      factorValueId: MOCK_VALUES[5].id,
      emission_kgco2e: 646.3,
      data_quality: 'High',
      status: 'verified',
      validation_status: 'validated',
      approval_status: 'approved',
      confidence_score: 90,
      entry_date: '2026-04-10',
      supplier_name: 'Inbound logistics partner',
    }),
    createSeedEntry({
      id: 'entry-008',
      scope: 'Scope 2',
      scope_category: 'S2.1',
      category: 'Electricity',
      activity_type: 'Grid electricity',
      quantity: 16140,
      unit: 'kWh',
      factorId: MOCK_HEADERS[1].id,
      factorValueId: MOCK_VALUES[1].id,
      emission_kgco2e: 10006.8,
      data_quality: 'High',
      status: 'pending_audit',
      validation_status: 'under_review',
      approval_status: 'pending',
      confidence_score: 83,
      entry_date: '2026-04-14',
      site_name: 'Main plant',
      activity_evidence: [
        { file_path: 'mock/electricity-apr.pdf', file_name: 'electricity-apr.pdf' },
      ],
    }),
  ];
}

function createSeedEntry({
  id,
  factorId,
  factorValueId,
  activity_evidence,
  ...entry
}: any) {
  return {
    organization_id: DEMO_ORGANIZATION_ID,
    reporting_period_id: DEMO_REPORTING_PERIOD_ID,
    user_id: 'demo-user',
    converted_quantity: entry.quantity,
    converted_unit: entry.unit,
    is_assumed_factor: false,
    source_channel: 'manual',
    created_at: `${entry.entry_date}T09:00:00.000Z`,
    updated_at: `${entry.entry_date}T09:00:00.000Z`,
    factor_id: factorId,
    factor_value_id: factorValueId,
    notes: '',
    emission_factor_headers: MOCK_HEADERS.find((header) => header.id === factorId),
    activity_evidence: activity_evidence ?? [],
    ...entry,
    id,
  };
}

function seedAuditLogs() {
  const entries = seedEntries();

  return entries.flatMap((entry) => [
    {
      id: `log-${entry.id}-created`,
      organization_id: entry.organization_id,
      activity_entry_id: entry.id,
      user_id: entry.user_id,
      action: 'entry_created',
      factor_id: entry.factor_id,
      factor_source: entry.emission_factor_headers?.source ?? 'DEFRA',
      factor_version: entry.emission_factor_headers?.source_version ?? '2025',
      gwp_set: 'AR6',
      details: {
        scope: entry.scope,
        category: entry.category,
        quantity: entry.quantity,
        unit: entry.unit,
        status: entry.status,
      },
      created_at: entry.created_at,
    },
    {
      id: `log-${entry.id}-review`,
      organization_id: entry.organization_id,
      activity_entry_id: entry.id,
      user_id: entry.user_id,
      action: entry.status === 'verified' ? 'entry_verified' : 'entry_queued_for_review',
      factor_id: entry.factor_id,
      factor_source: entry.emission_factor_headers?.source ?? 'DEFRA',
      factor_version: entry.emission_factor_headers?.source_version ?? '2025',
      gwp_set: 'AR6',
      details: {
        validation_status: entry.validation_status,
        approval_status: entry.approval_status,
        confidence_score: entry.confidence_score,
      },
      created_at: entry.updated_at,
    },
  ]);
}

function seedCustomFactors() {
  return [
    {
      id: 'custom-factor-001',
      organization_id: DEMO_ORGANIZATION_ID,
      scope: 'Scope 3',
      category: 'Transport',
      activity_type: 'Employee shuttle bus',
      unit: 'km',
      emission_factor: 0.094,
      source: 'Organization Specific',
      source_reference: 'Fleet telematics average 2026-Q1',
      gwp_set: 'AR6',
      data_quality: 'Medium',
      approval_status: 'approved',
      notes: 'Derived from owned shuttle bus fuel and occupancy data.',
      created_at: '2026-04-01T08:00:00.000Z',
    },
  ];
}

export const MockDB = {
  getEntries: () => {
    const seeded = seedEntries();
    const entries = readJson<any[]>(ENTRIES_KEY, seeded);
    if (entries.length === 0) {
      writeJson(ENTRIES_KEY, seeded);
      return seeded;
    }
    return entries;
  },
  saveEntry: (entry: any) => {
    const entries = MockDB.getEntries();
    const timestamp = new Date().toISOString();
    const newEntry = {
      organization_id: DEMO_ORGANIZATION_ID,
      reporting_period_id: DEMO_REPORTING_PERIOD_ID,
      source_channel: 'manual',
      validation_status: entry.status === 'pending_audit' ? 'under_review' : 'pending',
      approval_status: entry.status === 'verified' ? 'approved' : 'pending',
      confidence_score: entry.confidence_score ?? 75,
      created_at: timestamp,
      updated_at: timestamp,
      entry_date: entry.entry_date ?? timestamp.slice(0, 10),
      status: entry.status ?? 'draft',
      activity_evidence: [],
      emission_factor_headers:
        MOCK_HEADERS.find((header) => header.id === entry.factor_id) ?? entry.emission_factor_headers,
      ...entry,
      id: crypto.randomUUID(),
    };

    entries.unshift(newEntry);
    writeJson(ENTRIES_KEY, entries);
    MockDB.appendAuditLog({
      action: 'entry_created',
      activity_entry_id: newEntry.id,
      organization_id: newEntry.organization_id,
      user_id: newEntry.user_id ?? 'demo-user',
      factor_id: newEntry.factor_id,
      factor_source: newEntry.emission_factor_headers?.source ?? 'Custom',
      factor_version: newEntry.emission_factor_headers?.source_version ?? newEntry.gwp_set ?? 'AR6',
      gwp_set: newEntry.gwp_set ?? 'AR6',
      details: {
        scope: newEntry.scope,
        category: newEntry.category,
        quantity: newEntry.quantity,
        unit: newEntry.unit,
        status: newEntry.status,
      },
    });
    return newEntry;
  },
  updateEntry: (id: string, patch: Record<string, unknown>) => {
    const entries = MockDB.getEntries();
    const index = entries.findIndex((entry: any) => entry.id === id);

    if (index === -1) {
      throw new Error('Entry not found');
    }

    const updated = {
      ...entries[index],
      ...patch,
      updated_at: new Date().toISOString(),
    };

    entries[index] = updated;
    writeJson(ENTRIES_KEY, entries);
    MockDB.appendAuditLog({
      action: 'entry_updated',
      activity_entry_id: updated.id,
      organization_id: updated.organization_id,
      user_id: updated.user_id ?? 'demo-user',
      factor_id: updated.factor_id,
      factor_source: updated.emission_factor_headers?.source ?? 'Custom',
      factor_version: updated.emission_factor_headers?.source_version ?? updated.gwp_set ?? 'AR6',
      gwp_set: updated.gwp_set ?? 'AR6',
      details: patch,
    });
    return updated;
  },
  addEvidence: (entryId: string, fileName: string) => {
    const entry = MockDB.updateEntry(entryId, {
      activity_evidence: [
        ...((MockDB.getEntries().find((item: any) => item.id === entryId)?.activity_evidence ?? []) as any[]),
        {
          id: crypto.randomUUID(),
          file_path: 'mock_path',
          file_name: fileName,
          created_at: new Date().toISOString(),
        },
      ],
    });

    MockDB.appendAuditLog({
      action: 'evidence_attached',
      activity_entry_id: entryId,
      organization_id: entry.organization_id,
      user_id: entry.user_id ?? 'demo-user',
      details: { file_name: fileName },
    });

    return entry;
  },
  getAuditLogs: () => {
    const seeded = seedAuditLogs();
    const logs = readJson<any[]>(AUDIT_LOGS_KEY, seeded);
    if (logs.length === 0) {
      writeJson(AUDIT_LOGS_KEY, seeded);
      return seeded;
    }
    return logs.sort((left, right) => right.created_at.localeCompare(left.created_at));
  },
  appendAuditLog: (log: any) => {
    const logs = MockDB.getAuditLogs();
    const newLog = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...log,
    };
    logs.unshift(newLog);
    writeJson(AUDIT_LOGS_KEY, logs);
    return newLog;
  },
  getCustomFactors: () => {
    const seeded = seedCustomFactors();
    const factors = readJson<any[]>(CUSTOM_FACTORS_KEY, seeded);
    if (factors.length === 0) {
      writeJson(CUSTOM_FACTORS_KEY, seeded);
      return seeded;
    }
    return factors;
  },
  saveCustomFactor: (factor: any) => {
    const factors = MockDB.getCustomFactors();
    const newFactor = {
      id: crypto.randomUUID(),
      organization_id: DEMO_ORGANIZATION_ID,
      approval_status: 'approved',
      created_at: new Date().toISOString(),
      ...factor,
    };
    factors.unshift(newFactor);
    writeJson(CUSTOM_FACTORS_KEY, factors);
    MockDB.appendAuditLog({
      action: 'custom_factor_created',
      organization_id: newFactor.organization_id,
      user_id: 'demo-user',
      details: {
        activity_type: newFactor.activity_type,
        source: newFactor.source,
        emission_factor: newFactor.emission_factor,
      },
    });
    return newFactor;
  },
};
