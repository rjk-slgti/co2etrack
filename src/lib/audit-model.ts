export type ScopeName = 'Scope 1' | 'Scope 2' | 'Scope 3';
export type EntryStatus = 'draft' | 'pending_audit' | 'verified' | 'rejected';
export type DataQuality = 'High' | 'Medium' | 'Low';

export interface FactorHeaderRecord {
  id: string;
  category: string;
  activity_type: string;
  region: string;
  source: string;
  source_version?: string | null;
  methodology_note?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  is_locked?: boolean;
}

export interface EvidenceRecord {
  id?: string;
  file_path: string;
  file_name: string;
  content_type?: string | null;
  size_bytes?: number | null;
  created_at?: string;
}

export interface ActivityEntryRecord {
  id: string;
  organization_id: string;
  reporting_period_id?: string | null;
  user_id?: string;
  scope: ScopeName;
  scope_category?: string | null;
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
  converted_quantity?: number | null;
  converted_unit?: string | null;
  factor_id?: string | null;
  factor_value_id?: string | null;
  emission_kgco2e: number;
  emission_co2?: number | null;
  emission_ch4?: number | null;
  emission_n2o?: number | null;
  location_based_emission?: number | null;
  market_based_emission?: number | null;
  data_quality?: DataQuality | null;
  is_assumed_factor?: boolean | null;
  notes?: string | null;
  status?: EntryStatus;
  validation_status?: string | null;
  approval_status?: string | null;
  source_channel?: string | null;
  source_document_ref?: string | null;
  confidence_score?: number | null;
  site_name?: string | null;
  supplier_name?: string | null;
  entry_date: string;
  created_at?: string;
  updated_at?: string;
  emission_factor_headers?: FactorHeaderRecord | null;
  activity_evidence?: EvidenceRecord[];
}

export interface ScopeSummary {
  scope: ScopeName;
  totalKg: number;
  totalTonnes: number;
  share: number;
}

export interface TrendPoint {
  label: string;
  period: string;
  actualKg: number;
  forecastKg?: number;
}

export interface DriverBreakdown {
  label: string;
  totalKg: number;
  share: number;
  scope: ScopeName;
}

export interface SmartSignal {
  id: string;
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
  type: 'anomaly' | 'data_quality' | 'workflow' | 'reduction' | 'forecast';
  relatedEntryId?: string;
}

export interface ReductionOpportunity {
  id: string;
  title: string;
  description: string;
  estimatedReductionKg: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ComplianceChecklistItem {
  id: string;
  standard: string;
  requirement: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

export interface ForecastSummary {
  nextPeriodLabel: string;
  nextPeriodKg: number;
  quarterKg: number;
  trendPercent: number;
}

export interface WorkspaceSummary {
  totalKg: number;
  qualityScore: number;
  evidenceCoverage: number;
  verifiedShare: number;
  scopeSummary: ScopeSummary[];
  topDrivers: DriverBreakdown[];
  monthlyTrend: TrendPoint[];
  forecast: ForecastSummary;
  signals: SmartSignal[];
  reductionOpportunities: ReductionOpportunity[];
  checklist: ComplianceChecklistItem[];
  statusCounts: Record<string, number>;
}
