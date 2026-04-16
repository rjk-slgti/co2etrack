-- =============================================================================
-- CO2eTrack: Elite Monitoring & Compliance Upgrade
-- Migration: 20260416000006_elite_monitoring_upgrade.sql
-- Adds Intensity Metrics, Biogenic Support, and Compliance Checklist Data
-- =============================================================================

-- 1. Organizations: Physical & Financial Intensity Data
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS fte_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revenue_usd NUMERIC(18,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS floor_area_sqm NUMERIC(18,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS industry_sector TEXT DEFAULT 'Services';

-- 2. Activity Entries: Granular Gas & Biogenic Support
ALTER TABLE public.activity_entries
  ADD COLUMN IF NOT EXISTS kg_co2e_market_based NUMERIC,
  ADD COLUMN IF NOT EXISTS kg_biogenic_co2 NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uncertainty_score NUMERIC(5,2) DEFAULT 0;

-- 3. Reporting Periods: Base Year Flag
ALTER TABLE public.reporting_periods
  ADD COLUMN IF NOT EXISTS is_base_year BOOLEAN DEFAULT false;

-- 4. Compliance Checklist Items: Standardized Data
-- This seeds the checks required for a GHGP / ISO 14064-1 audit
CREATE TABLE IF NOT EXISTS public.compliance_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_name TEXT NOT NULL, -- e.g., 'GHG Protocol', 'ISO 14064-1'
  section TEXT NOT NULL,
  item_code TEXT NOT NULL UNIQUE,
  requirement TEXT NOT NULL,
  guidance TEXT,
  priority TEXT DEFAULT 'medium'
);

INSERT INTO public.compliance_standards (standard_name, section, item_code, requirement, guidance) VALUES
  ('GHG Protocol', 'Boundary', 'GP-B1', 'Organizational boundary approach documented', 'Explain if Equity Share, Financial Control, or Operational Control was used.'),
  ('GHG Protocol', 'Boundary', 'GP-B2', 'Operational boundary (Scope 1, 2, 3) defined', 'List all included and excluded primary activities.'),
  ('GHG Protocol', 'Calculation', 'GP-C1', 'Calculation methodology disclosed', 'Document sources for all emission factors used (e.g., DEFRA 2025).'),
  ('GHG Protocol', 'Calculation', 'GP-C2', 'Base year identified and documented', 'State the base year and the recalculation policy.'),
  ('ISO 14064-1', 'Quantification', 'ISO-Q1', 'Biogenic emissions reported separately', 'GHG emissions from combustion of biomass must be reported alongside Scope 1 but not included in it.'),
  ('ISO 14064-1', 'Quantification', 'ISO-Q2', 'Uncertainty assessment performed', 'Assess qualitative or quantitative uncertainty for each material source.')
ON CONFLICT (item_code) DO NOTHING;

-- 5. Helper Function: Calculate Intensity Ratio
CREATE OR REPLACE FUNCTION public.calculate_intensity_ratio(
  org_id UUID,
  metric_type TEXT, -- 'fte', 'revenue', 'area'
  total_emissions NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_metric_val NUMERIC;
BEGIN
  SELECT CASE metric_type
    WHEN 'fte' THEN fte_count::NUMERIC
    WHEN 'revenue' THEN revenue_usd
    WHEN 'area' THEN floor_area_sqm
    ELSE 1
  END INTO v_metric_val
  FROM public.organizations
  WHERE id = org_id;

  IF v_metric_val IS NULL OR v_metric_val = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND(total_emissions / v_metric_val, 4);
END;
$$;
