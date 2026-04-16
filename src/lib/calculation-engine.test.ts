import { describe, expect, it } from 'vitest';
import {
  calculateCustomFactorEmission,
  calculateEmission,
  convertToStandardUnit,
  createRealtimeVarianceInsight,
  selectBestFactor,
} from './calculation-engine';

const factors = [
  {
    id: 'value-global',
    factor_id: 'header-global',
    emission_factor: 0.7,
    unit_input: 'kWh',
    unit_standard: 'kWh',
    emission_type: 'Indirect/Electricity',
    gwp_set: 'AR6',
    co2_fraction: 1,
    ch4_fraction: 0,
    n2o_fraction: 0,
    uncertainty_percent: 5,
    data_quality: 'High',
    header: {
      id: 'header-global',
      category: 'Electricity',
      activity_type: 'Grid electricity',
      region: 'GLOBAL',
      source: 'DEFRA',
      source_version: '2025',
      is_locked: true,
    },
  },
  {
    id: 'value-local',
    factor_id: 'header-local',
    emission_factor: 0.62,
    unit_input: 'kWh',
    unit_standard: 'kWh',
    emission_type: 'Indirect/Electricity',
    gwp_set: 'AR6',
    co2_fraction: 1,
    ch4_fraction: 0,
    n2o_fraction: 0,
    uncertainty_percent: 2,
    data_quality: 'High',
    header: {
      id: 'header-local',
      category: 'Electricity',
      activity_type: 'Grid electricity',
      region: 'LK',
      source: 'Country',
      source_version: '2025',
      is_locked: true,
    },
  },
];

describe('calculation engine', () => {
  it('converts units to the target standard unit', () => {
    expect(convertToStandardUnit(1, 'MWh', 'kWh')).toEqual({ value: 1000, unit: 'kWh' });
    expect(convertToStandardUnit(1, 'mile', 'km')).toEqual({ value: 1.60934, unit: 'km' });
  });

  it('selects the best country-specific factor', () => {
    const selected = selectBestFactor(factors as any, 'LK');
    expect(selected?.factor.header.region).toBe('LK');
    expect(selected?.isAssumed).toBe(false);
  });

  it('calculates emissions from an official factor', () => {
    const result = calculateEmission(100, 'kWh', factors[1] as any);
    expect(result?.emission_kgco2e).toBe(62);
    expect(result?.confidence_score).toBeGreaterThan(80);
  });

  it('calculates emissions from a custom factor', () => {
    const result = calculateCustomFactorEmission(250, 'km', 0.094, 'km', factors[0] as any);
    expect(result?.emission_kgco2e).toBe(23.5);
  });

  it('creates a variance insight for unusual activity values', () => {
    const insight = createRealtimeVarianceInsight(
      {
        category: 'Electricity',
        activity_type: 'Grid electricity',
        quantity: 150,
        unit: 'kWh',
      },
      [
        { category: 'Electricity', activity_type: 'Grid electricity', quantity: 100 },
        { category: 'Electricity', activity_type: 'Grid electricity', quantity: 102 },
        { category: 'Electricity', activity_type: 'Grid electricity', quantity: 98 },
      ]
    );

    expect(insight?.variancePercent).toBeGreaterThan(40);
  });
});
