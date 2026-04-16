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
  audit_project_id?: string | null;
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
  kg_co2e_market_based?: number | null;
  kg_biogenic_co2?: number | null;
  emission_co2?: number | null;
  emission_ch4?: number | null;
  emission_n2o?: number | null;
  location_based_emission?: number | null;
  market_based_emission?: number | null;
  data_quality?: DataQuality | null;
  is_assumed_factor?: boolean | null;
  notes?: string | null;
  status?: EntryStatus;
  validation_status?: 'pending' | 'under_review' | 'validated' | 'rejected';
  approval_status?: 'not_required' | 'pending' | 'approved' | 'rejected';
  source_channel?: string | null;
  source_document_ref?: string | null;
  confidence_score?: number | null;
  uncertainty_score?: number | null;
  site_name?: string | null;
  supplier_name?: string | null;
  entry_date: string;
  activity_month?: string | null;
  created_at?: string;
  updated_at?: string;
  emission_factor_headers?: FactorHeaderRecord | null;
  activity_evidence?: EvidenceRecord[];
}

export interface AuditProject {
  id: string;
  organization_id: string;
  name: string;
  status: 'planning' | 'data_collection' | 'validation' | 'verification' | 'reported' | 'closed';
  boundary_approach: string;
  target_close_date?: string;
  created_at: string;
}

export interface AuditFinding {
  id: string;
  audit_project_id: string;
  activity_entry_id?: string | null;
  finding_type: 'anomaly' | 'data_gap' | 'control' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  status: 'open' | 'in_review' | 'resolved';
}

export interface IntensityMetrics {
  fte_count: number;
  revenue_usd: number;
  floor_area_sqm: number;
  intensity_revenue: number;
  intensity_fte: number;
  carbon_intensity_area: number;
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
  status: 'todo' | 'pass' | 'warning' | 'fail' | 'na';
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
  totalBiogenicKg: number;
  marketBasedKg: number;
  netEmissionsKg: number;
  fossilEmissionsKg: number;
  qualityScore: number;
  evidenceCoverage: number;
  verifiedShare: number;
  intensity: IntensityMetrics;
  scopeSummary: ScopeSummary[];
  topDrivers: DriverBreakdown[];
  monthlyTrend: TrendPoint[];
  forecast: ForecastSummary;
  signals: SmartSignal[];
  reductionOpportunities: ReductionOpportunity[];
  checklist: ComplianceChecklistItem[];
  statusCounts: Record<string, number>;
}
