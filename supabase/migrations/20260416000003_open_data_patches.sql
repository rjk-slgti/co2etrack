-- =============================================================================
-- CO2eTrack: Open Data Integration Patches
-- Migration: 20260416000003_open_data_patches.sql
-- Adds unique constraint for upsert, expands countries table
-- =============================================================================

-- Unique constraint on activity_label to allow ON CONFLICT upserts
ALTER TABLE public.emission_factors
  ADD CONSTRAINT uq_ef_activity_label UNIQUE (activity_label);

-- Expand countries table with 40+ additional countries needed for OWID data
INSERT INTO public.dim_countries (iso2, iso3, name, region_group) VALUES
  ('PL', 'POL', 'Poland',                'Europe'),
  ('IT', 'ITA', 'Italy',                 'Europe'),
  ('ES', 'ESP', 'Spain',                 'Europe'),
  ('IE', 'IRL', 'Ireland',               'Europe'),
  ('PT', 'PRT', 'Portugal',              'Europe'),
  ('GR', 'GRC', 'Greece',                'Europe'),
  ('CZ', 'CZE', 'Czech Republic',        'Europe'),
  ('HU', 'HUN', 'Hungary',               'Europe'),
  ('RO', 'ROU', 'Romania',               'Europe'),
  ('FI', 'FIN', 'Finland',               'Europe'),
  ('DK', 'DNK', 'Denmark',               'Europe'),
  ('CH', 'CHE', 'Switzerland',           'Europe'),
  ('AT', 'AUT', 'Austria',               'Europe'),
  ('UA', 'UKR', 'Ukraine',               'Europe'),
  ('KR', 'KOR', 'South Korea',           'Asia'),
  ('ID', 'IDN', 'Indonesia',             'Asia'),
  ('TR', 'TUR', 'Turkey',                'Asia'),
  ('SA', 'SAU', 'Saudi Arabia',          'Middle East'),
  ('AE', 'ARE', 'United Arab Emirates',  'Middle East'),
  ('SG', 'SGP', 'Singapore',             'Asia'),
  ('MY', 'MYS', 'Malaysia',              'Asia'),
  ('TH', 'THA', 'Thailand',              'Asia'),
  ('PH', 'PHL', 'Philippines',           'Asia'),
  ('VN', 'VNM', 'Vietnam',               'Asia'),
  ('PK', 'PAK', 'Pakistan',              'Asia'),
  ('BD', 'BGD', 'Bangladesh',            'Asia'),
  ('LK', 'LKA', 'Sri Lanka',             'Asia'),
  ('NZ', 'NZL', 'New Zealand',           'Oceania'),
  ('NG', 'NGA', 'Nigeria',               'Africa'),
  ('EG', 'EGY', 'Egypt',                 'Africa'),
  ('DZ', 'DZA', 'Algeria',               'Africa'),
  ('MA', 'MAR', 'Morocco',               'Africa'),
  ('KE', 'KEN', 'Kenya',                 'Africa'),
  ('GH', 'GHA', 'Ghana',                 'Africa'),
  ('TZ', 'TZA', 'Tanzania',              'Africa'),
  ('ET', 'ETH', 'Ethiopia',              'Africa'),
  ('IL', 'ISR', 'Israel',                'Middle East'),
  ('AR', 'ARG', 'Argentina',             'South America'),
  ('CL', 'CHL', 'Chile',                 'South America'),
  ('CO', 'COL', 'Colombia',              'South America'),
  ('PE', 'PER', 'Peru',                  'South America'),
  ('MX', 'MEX', 'Mexico',                'North America'),
  ('IQ', 'IRQ', 'Iraq',                  'Middle East'),
  ('IR', 'IRN', 'Iran',                  'Middle East'),
  ('QA', 'QAT', 'Qatar',                 'Middle East'),
  ('KW', 'KWT', 'Kuwait',                'Middle East'),
  ('KZ', 'KAZ', 'Kazakhstan',            'Asia'),
  ('KH', 'KHM', 'Cambodia',              'Asia'),
  ('MM', 'MMR', 'Myanmar',               'Asia'),
  ('LY', 'LBY', 'Libya',                 'Africa'),
  ('SN', 'SEN', 'Senegal',               'Africa'),
  ('ZM', 'ZMB', 'Zambia',                'Africa'),
  ('ZW', 'ZWE', 'Zimbabwe',              'Africa'),
  ('RU', 'RUS', 'Russia',                'Europe'),
  ('MX', 'MEX', 'Mexico',                'North America')
ON CONFLICT (iso2) DO NOTHING;

-- Add index on iso3 for join performance
CREATE INDEX IF NOT EXISTS idx_dim_countries_iso3 ON public.dim_countries(iso3);

-- ============================================================
-- OWID 2023 Sample Electricity Factors (pre-loaded known values)
-- These will be overwritten if/when the Edge Function or
-- PowerShell script runs and fetches live data.
-- Values are in kg CO2e/kWh (= gCO2/kWh ÷ 1000)
-- Source: OWID Energy Data 2023 Provisional
-- ============================================================

-- UK
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (United Kingdom, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='GB'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.23821, 0.23821, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=GBR,year=2023',
  'Medium', 'Source: Our World in Data (OWID). Original: 238.21 gCO2/kWh (2023 provisional). CC BY 4.0.',
  2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Germany
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Germany, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='DE'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.38472, 0.38472, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=DEU,year=2023',
  'Medium', 'Source: OWID. Original: 384.72 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- France
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (France, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='FR'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.05218, 0.05218, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=FRA,year=2023',
  'Medium', 'Source: OWID. Original: 52.18 gCO2/kWh (2023 – low due to nuclear). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- USA
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (United States, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='US'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.36930, 0.36930, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=USA,year=2023',
  'Medium', 'Source: OWID. Original: 369.30 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Australia
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Australia, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='AU'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.53100, 0.53100, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=AUS,year=2023',
  'Medium', 'Source: OWID. Original: 531.00 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- India
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (India, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='IN'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.70840, 0.70840, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=IND,year=2023',
  'Medium', 'Source: OWID. Original: 708.40 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- China
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (China, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='CN'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.56590, 0.56590, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=CHN,year=2023',
  'Medium', 'Source: OWID. Original: 565.90 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Sri Lanka
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Sri Lanka, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='LK'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.50320, 0.50320, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=LKA,year=2023',
  'Medium', 'Source: OWID. Original: 503.20 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Sweden (very low – hydro/nuclear)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Sweden, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='SE'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.01880, 0.01880, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=SWE,year=2023',
  'Medium', 'Source: OWID. Original: 18.80 gCO2/kWh (2023 – hydro/nuclear dominant). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Norway (near-zero – hydro)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Norway, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='NO'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.00870, 0.00870, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=NOR,year=2023',
  'Medium', 'Source: OWID. Original: 8.70 gCO2/kWh (2023 – nearly all hydro). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Japan
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Japan, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='JP'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.47410, 0.47410, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=JPN,year=2023',
  'Medium', 'Source: OWID. Original: 474.10 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- South Africa
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (South Africa, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='ZA'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.88670, 0.88670, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=ZAF,year=2023',
  'Medium', 'Source: OWID. Original: 886.70 gCO2/kWh (2023 – coal-heavy). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();

-- Canada
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard, source_sheet, source_row_ref,
   data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'Electricity – Grid – Location-Based (Canada, 2023)',
  (SELECT id FROM public.dim_countries WHERE iso2='CA'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.13810, 0.13810, 'electricity', 'AR5',
  'OWID Energy Data', 'iso3=CAN,year=2023',
  'Medium', 'Source: OWID. Original: 138.10 gCO2/kWh (2023). CC BY 4.0.', 2023, false
ON CONFLICT (activity_label) DO UPDATE SET kg_co2e=EXCLUDED.kg_co2e, kg_co2=EXCLUDED.kg_co2, updated_at=now();
