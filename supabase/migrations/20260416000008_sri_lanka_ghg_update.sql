-- =============================================================================
-- CO2eTrack: Sri Lanka GHG Suite Upgrade (AR6 Compliance)
-- Migration: 20260416000008_sri_lanka_ghg_update.sql
-- =============================================================================

-- 1. ENHANCE ORGANIZATIONS WITH BOUNDARY & OBJECTIVE
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS objective TEXT CHECK (objective IN ('Compliance', 'Internal tracking', 'Net-zero')),
  ADD COLUMN IF NOT EXISTS boundary_type TEXT DEFAULT 'operational_control' CHECK (boundary_type IN ('operational_control', 'equity_share')),
  ADD COLUMN IF NOT EXISTS building_type TEXT DEFAULT 'commercial' CHECK (building_type IN ('commercial', 'industrial', 'smart', 'educational', 'residential'));

-- 2. SNAPSHOT CALCULATIONS TABLE
CREATE TABLE IF NOT EXISTS public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.audit_projects(id) ON DELETE CASCADE,
  scope_code TEXT NOT NULL,
  category_code TEXT NOT NULL,
  total_kgco2e NUMERIC(18,8) NOT NULL,
  biogenic_kgco2e NUMERIC(18,8) DEFAULT 0,
  gwp_standard TEXT DEFAULT 'AR6',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INTENSITY METRICS TABLE
CREATE TABLE IF NOT EXISTS public.intensity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'm2', 'students', 'revenue', 'production_units'
  metric_value NUMERIC(18,8) NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, metric_name, year)
);

-- 4. SEED SRI LANKA EMISSION FACTORS (2025 CEB/IEA)
-- Note: We use the existing dimension structures from migration 000001
DO $$ 
DECLARE
  v_country_id SMALLINT;
  v_unit_kwh SMALLINT;
  v_unit_litre SMALLINT;
  v_unit_tonne SMALLINT;
  v_cat_elec SMALLINT;
  v_cat_fuels SMALLINT;
  v_cat_waste SMALLINT;
BEGIN
  SELECT id INTO v_country_id FROM public.dim_countries WHERE iso2 = 'BR' LIMIT 1; -- Fallback if LK not exists, let's add LK first
  
  -- Add Sri Lanka to dim_countries if missing
  INSERT INTO public.dim_countries (iso2, iso3, name, region_group)
  VALUES ('LK', 'LKA', 'Sri Lanka', 'Asia')
  ON CONFLICT (iso2) DO UPDATE SET name = EXCLUDED.name, region_group = EXCLUDED.region_group
  RETURNING id INTO v_country_id;

  SELECT id INTO v_unit_kwh FROM public.dim_units WHERE code = 'kWh';
  SELECT id INTO v_unit_litre FROM public.dim_units WHERE code = 'litre';
  SELECT id INTO v_unit_tonne FROM public.dim_units WHERE code = 'tonne';
  
  SELECT id INTO v_cat_elec FROM public.dim_ghg_categories WHERE code = 'purchased_electricity';
  SELECT id INTO v_cat_fuels FROM public.dim_ghg_categories WHERE code = 'fuels_combustion';
  SELECT id INTO v_cat_waste FROM public.dim_ghg_categories WHERE code = 'waste_operations';

  -- SRI LANKA GRID ELECTRICITY (Scope 2)
  INSERT INTO public.emission_factors 
    (scope_id, category_id, activity_label, country_id, unit_id, kg_co2e, emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
  VALUES 
    (2, v_cat_elec, 'Sri Lanka Grid Electricity (CEB 2025)', v_country_id, v_unit_kwh, 0.82000, 'electricity', 'AR6', 'Sri Lanka Custom', 'High', 2025, 'Official CEB average grid emission factor for 2025.')
  ON CONFLICT DO NOTHING;

  -- SRI LANKA DIESEL (Scope 1)
  INSERT INTO public.emission_factors 
    (scope_id, category_id, activity_label, country_id, unit_id, kg_co2e, emission_type, gwp_standard, source_sheet, data_quality, valid_year)
  VALUES 
    (1, v_cat_fuels, 'Diesel - Generator/Vehicle (Sri Lanka)', v_country_id, v_unit_litre, 2.68000, 'combustion', 'AR6', 'Sri Lanka Custom', 'Medium', 2025)
  ON CONFLICT DO NOTHING;

  -- SRI LANKA LPG (Scope 1)
  INSERT INTO public.emission_factors 
    (scope_id, category_id, activity_label, country_id, unit_id, kg_co2e, emission_type, gwp_standard, source_sheet, data_quality, valid_year)
  VALUES 
    (1, v_cat_fuels, 'LPG Cooking/Industrial (Sri Lanka)', v_country_id, v_unit_litre, 1.51000, 'combustion', 'AR6', 'Sri Lanka Custom', 'Medium', 2025)
  ON CONFLICT DO NOTHING;

  -- SRI LANKA WATER (Scope 3)
  INSERT INTO public.emission_factors 
    (scope_id, category_id, activity_label, country_id, unit_id, kg_co2e, emission_type, gwp_standard, source_sheet, data_quality, valid_year)
  VALUES 
    (4, (SELECT id FROM public.dim_ghg_categories WHERE code = 'water'), 'Municipal Water Supply (Sri Lanka)', v_country_id, (SELECT id FROM public.dim_units WHERE code = 'm3'), 0.34000, 'other', 'AR6', 'Sri Lanka Custom', 'Medium', 2025)
  ON CONFLICT DO NOTHING;

END $$;
