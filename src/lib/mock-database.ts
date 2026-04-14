// Mock Database Fallback Service
// Used when actual Supabase instance is empty or unavailable

export const MOCK_HEADERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    category: 'Fuel',
    activity_type: 'Diesel',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2023',
    is_locked: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    category: 'Fuel',
    activity_type: 'Petrol',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2023',
    is_locked: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    category: 'Electricity',
    activity_type: 'Grid Electricity',
    region: 'US',
    source: 'IEA',
    source_version: '2022',
    is_locked: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    category: 'Waste',
    activity_type: 'Commercial Waste (Landfill)',
    region: 'GLOBAL',
    source: 'DEFRA',
    source_version: '2023',
    is_locked: true,
  }
];

export const MOCK_VALUES = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    factor_id: '11111111-1111-1111-1111-111111111111',
    unit_input: 'L',
    unit_standard: 'L',
    emission_factor: 2.68697,
    emission_type: 'Direct/TTW',
    gwp_set: 'AR5',
    data_quality: 'High'
  },
  {
    id: '22222222-0000-0000-0000-000000000001',
    factor_id: '22222222-2222-2222-2222-222222222222',
    unit_input: 'L',
    unit_standard: 'L',
    emission_factor: 2.31495,
    emission_type: 'Direct/TTW',
    gwp_set: 'AR5',
    data_quality: 'High'
  },
  {
    id: '33333333-0000-0000-0000-000000000001',
    factor_id: '33333333-3333-3333-3333-333333333333',
    unit_input: 'kWh',
    unit_standard: 'kWh',
    emission_factor: 0.385,
    emission_type: 'Indirect/Electricity',
    gwp_set: 'AR5',
    data_quality: 'High'
  },
  {
    id: '44444444-0000-0000-0000-000000000001',
    factor_id: '44444444-4444-4444-4444-444444444444',
    unit_input: 'kg',
    unit_standard: 'kg',
    emission_factor: 0.450,
    emission_type: 'Lifecycle/LCA',
    gwp_set: 'AR5',
    data_quality: 'Medium'
  }
];

export const MockDB = {
  getEntries: () => {
    const raw = localStorage.getItem('mock_entries');
    return raw ? JSON.parse(raw) : [];
  },
  saveEntry: (entry: any) => {
    const entries = MockDB.getEntries();
    const newEntry = { ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    
    // Attach mocked factor header so the table displays work right
    newEntry.emission_factor_headers = MOCK_HEADERS.find(h => h.id === entry.factor_id);
    
    entries.unshift(newEntry);
    localStorage.setItem('mock_entries', JSON.stringify(entries));
    return newEntry;
  },
  updateStatus: (id: string, status: string) => {
    const entries = MockDB.getEntries();
    const idx = entries.findIndex((e: any) => e.id === id);
    if (idx > -1) {
      entries[idx].status = status;
      localStorage.setItem('mock_entries', JSON.stringify(entries));
      return entries[idx];
    }
    throw new Error('Not found');
  },
  addEvidence: (entryId: string, fileName: string) => {
    const entries = MockDB.getEntries();
    const idx = entries.findIndex((e: any) => e.id === entryId);
    if (idx > -1) {
      if (!entries[idx].activity_evidence) entries[idx].activity_evidence = [];
      entries[idx].activity_evidence.push({ file_path: 'mock_path', file_name: fileName });
      localStorage.setItem('mock_entries', JSON.stringify(entries));
      return entries[idx];
    }
  }
};
