import { FACTOR_SOURCE_PRIORITY } from './constants';

export interface EmissionFactor {
  id: string;
  factor_id: string;
  emission_factor: number;
  unit_input: string;
  unit_standard: string;
  emission_type: string;
  gwp_set: string;
  co2_fraction: number | null;
  ch4_fraction: number | null;
  n2o_fraction: number | null;
  uncertainty_percent: number | null;
  data_quality: string;
  header: {
    id: string;
    category: string;
    activity_type: string;
    region: string;
    source: string;
    source_version: string | null;
    is_locked: boolean;
  };
}

export interface CalculationResult {
  emission_kgco2e: number;
  emission_co2: number | null;
  emission_ch4: number | null;
  emission_n2o: number | null;
  converted_quantity: number;
  converted_unit: string;
  is_assumed_factor: boolean;
  factor_used: EmissionFactor;
}

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  'gallon': { 'L': 3.78541 },
  'gal': { 'L': 3.78541 },
  'mile': { 'km': 1.60934 },
  'mi': { 'km': 1.60934 },
  'MWh': { 'kWh': 1000 },
  'GJ': { 'kWh': 277.778 },
  'tonne': { 'kg': 1000 },
  't': { 'kg': 1000 },
  'lb': { 'kg': 0.453592 },
  'ft3': { 'm3': 0.0283168 },
  'yd3': { 'm3': 0.764555 },
  'L': { 'L': 1 },
  'kWh': { 'kWh': 1 },
  'km': { 'km': 1 },
  'kg': { 'kg': 1 },
  'm3': { 'm3': 1 },
};

export function convertToStandardUnit(value: number, fromUnit: string, toUnit: string): { value: number; unit: string } | null {
  if (fromUnit === toUnit) return { value, unit: toUnit };
  const conversion = UNIT_CONVERSIONS[fromUnit];
  if (conversion && conversion[toUnit] !== undefined) {
    return { value: value * conversion[toUnit], unit: toUnit };
  }
  return null;
}

export function selectBestFactor(
  factors: EmissionFactor[],
  userCountry: string
): { factor: EmissionFactor; isAssumed: boolean } | null {
  if (factors.length === 0) return null;

  const sorted = [...factors].sort((a, b) => {
    const aIsCountry = a.header.region === userCountry;
    const bIsCountry = b.header.region === userCountry;
    if (aIsCountry && !bIsCountry) return -1;
    if (!aIsCountry && bIsCountry) return 1;

    const aPriority = FACTOR_SOURCE_PRIORITY[a.header.source] ?? 99;
    const bPriority = FACTOR_SOURCE_PRIORITY[b.header.source] ?? 99;
    return aPriority - bPriority;
  });

  const best = sorted[0];
  const isAssumed = best.header.region !== userCountry && best.header.source !== 'Country';

  return { factor: best, isAssumed };
}

export function calculateEmission(
  quantity: number,
  unit: string,
  factor: EmissionFactor
): CalculationResult | null {
  const converted = convertToStandardUnit(quantity, unit, factor.unit_standard);
  if (!converted) return null;

  const emission_kgco2e = converted.value * factor.emission_factor;

  let emission_co2: number | null = null;
  let emission_ch4: number | null = null;
  let emission_n2o: number | null = null;

  if (factor.co2_fraction != null) emission_co2 = emission_kgco2e * factor.co2_fraction;
  if (factor.ch4_fraction != null) emission_ch4 = emission_kgco2e * factor.ch4_fraction;
  if (factor.n2o_fraction != null) emission_n2o = emission_kgco2e * factor.n2o_fraction;

  return {
    emission_kgco2e,
    emission_co2,
    emission_ch4,
    emission_n2o,
    converted_quantity: converted.value,
    converted_unit: converted.unit,
    is_assumed_factor: false,
    factor_used: factor,
  };
}

export function formatEmission(kgco2e: number): string {
  if (kgco2e >= 1_000_000) return `${(kgco2e / 1_000_000).toFixed(1)} ktCO₂e`;
  if (kgco2e >= 1_000) return `${(kgco2e / 1_000).toFixed(1)} tCO₂e`;
  return `${kgco2e.toFixed(2)} kgCO₂e`;
}
