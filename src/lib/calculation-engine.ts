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
  kg_co2e_market_based: number | null;
  kg_biogenic_co2: number;
  emission_co2: number | null;
  emission_ch4: number | null;
  emission_n2o: number | null;
  converted_quantity: number;
  converted_unit: string;
  is_assumed_factor: boolean;
  factor_used: EmissionFactor;
  confidence_score: number;
}

export interface ActivityDraftForInsight {
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
}

const UNIT_ALIASES: Record<string, string> = {
  l: 'litre',
  litre: 'litre',
  litres: 'litre',
  liter: 'litre',
  liters: 'litre',
  gal: 'gallon',
  gallon: 'gallon',
  gallons: 'gallon',
  kwh: 'kWh',
  mwh: 'MWh',
  gj: 'GJ',
  km: 'km',
  mi: 'mile',
  mile: 'mile',
  miles: 'mile',
  kg: 'kg',
  tonne: 'tonne',
  tonnes: 'tonne',
  passenger_km: 'passenger_km',
  tonne_km: 'tonne_km',
  ft3: 'ft3',
  yd3: 'yd3',
  m3: 'm3',
};

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  gallon: { litre: 3.78541 },
  litre: { litre: 1 },
  mile: { km: 1.60934 },
  km: { km: 1 },
  MWh: { kWh: 1000 },
  GJ: { kWh: 277.778 },
  tonne: { kg: 1000 },
  kg: { kg: 1 },
  passenger_km: { passenger_km: 1 },
  tonne_km: { tonne_km: 1 },
  ft3: { m3: 0.0283168 },
  yd3: { m3: 0.764555 },
  m3: { m3: 1 },
};

const AR6_GWP = {
  CO2: 1,
  CH4_FOSSIL: 29.8,
  CH4_NON_FOSSIL: 27.0,
  N2O: 273,
};

function round(value: number, digits = 6) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

export function normalizeUnit(unit: string) {
  const cleaned = unit.trim();
  const normalized = UNIT_ALIASES[cleaned.toLowerCase()];
  return normalized ?? cleaned;
}

export function convertToStandardUnit(value: number, fromUnit: string, toUnit: string) {
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);

  if (normalizedFrom === normalizedTo) {
    return { value, unit: normalizedTo };
  }

  const conversion = UNIT_CONVERSIONS[normalizedFrom];
  if (conversion && conversion[normalizedTo] !== undefined) {
    return {
      value: round(value * conversion[normalizedTo], 6),
      unit: normalizedTo,
    };
  }

  return null;
}

function factorConfidenceScore(factor: EmissionFactor, isAssumed: boolean) {
  const qualityScore =
    factor.data_quality === 'High' ? 95 : factor.data_quality === 'Medium' ? 80 : 60;
  const uncertaintyPenalty = factor.uncertainty_percent ? Math.min(factor.uncertainty_percent / 2, 20) : 0;
  const assumptionPenalty = isAssumed ? 15 : 0;

  return Math.max(30, round(qualityScore - uncertaintyPenalty - assumptionPenalty, 0));
}

export function selectBestFactor(
  factors: EmissionFactor[],
  userCountry = 'LK'
): { factor: EmissionFactor; isAssumed: boolean } | null {
  if (factors.length === 0) return null;

  const sorted = [...factors].sort((left, right) => {
    // Priority 1: Sri Lanka region match
    const leftCountryMatch = left.header.region === userCountry;
    const rightCountryMatch = right.header.region === userCountry;
    if (leftCountryMatch && !rightCountryMatch) return -1;
    if (!leftCountryMatch && rightCountryMatch) return 1;

    // Priority 2: Source Priority (Country/CEB/IEA)
    const leftPriority = FACTOR_SOURCE_PRIORITY[left.header.source] ?? 99;
    const rightPriority = FACTOR_SOURCE_PRIORITY[right.header.source] ?? 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    // Priority 3: Data Quality
    if (left.data_quality !== right.data_quality) {
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[left.data_quality as keyof typeof order] ?? 3) - (order[right.data_quality as keyof typeof order] ?? 3);
    }

    return left.header.activity_type.localeCompare(right.header.activity_type);
  });

  const factor = sorted[0];
  const isAssumed = factor.header.region !== userCountry && factor.header.source !== 'Country';

  return { factor, isAssumed };
}

export function calculateEmission(quantity: number, unit: string, factor: EmissionFactor): CalculationResult | null {
  const converted = convertToStandardUnit(quantity, unit, factor.unit_standard);
  if (!converted) return null;

  // Use AR6 logic if factor metadata suggests component fractions
  let emission_kgco2e = 0;
  if (factor.co2_fraction != null && factor.gwp_set === 'AR6') {
     const co2 = converted.value * (factor.co2_fraction ?? 1);
     const ch4 = converted.value * (factor.ch4_fraction ?? 0) * AR6_GWP.CH4_FOSSIL;
     const n2o = converted.value * (factor.n2o_fraction ?? 0) * AR6_GWP.N2O;
     emission_kgco2e = round(co2 + ch4 + n2o, 6);
  } else {
     emission_kgco2e = round(converted.value * factor.emission_factor, 6);
  }
  
  // Market-based logic: apply reduction or specific contract factor if available
  const kg_co2e_market_based = factor.emission_type === 'Indirect/Electricity' 
    ? emission_kgco2e * 0.92 // Regional average instruments
    : emission_kgco2e;

  const emission_co2 = factor.co2_fraction != null ? round(emission_kgco2e * factor.co2_fraction, 6) : null;
  const emission_ch4 = factor.ch4_fraction != null ? round(emission_kgco2e * factor.ch4_fraction, 6) : null;
  const emission_n2o = factor.n2o_fraction != null ? round(emission_kgco2e * factor.n2o_fraction, 6) : null;
  
  const isBiomass = factor.header.activity_type.toLowerCase().includes('biomass') || 
                   factor.header.activity_type.toLowerCase().includes('wood');
  const kg_biogenic_co2 = isBiomass ? emission_kgco2e : 0;

  const confidence_score = factorConfidenceScore(factor, false);

  return {
    emission_kgco2e: isBiomass ? 0 : emission_kgco2e,
    kg_co2e_market_based,
    kg_biogenic_co2,
    emission_co2,
    emission_ch4,
    emission_n2o,
    converted_quantity: converted.value,
    converted_unit: converted.unit,
    is_assumed_factor: false,
    factor_used: factor,
    confidence_score,
  };
}

/**
 * Normalizes emissions based on building occupancy or area.
 */
export function calculateBuildingIntensity(totalKg: number, metricValue: number, buildingType: string) {
  if (!metricValue || metricValue === 0) return 0;
  const intensity = totalKg / metricValue;
  
  // Benchmark logic for 'Smart Buildings'
  const benchmarks: Record<string, number> = {
    'smart': 35.5, // kg/m2/year target
    'commercial': 65.0,
    'educational': 45.0,
    'industrial': 120.0,
  };

  const target = benchmarks[buildingType] ?? 50.0;
  const performance = (intensity / target) * 100;

  return {
    intensity: round(intensity, 2),
    performanceIndex: round(performance, 0),
    isOptimal: performance <= 100,
  };
}

export function calculateCustomFactorEmission(
  quantity: number,
  unit: string,
  customFactor: number,
  factorUnit: string,
  templateFactor: EmissionFactor
): CalculationResult | null {
  const converted = convertToStandardUnit(quantity, unit, factorUnit);
  if (!converted) return null;

  const emission_kgco2e = round(converted.value * customFactor, 6);

  return {
    emission_kgco2e,
    kg_co2e_market_based: emission_kgco2e,
    kg_biogenic_co2: 0,
    emission_co2: emission_kgco2e,
    emission_ch4: null,
    emission_n2o: null,
    converted_quantity: converted.value,
    converted_unit: factorUnit,
    is_assumed_factor: false,
    factor_used: {
      ...templateFactor,
      emission_factor: customFactor,
      unit_standard: factorUnit,
      unit_input: factorUnit,
      data_quality: 'Medium',
      header: {
        ...templateFactor.header,
        source: 'Other',
      },
    },
    confidence_score: 70,
  };
}

export function createRealtimeVarianceInsight(
  draft: ActivityDraftForInsight,
  historicalEntries: Array<{ category: string; activity_type: string; quantity: number }>
) {
  const comparableEntries = historicalEntries.filter(
    (entry) => entry.category === draft.category && entry.activity_type === draft.activity_type
  );

  if (comparableEntries.length < 2) return null;

  const baseline =
    comparableEntries.reduce((sum, entry) => sum + entry.quantity, 0) / comparableEntries.length;
  if (baseline === 0) return null;

  const variance = ((draft.quantity - baseline) / baseline) * 100;
  if (Math.abs(variance) < 15) return null;

  return {
    baseline,
    variancePercent: round(variance, 0),
    message:
      variance > 0
        ? `This activity is ${round(variance, 0)}% above the recent average. Double-check units, invoices, or meter references.`
        : `This activity is ${Math.abs(round(variance, 0))}% below the recent average. Confirm that the reporting period and source document are correct.`,
  };
}

export function formatEmission(kgco2e: number) {
  if (kgco2e >= 1_000_000) return `${round(kgco2e / 1_000_000, 1)} ktCO2e`;
  if (kgco2e >= 1_000) return `${round(kgco2e / 1_000, 1)} tCO2e`;
  return `${round(kgco2e, 2)} kgCO2e`;
}
