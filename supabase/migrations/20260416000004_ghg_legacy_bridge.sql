-- =============================================================================
-- CO2eTrack: GHG 2025 Legacy Bridge
-- Migration: 20260416000004_ghg_legacy_bridge.sql
-- Keeps the normalized emission_factors dataset in sync with the legacy
-- emission_factor_headers / emission_factor_values tables used by the app.
-- =============================================================================

INSERT INTO public.dim_countries (iso2, iso3, name, region_group) VALUES
  ('BH', 'BHR', 'Bahrain', 'Middle East'),
  ('OM', 'OMN', 'Oman', 'Middle East'),
  ('VE', 'VEN', 'Venezuela', 'South America')
ON CONFLICT (iso2) DO NOTHING;

CREATE OR REPLACE FUNCTION public.stable_uuid_from_text(seed TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-' ||
    substr(md5(seed), 13, 4) || '-' ||
    substr(md5(seed), 17, 4) || '-' ||
    substr(md5(seed), 21, 12)
  )::UUID;
$$;

CREATE OR REPLACE FUNCTION public.map_legacy_factor_category(category_code TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE category_code
    WHEN 'fuels_combustion' THEN 'Fuel'
    WHEN 'mobile_combustion' THEN 'Transport'
    WHEN 'process_emissions' THEN 'Other'
    WHEN 'fugitive_emissions' THEN 'Refrigerants'
    WHEN 'purchased_electricity' THEN 'Electricity'
    WHEN 'purchased_elec_mb' THEN 'Electricity'
    WHEN 'business_travel' THEN 'Transport'
    WHEN 'employee_commuting' THEN 'Transport'
    WHEN 'freight_transport' THEN 'Transport'
    WHEN 'waste_operations' THEN 'Waste'
    WHEN 'hotels' THEN 'Other'
    WHEN 'homeworking' THEN 'Other'
    WHEN 'water' THEN 'Other'
    WHEN 'materials' THEN 'Materials'
    WHEN 'wtt_fuels' THEN 'Fuel'
    WHEN 'wtt_electricity' THEN 'Electricity'
    WHEN 'bioenergy' THEN 'Other'
    WHEN 'carbon_removal' THEN 'Other'
    ELSE 'Other'
  END;
$$;

CREATE OR REPLACE FUNCTION public.map_legacy_factor_source(source_sheet TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN source_sheet IS NULL OR btrim(source_sheet) = '' THEN 'Other'
    WHEN source_sheet = 'OWID Energy Data' THEN 'IEA'
    ELSE 'DEFRA'
  END;
$$;

CREATE OR REPLACE FUNCTION public.map_legacy_emission_type(emission_type TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE emission_type
    WHEN 'combustion' THEN 'Direct/TTW'
    WHEN 'electricity' THEN 'Indirect/Electricity'
    WHEN 'wtt' THEN 'WTT'
    ELSE 'Lifecycle/LCA'
  END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_co2e(
  activity_value  NUMERIC,
  factor_id       UUID,
  include_wtt     BOOLEAN DEFAULT false
)
RETURNS TABLE (
  kg_co2e_total     NUMERIC,
  kg_co2_total      NUMERIC,
  kg_ch4_total      NUMERIC,
  kg_n2o_total      NUMERIC,
  kg_co2e_wtt_total NUMERIC,
  kg_co2e_combined  NUMERIC,
  factor_label      TEXT,
  unit_code         TEXT,
  source_sheet      TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_factor public.emission_factors%ROWTYPE;
  v_unit   TEXT;
BEGIN
  SELECT ef.* INTO v_factor
  FROM public.emission_factors ef
  WHERE ef.id = factor_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Emission factor not found: %', factor_id;
  END IF;

  SELECT u.code INTO v_unit
  FROM public.dim_units u
  WHERE u.id = v_factor.unit_id;

  RETURN QUERY SELECT
    ROUND(activity_value * v_factor.kg_co2e, 6) AS kg_co2e_total,
    ROUND(activity_value * COALESCE(v_factor.kg_co2, 0), 6) AS kg_co2_total,
    ROUND(activity_value * COALESCE(v_factor.kg_ch4, 0), 6) AS kg_ch4_total,
    ROUND(activity_value * COALESCE(v_factor.kg_n2o, 0), 6) AS kg_n2o_total,
    ROUND(activity_value * COALESCE(v_factor.kg_co2e_wtt, 0), 6) AS kg_co2e_wtt_total,
    ROUND(
      activity_value * (
        v_factor.kg_co2e +
        CASE WHEN include_wtt THEN COALESCE(v_factor.kg_co2e_wtt, 0) ELSE 0 END
      ),
      6
    ) AS kg_co2e_combined,
    v_factor.activity_label AS factor_label,
    v_unit AS unit_code,
    v_factor.source_sheet AS source_sheet;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_legacy_factor_from_emission_factor(p_emission_factor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_factor RECORD;
  v_header_id UUID;
  v_value_id UUID;
  v_region TEXT;
  v_source_reference TEXT;
  v_denominator NUMERIC;
BEGIN
  SELECT
    ef.id,
    ef.activity_label,
    ef.kg_co2e,
    ef.kg_co2,
    ef.kg_ch4,
    ef.kg_n2o,
    ef.data_quality,
    ef.emission_type,
    ef.gwp_standard,
    ef.notes,
    ef.valid_year,
    ef.source_sheet,
    ef.source_row_ref,
    ef.updated_at,
    gc.code AS category_code,
    u.code AS unit_code,
    c.iso2 AS country_iso2
  INTO v_factor
  FROM public.emission_factors ef
  JOIN public.dim_ghg_categories gc ON gc.id = ef.category_id
  JOIN public.dim_units u ON u.id = ef.unit_id
  LEFT JOIN public.dim_countries c ON c.id = ef.country_id
  WHERE ef.id = p_emission_factor_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_header_id := public.stable_uuid_from_text('legacy-header:' || v_factor.id::TEXT);
  v_value_id := public.stable_uuid_from_text('legacy-value:' || v_factor.id::TEXT);
  v_region := COALESCE(v_factor.country_iso2, 'GLOBAL');
  v_source_reference := CASE
    WHEN v_factor.source_row_ref IS NULL OR btrim(v_factor.source_row_ref) = '' THEN v_factor.source_sheet
    ELSE v_factor.source_sheet || ' | ' || v_factor.source_row_ref
  END;
  v_denominator := NULLIF(v_factor.kg_co2e, 0);

  INSERT INTO public.emission_factor_headers (
    id,
    category,
    activity_type,
    region,
    source,
    source_version,
    methodology_note,
    valid_from,
    valid_to,
    last_updated,
    source_reference,
    is_locked,
    created_at
  )
  VALUES (
    v_header_id,
    public.map_legacy_factor_category(v_factor.category_code),
    v_factor.activity_label,
    v_region,
    public.map_legacy_factor_source(v_factor.source_sheet),
    v_factor.valid_year::TEXT,
    v_factor.notes,
    make_date(v_factor.valid_year, 1, 1),
    make_date(v_factor.valid_year, 12, 31),
    v_factor.updated_at,
    v_source_reference,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    activity_type = EXCLUDED.activity_type,
    region = EXCLUDED.region,
    source = EXCLUDED.source,
    source_version = EXCLUDED.source_version,
    methodology_note = EXCLUDED.methodology_note,
    valid_from = EXCLUDED.valid_from,
    valid_to = EXCLUDED.valid_to,
    last_updated = EXCLUDED.last_updated,
    source_reference = EXCLUDED.source_reference,
    is_locked = EXCLUDED.is_locked;

  INSERT INTO public.emission_factor_values (
    id,
    factor_id,
    unit_input,
    unit_standard,
    emission_factor,
    emission_type,
    gwp_set,
    co2_fraction,
    ch4_fraction,
    n2o_fraction,
    uncertainty_percent,
    data_quality,
    created_at
  )
  VALUES (
    v_value_id,
    v_header_id,
    v_factor.unit_code,
    v_factor.unit_code,
    v_factor.kg_co2e,
    public.map_legacy_emission_type(v_factor.emission_type),
    v_factor.gwp_standard,
    CASE WHEN v_denominator IS NULL THEN NULL ELSE v_factor.kg_co2 / v_denominator END,
    CASE WHEN v_denominator IS NULL THEN NULL ELSE v_factor.kg_ch4 / v_denominator END,
    CASE WHEN v_denominator IS NULL THEN NULL ELSE v_factor.kg_n2o / v_denominator END,
    NULL,
    v_factor.data_quality,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    factor_id = EXCLUDED.factor_id,
    unit_input = EXCLUDED.unit_input,
    unit_standard = EXCLUDED.unit_standard,
    emission_factor = EXCLUDED.emission_factor,
    emission_type = EXCLUDED.emission_type,
    gwp_set = EXCLUDED.gwp_set,
    co2_fraction = EXCLUDED.co2_fraction,
    ch4_fraction = EXCLUDED.ch4_fraction,
    n2o_fraction = EXCLUDED.n2o_fraction,
    uncertainty_percent = EXCLUDED.uncertainty_percent,
    data_quality = EXCLUDED.data_quality;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_sync_legacy_factor_bridge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_legacy_factor_from_emission_factor(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_legacy_factor_bridge ON public.emission_factors;

CREATE TRIGGER trg_sync_legacy_factor_bridge
  AFTER INSERT OR UPDATE ON public.emission_factors
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_sync_legacy_factor_bridge();

SELECT public.sync_legacy_factor_from_emission_factor(id)
FROM public.emission_factors;
