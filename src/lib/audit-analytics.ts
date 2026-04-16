import type {
  ActivityEntryRecord,
  ComplianceChecklistItem,
  DriverBreakdown,
  ForecastSummary,
  IntensityMetrics,
  ReductionOpportunity,
  ScopeName,
  ScopeSummary,
  SmartSignal,
  TrendPoint,
  WorkspaceSummary,
} from './audit-model';

const SCOPE_ORDER: ScopeName[] = ['Scope 1', 'Scope 2', 'Scope 3'];

function safeNumber(value: number | string | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function monthKey(value: string) {
  return value.slice(0, 7);
}

function monthLabel(value: string) {
  const date = new Date(`${value}-01T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function linearForecast(values: number[]) {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const xs = values.map((_, index) => index + 1);
  const xMean = average(xs);
  const yMean = average(values);

  const numerator = xs.reduce((sum, x, index) => sum + (x - xMean) * (values[index] - yMean), 0);
  const denominator = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  return Math.max(0, intercept + slope * (values.length + 1));
}

export function formatKg(value: number) {
  if (value >= 1_000_000) return `${round(value / 1_000_000, 2)} ktCO2e`;
  if (value >= 1_000) return `${round(value / 1_000, 2)} tCO2e`;
  return `${round(value, 2)} kgCO2e`;
}

export function buildScopeSummary(entries: ActivityEntryRecord[]): ScopeSummary[] {
  const totalKg = entries.reduce((sum, entry) => sum + safeNumber(entry.emission_kgco2e), 0);

  return SCOPE_ORDER.map((scope) => {
    const scopeTotal = entries
      .filter((entry) => entry.scope === scope)
      .reduce((sum, entry) => sum + safeNumber(entry.emission_kgco2e), 0);

    return {
      scope,
      totalKg: round(scopeTotal, 2),
      totalTonnes: round(scopeTotal / 1000, 2),
      share: totalKg === 0 ? 0 : round((scopeTotal / totalKg) * 100, 1),
    };
  });
}

export function buildTopDrivers(entries: ActivityEntryRecord[], limit = 6): DriverBreakdown[] {
  const totals = new Map<string, DriverBreakdown>();
  const totalKg = entries.reduce((sum, entry) => sum + safeNumber(entry.emission_kgco2e), 0);

  entries.forEach((entry) => {
    const key = `${entry.category}::${entry.scope}`;
    const current = totals.get(key);
    const total = safeNumber(entry.emission_kgco2e) + (current?.totalKg ?? 0);
    totals.set(key, {
      label: entry.category,
      totalKg: round(total, 2),
      share: 0,
      scope: entry.scope,
    });
  });

  return [...totals.values()]
    .sort((left, right) => right.totalKg - left.totalKg)
    .slice(0, limit)
    .map((driver) => ({
      ...driver,
      share: totalKg === 0 ? 0 : round((driver.totalKg / totalKg) * 100, 1),
    }));
}

export function buildMonthlyTrend(entries: ActivityEntryRecord[], points = 6): TrendPoint[] {
  const totals = new Map<string, number>();

  entries.forEach((entry) => {
    const key = monthKey(entry.entry_date);
    totals.set(key, safeNumber(entry.emission_kgco2e) + (totals.get(key) ?? 0));
  });

  const periods = [...totals.keys()].sort().slice(-points);
  const values = periods.map((period) => totals.get(period) ?? 0);
  const forecast = linearForecast(values);

  return [
    ...periods.map((period) => ({
      label: monthLabel(period),
      period,
      actualKg: round(totals.get(period) ?? 0, 2),
    })),
    {
      label: 'Forecast',
      period: 'forecast',
      actualKg: 0,
      forecastKg: round(forecast, 2),
    },
  ];
}

export function buildForecast(entries: ActivityEntryRecord[]): ForecastSummary {
  const trend = buildMonthlyTrend(entries, 6);
  const actualValues = trend
    .filter((point) => point.period !== 'forecast')
    .map((point) => safeNumber(point.actualKg));
  const nextPeriodKg = trend.find((point) => point.period === 'forecast')?.forecastKg ?? 0;
  const lastActual = actualValues.length > 0 ? actualValues[actualValues.length - 1] : 0;
  const trendPercent = lastActual === 0 ? 0 : round(((nextPeriodKg - lastActual) / lastActual) * 100, 1);

  return {
    nextPeriodLabel: 'Next month',
    nextPeriodKg: round(nextPeriodKg, 2),
    quarterKg: round(nextPeriodKg * 3, 2),
    trendPercent,
  };
}

export function buildSignals(entries: ActivityEntryRecord[]): SmartSignal[] {
  const signals: SmartSignal[] = [];
  const electricityEntries = entries.filter((entry) => entry.category === 'Electricity');
  const latestElectricity = electricityEntries
    .slice()
    .sort((left, right) => right.entry_date.localeCompare(left.entry_date))[0];

  if (latestElectricity) {
    const priorElectricity = electricityEntries
      .filter((entry) => entry.id !== latestElectricity.id)
      .map((entry) => safeNumber(entry.quantity));
    const baseline = average(priorElectricity);

    if (baseline > 0) {
      const variance = ((safeNumber(latestElectricity.quantity) - baseline) / baseline) * 100;
      if (Math.abs(variance) >= 25) {
        signals.push({
          id: `signal-${latestElectricity.id}`,
          title: 'Electricity usage spike detected',
          detail: `Latest electricity usage is ${round(variance, 0)}% above the recent average. Review invoices or meter mapping before approval.`,
          severity: variance > 35 ? 'high' : 'medium',
          type: 'anomaly',
          relatedEntryId: latestElectricity.id,
        });
      }
    }
  }

  const assumedFactors = entries.filter((entry) => entry.is_assumed_factor);
  if (assumedFactors.length > 0) {
    signals.push({
      id: 'signal-assumed-factors',
      title: 'Proxy factors need confirmation',
      detail: `${assumedFactors.length} records are using assumed or proxy factors. Replace them with supplier-specific factors before final sign-off.`,
      severity: assumedFactors.length > 2 ? 'high' : 'medium',
      type: 'data_quality',
      relatedEntryId: assumedFactors[0]?.id,
    });
  }

  const lowQualityEntries = entries.filter((entry) => entry.data_quality === 'Low');
  if (lowQualityEntries.length > 0) {
    signals.push({
      id: 'signal-quality',
      title: 'Low-confidence activity data in queue',
      detail: `${lowQualityEntries.length} entries are marked low quality. Attach evidence and document assumptions to keep the audit timeline on track.`,
      severity: 'medium',
      type: 'workflow',
      relatedEntryId: lowQualityEntries[0]?.id,
    });
  }

  const pendingEntries = entries.filter((entry) => entry.status === 'pending_audit');
  if (pendingEntries.length > 0) {
    signals.push({
      id: 'signal-pending',
      title: 'Audit queue needs reviewer attention',
      detail: `${pendingEntries.length} records are waiting for reviewer validation. Clearing these items is the fastest path to report completion.`,
      severity: pendingEntries.length > 3 ? 'high' : 'low',
      type: 'workflow',
      relatedEntryId: pendingEntries[0]?.id,
    });
  }

  const forecast = buildForecast(entries);
  if (forecast.trendPercent > 10) {
    signals.push({
      id: 'signal-forecast',
      title: 'Projected emissions are trending upward',
      detail: `Current trajectory indicates a ${forecast.trendPercent}% increase next month. Focus reduction actions on your highest-emitting categories.`,
      severity: forecast.trendPercent > 20 ? 'high' : 'medium',
      type: 'forecast',
    });
  }

  return signals.slice(0, 5);
}

export function buildReductionOpportunities(entries: ActivityEntryRecord[]): ReductionOpportunity[] {
  const drivers = buildTopDrivers(entries, 3);
  const opportunities: ReductionOpportunity[] = [];

  drivers.forEach((driver, index) => {
    if (driver.label === 'Electricity') {
      opportunities.push({
        id: `opportunity-${index}-electricity`,
        title: 'Reduce electricity demand at the main site',
        description: 'Investigate HVAC schedules, compressed air leakage, and weekend baseload. Pair with renewable procurement for market-based reporting.',
        estimatedReductionKg: round(driver.totalKg * 0.12, 2),
        priority: 'high',
      });
      return;
    }

    if (driver.label === 'Transport') {
      opportunities.push({
        id: `opportunity-${index}-transport`,
        title: 'Optimize travel and freight routing',
        description: 'Prioritize virtual meetings, consolidate freight, and shift eligible routes to lower-carbon transport modes.',
        estimatedReductionKg: round(driver.totalKg * 0.08, 2),
        priority: 'medium',
      });
      return;
    }

    opportunities.push({
      id: `opportunity-${index}-${driver.label.toLowerCase()}`,
      title: `Improve ${driver.label.toLowerCase()} data and controls`,
      description: 'Work with the asset owner or supplier to collect primary activity data and validate operational assumptions.',
      estimatedReductionKg: round(driver.totalKg * 0.05, 2),
      priority: driver.share > 20 ? 'medium' : 'low',
    });
  });

  return opportunities;
}

export function buildComplianceChecklist(entries: ActivityEntryRecord[]): ComplianceChecklistItem[] {
  const evidenceCount = entries.filter((entry) => (entry.activity_evidence?.length ?? 0) > 0).length;
  const verifiedCount = entries.filter((entry) => entry.status === 'verified').length;
  const hasScopes = new Set(entries.map((entry) => entry.scope)).size >= 2;
  const hasNotes = entries.some((entry) => Boolean(entry.notes));

  return [
    {
      id: 'boundary',
      standard: 'GHG Protocol',
      requirement: 'Organizational and operational boundary documented',
      status: hasScopes ? 'pass' : 'warning',
      detail: hasScopes
        ? 'Scope mapping exists across multiple categories and is ready for reviewer confirmation.'
        : 'Add missing scope classifications before publishing the inventory.',
    },
    {
      id: 'evidence',
      standard: 'ISO 14064-1',
      requirement: 'Source evidence attached for material records',
      status: evidenceCount / Math.max(entries.length, 1) >= 0.5 ? 'pass' : 'warning',
      detail: `${evidenceCount} of ${entries.length} entries currently have supporting files attached.`,
    },
    {
      id: 'review',
      standard: 'CDP',
      requirement: 'High-impact records reviewed and approved',
      status: verifiedCount / Math.max(entries.length, 1) >= 0.6 ? 'pass' : 'fail',
      detail: `${verifiedCount} records are already verified. Complete the pending review queue to improve assurance coverage.`,
    },
    {
      id: 'methodology',
      standard: 'GRI 305',
      requirement: 'Methodology notes and assumptions captured',
      status: hasNotes ? 'pass' : 'warning',
      detail: hasNotes
        ? 'Narrative assumptions are present for at least part of the inventory.'
        : 'Capture methodology notes to support external assurance and report transparency.',
    },
  ];
}

export function buildWorkspaceSummary(
  entries: ActivityEntryRecord[],
  organization?: { fte_count: number; revenue_usd: number; floor_area_sqm: number }
): WorkspaceSummary {
  const totalKg = entries.reduce((sum, entry) => sum + safeNumber(entry.emission_kgco2e), 0);
  const totalBiogenicKg = entries.reduce((sum, entry) => sum + safeNumber(entry.kg_biogenic_co2), 0);
  const marketBasedKg = entries.reduce((sum, entry) => {
    // If specific market-based field is empty, fallback to location-based
    return sum + safeNumber(entry.kg_co2e_market_based ?? entry.emission_kgco2e);
  }, 0);

  const verifiedEntries = entries.filter((entry) => entry.status === 'verified').length;
  const evidenceCoverage =
    entries.length === 0
      ? 0
      : round(
          (entries.filter((entry) => (entry.activity_evidence?.length ?? 0) > 0).length / entries.length) * 100,
          1
        );
  const qualityScore =
    entries.length === 0
      ? 0
      : round(
          (entries.reduce((score, entry) => {
            const quality = entry.data_quality ?? 'Medium';
            const points = quality === 'High' ? 100 : quality === 'Medium' ? 70 : 40;
            return score + points;
          }, 0) / entries.length),
          0
        );

  const statusCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    const key = entry.status ?? 'draft';
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  // Intensity Metrics
  const fte = organization?.fte_count ?? 1;
  const revenue = organization?.revenue_usd ?? 1;
  const area = organization?.floor_area_sqm ?? 1;

  const intensity: IntensityMetrics = {
    fte_count: fte,
    revenue_usd: revenue,
    floor_area_sqm: area,
    intensity_revenue: round(totalKg / Math.max(revenue, 1), 4),
    intensity_fte: round(totalKg / Math.max(fte, 1), 2),
    carbon_intensity_area: round(totalKg / Math.max(area, 1), 2),
  };

  return {
    totalKg: round(totalKg, 2),
    totalBiogenicKg: round(totalBiogenicKg, 2),
    marketBasedKg: round(marketBasedKg, 2),
    netEmissionsKg: round(totalKg + totalBiogenicKg, 2),
    fossilEmissionsKg: round(totalKg, 2),
    qualityScore,
    evidenceCoverage,
    verifiedShare: entries.length === 0 ? 0 : round((verifiedEntries / entries.length) * 100, 1),
    intensity,
    scopeSummary: buildScopeSummary(entries),
    topDrivers: buildTopDrivers(entries),
    monthlyTrend: buildMonthlyTrend(entries),
    forecast: buildForecast(entries),
    signals: buildSignals(entries),
    reductionOpportunities: buildReductionOpportunities(entries),
    checklist: buildComplianceChecklist(entries),
    statusCounts,
  };
}

export interface ScenarioInput {
  targetCategory: string;
  reductionPercent: number;
}

export function simulateScenario(summary: WorkspaceSummary, scenario: ScenarioInput): WorkspaceSummary {
  const reductionFactor = 1 - (scenario.reductionPercent / 100);
  
  const updatedEntries = summary.topDrivers.map(driver => {
    if (driver.label === scenario.targetCategory) {
      return { ...driver, totalKg: driver.totalKg * reductionFactor };
    }
    return driver;
  });

  const newTotalKg = updatedEntries.reduce((sum, d) => sum + d.totalKg, 0);
  
  return {
    ...summary,
    totalKg: round(newTotalKg, 2),
    intensity: {
      ...summary.intensity,
      intensity_revenue: round(newTotalKg / Math.max(summary.intensity.revenue_usd, 1), 4),
      intensity_fte: round(newTotalKg / Math.max(summary.intensity.fte_count, 1), 2),
    },
    topDrivers: updatedEntries.sort((a,b) => b.totalKg - a.totalKg),
  };
}
