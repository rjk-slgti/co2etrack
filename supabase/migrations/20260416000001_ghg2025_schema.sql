-- =============================================================================
-- CO2eTrack: DEFRA UK GHG Conversion Factors 2025 - Full Normalized Schema
-- Migration: 20260416000001_ghg2025_schema.sql
-- PostgreSQL 16+  |  Supabase compatible
-- Source: UK Government GHG Conversion Factors 2025 (DESNZ/DEFRA)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSION
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================================================
-- DIMENSION TABLES
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. GHG SCOPES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_scopes (
  id         SMALLINT PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,   -- 'scope1', 'scope2_lb', 'scope2_mb', 'scope3', 'oos'
  label      TEXT NOT NULL,          -- 'Scope 1', 'Scope 2 (Location-Based)', etc.
  description TEXT
);
COMMENT ON TABLE public.dim_scopes IS
  'GHG Protocol scopes plus "Outside of Scopes" (OOS) used as a boundary flag.';

INSERT INTO public.dim_scopes VALUES
  (1,  'scope1',    'Scope 1',                     'Direct emissions from owned/controlled sources'),
  (2,  'scope2_lb', 'Scope 2 (Location-Based)',     'Indirect emissions from purchased electricity – location-based method'),
  (3,  'scope2_mb', 'Scope 2 (Market-Based)',       'Indirect emissions from purchased electricity – market-based method'),
  (4,  'scope3',    'Scope 3',                      'All other indirect emissions in the value chain'),
  (5,  'oos',       'Outside of Scopes',            'Emissions outside organisational boundary (e.g. passenger flights reported separately)')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. GHG CATEGORIES  (IPCC / GHG Protocol categories)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_ghg_categories (
  id          SMALLSERIAL PRIMARY KEY,
  scope_id    SMALLINT NOT NULL REFERENCES public.dim_scopes(id),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  sort_order  SMALLINT DEFAULT 0
);
COMMENT ON TABLE public.dim_ghg_categories IS
  'Emission categories aligned to GHG Protocol Corporate Standard categories.';

INSERT INTO public.dim_ghg_categories (scope_id, code, label, sort_order) VALUES
  -- Scope 1
  (1, 'fuels_combustion',      'Fuels – Stationary Combustion',         10),
  (1, 'mobile_combustion',     'Mobile Combustion',                      20),
  (1, 'process_emissions',     'Industrial Process Emissions',           30),
  (1, 'fugitive_emissions',    'Fugitive Emissions (Refrigerants)',      40),
  -- Scope 2
  (2, 'purchased_electricity', 'Purchased Electricity',                  50),
  (3, 'purchased_elec_mb',     'Purchased Electricity (Market-Based)',   55),
  -- Scope 3
  (4, 'business_travel',       'Business Travel',                        60),
  (4, 'employee_commuting',    'Employee Commuting',                     70),
  (4, 'freight_transport',     'Freight Transport',                      80),
  (4, 'waste_operations',      'Waste Generated in Operations',          90),
  (4, 'hotels',                'Hotel Stays',                           100),
  (4, 'homeworking',           'Homeworking',                           110),
  (4, 'water',                 'Water Supply & Treatment',              120),
  (4, 'materials',             'Materials & Goods',                     130),
  (4, 'wtt_fuels',             'Well-to-Tank (WtT) – Fuels',           140),
  (4, 'wtt_electricity',       'Well-to-Tank (WtT) – Electricity',     150),
  -- Outside of Scopes
  (5, 'bioenergy',             'Bioenergy (CO₂ only)',                  160),
  (5, 'carbon_removal',        'Carbon Removals',                       170)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. ACTIVITY TYPES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_activities (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id SMALLINT NOT NULL REFERENCES public.dim_ghg_categories(id),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,          -- human-readable name shown in UI
  description TEXT,
  source_sheet TEXT                   -- original Excel sheet name
);
COMMENT ON TABLE public.dim_activities IS
  'Activity types that map to emission factor rows in DEFRA 2025 spreadsheet.';

-- ---------------------------------------------------------------------------
-- 4. UNITS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_units (
  id     SMALLSERIAL PRIMARY KEY,
  code   TEXT NOT NULL UNIQUE,   -- 'kWh', 'litres', 'km', 'tonne', etc.
  label  TEXT NOT NULL,
  si_base TEXT,                  -- base SI unit for conversion (informational)
  unit_type TEXT CHECK (unit_type IN ('energy','volume','mass','distance','area','time','count','currency','other'))
);
COMMENT ON TABLE public.dim_units IS 'Canonical unit registry used across all emission factors.';

INSERT INTO public.dim_units (code, label, si_base, unit_type) VALUES
  ('kWh',       'Kilowatt-hour',         'J',   'energy'),
  ('GJ',        'Gigajoule',             'J',   'energy'),
  ('MWh',       'Megawatt-hour',         'J',   'energy'),
  ('litre',     'Litre',                 'm3',  'volume'),
  ('m3',        'Cubic metre',           'm3',  'volume'),
  ('kg',        'Kilogram',              'kg',  'mass'),
  ('tonne',     'Metric Tonne (1000 kg)','kg',  'mass'),
  ('short_ton', 'Short Ton (US)',        'kg',  'mass'),
  ('km',        'Kilometre',             'm',   'distance'),
  ('mile',      'Mile',                  'm',   'distance'),
  ('passenger_km', 'Passenger-kilometre','m',   'distance'),
  ('tonne_km',  'Tonne-kilometre',       'm',   'distance'),
  ('room_night','Room Night',            NULL,  'count'),
  ('day',       'Day',                   NULL,  'time'),
  ('hour',      'Hour',                  NULL,  'time'),
  ('fte_year',  'FTE Year',              NULL,  'time'),
  ('vehicle_km','Vehicle-kilometre',     'm',   'distance'),
  ('call',      'Call',                  NULL,  'count'),
  ('GB',        'Gigabyte (data)',        NULL,  'other')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. FUELS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_fuels (
  id          SMALLSERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  fuel_group  TEXT CHECK (fuel_group IN ('gaseous','liquid','solid','biomass','biofuel','waste_fuel','other')),
  is_biogenic BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT
);
COMMENT ON TABLE public.dim_fuels IS 'Fuel types from DEFRA 2025 Fuels sheet.';

INSERT INTO public.dim_fuels (code, label, fuel_group, is_biogenic) VALUES
  ('natural_gas',           'Natural Gas',                 'gaseous',   false),
  ('lpg',                   'LPG',                         'gaseous',   false),
  ('cng',                   'Compressed Natural Gas',      'gaseous',   false),
  ('lng',                   'Liquefied Natural Gas',       'gaseous',   false),
  ('biogas',                'Biogas',                      'biomass',   true),
  ('biomethane',            'Biomethane (Grid)',            'biomass',   true),
  ('diesel',                'Diesel (100% mineral)',        'liquid',    false),
  ('petrol',                'Petrol (100% mineral)',        'liquid',    false),
  ('aviation_turbine_fuel', 'Aviation Turbine Fuel (Jet A)','liquid',   false),
  ('aviation_gasoline',     'Aviation Gasoline (AvGas)',   'liquid',    false),
  ('marine_gas_oil',        'Marine Gas Oil',              'liquid',    false),
  ('marine_fuel_oil',       'Marine Fuel Oil (Heavy)',     'liquid',    false),
  ('kerosene',              'Burning Oil / Kerosene',      'liquid',    false),
  ('gas_oil',               'Gas Oil (Red Diesel)',        'liquid',    false),
  ('fuel_oil',              'Fuel Oil',                    'liquid',    false),
  ('lubricants',            'Lubricants',                  'liquid',    false),
  ('biodiesel',             'Biodiesel (100%)',             'biofuel',   true),
  ('bioethanol',            'Bioethanol (100%)',            'biofuel',   true),
  ('biomass_wood_chips',    'Wood Chips (Biomass)',        'biomass',   true),
  ('biomass_wood_pellets',  'Wood Pellets (Biomass)',      'biomass',   true),
  ('biomass_wood_logs',     'Wood Logs (Biomass)',         'biomass',   true),
  ('coal_industrial',       'Coal (Industrial)',           'solid',     false),
  ('coal_electricity',      'Coal (Electricity Generation)','solid',    false),
  ('coking_coal',           'Coking Coal',                 'solid',     false),
  ('anthracite',            'Anthracite',                  'solid',     false),
  ('coke',                  'Petroleum Coke',              'solid',     false),
  ('peat',                  'Peat',                        'solid',     false),
  ('hydrogen_grey',         'Hydrogen (Grey – SMR)',       'gaseous',   false),
  ('hydrogen_green',        'Hydrogen (Green – Electrolysis)','gaseous',true)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. VEHICLE TYPES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_vehicle_types (
  id         SMALLSERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  category   TEXT CHECK (category IN ('car','van','bus','rail','hgv','motorcycle','ferry','aircraft','ship','other'))
);
COMMENT ON TABLE public.dim_vehicle_types IS 'Vehicle types from DEFRA 2025 Passenger and Delivery vehicles sheets.';

INSERT INTO public.dim_vehicle_types (code, label, category) VALUES
  -- Cars
  ('car_average',         'Average Car (all fuels)',          'car'),
  ('car_petrol_small',    'Car – Petrol – Small (<1.4L)',     'car'),
  ('car_petrol_medium',   'Car – Petrol – Medium (1.4–2.0L)','car'),
  ('car_petrol_large',    'Car – Petrol – Large (>2.0L)',     'car'),
  ('car_petrol_average',  'Car – Petrol – Average',           'car'),
  ('car_diesel_small',    'Car – Diesel – Small (<1.7L)',     'car'),
  ('car_diesel_medium',   'Car – Diesel – Medium (1.7–2.0L)','car'),
  ('car_diesel_large',    'Car – Diesel – Large (>2.0L)',     'car'),
  ('car_diesel_average',  'Car – Diesel – Average',           'car'),
  ('car_hybrid_petrol',   'Car – Hybrid – Petrol (PHEV)',     'car'),
  ('car_bev_small',       'Car – Battery Electric – Small',   'car'),
  ('car_bev_medium',      'Car – Battery Electric – Medium',  'car'),
  ('car_bev_large',       'Car – Battery Electric – Large',   'car'),
  ('car_bev_average',     'Car – Battery Electric – Average', 'car'),
  ('car_lpg',             'Car – LPG',                        'car'),
  ('car_cng',             'Car – CNG',                        'car'),
  -- Vans (<3.5t)
  ('van_petrol_small',    'Van – Petrol – Small',    'van'),
  ('van_petrol_medium',   'Van – Petrol – Medium',   'van'),
  ('van_petrol_large',    'Van – Petrol – Large',    'van'),
  ('van_petrol_average',  'Van – Petrol – Average',  'van'),
  ('van_diesel_small',    'Van – Diesel – Small',    'van'),
  ('van_diesel_medium',   'Van – Diesel – Medium',   'van'),
  ('van_diesel_large',    'Van – Diesel – Large',    'van'),
  ('van_diesel_average',  'Van – Diesel – Average',  'van'),
  ('van_bev_small',       'Van – BEV – Small',       'van'),
  ('van_bev_medium',      'Van – BEV – Medium',      'van'),
  ('van_bev_large',       'Van – BEV – Large',       'van'),
  ('van_bev_average',     'Van – BEV – Average',     'van'),
  -- HGVs
  ('hgv_rigid_lt7_5t',    'HGV – Rigid – <7.5t',     'hgv'),
  ('hgv_rigid_7_5_17t',   'HGV – Rigid – 7.5–17t',   'hgv'),
  ('hgv_rigid_gt17t',     'HGV – Rigid – >17t',      'hgv'),
  ('hgv_rigid_average',   'HGV – Rigid – Average',    'hgv'),
  ('hgv_artic_lt33t',     'HGV – Articulated – <33t', 'hgv'),
  ('hgv_artic_gt33t',     'HGV – Articulated – >33t', 'hgv'),
  ('hgv_artic_average',   'HGV – Articulated – Average','hgv'),
  ('hgv_average_all',     'HGV – All – Average',      'hgv'),
  -- Buses
  ('bus_local_average',   'Bus – Local / Average',    'bus'),
  ('coach_average',       'Coach – Average',          'bus'),
  -- Rail
  ('rail_national',       'National Rail – Average',  'rail'),
  ('rail_international',  'International Rail (Eurostar)','rail'),
  ('rail_light_tram',     'Light Rail & Tram',        'rail'),
  ('rail_london_tube',    'London Underground / Tube', 'rail'),
  -- Flights
  ('flight_domestic',     'Domestic Flight – Economy', 'aircraft'),
  ('flight_shorthaul_eco','Short-Haul Flight – Economy','aircraft'),
  ('flight_shorthaul_bus','Short-Haul Flight – Business','aircraft'),
  ('flight_longhaul_eco', 'Long-Haul Flight – Economy','aircraft'),
  ('flight_longhaul_prem','Long-Haul Flight – Premium Economy','aircraft'),
  ('flight_longhaul_bus', 'Long-Haul Flight – Business','aircraft'),
  ('flight_longhaul_first','Long-Haul Flight – First',  'aircraft'),
  ('flight_average',      'Average Flight (all classes)','aircraft'),
  -- Ferry
  ('ferry_foot_passenger','Ferry – Foot Passenger',   'ferry'),
  ('ferry_car',           'Ferry – Car',              'ferry'),
  -- Motorcycle
  ('motorcycle_small',    'Motorcycle – Small (<125cc)','motorcycle'),
  ('motorcycle_medium',   'Motorcycle – Medium',      'motorcycle'),
  ('motorcycle_large',    'Motorcycle – Large (>500cc)','motorcycle'),
  ('motorcycle_average',  'Motorcycle – Average',     'motorcycle')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. HGV LADEN STATUS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_hgv_laden (
  id    SMALLSERIAL PRIMARY KEY,
  code  TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);
INSERT INTO public.dim_hgv_laden (code, label) VALUES
  ('laden_100',  '100% Laden'),
  ('laden_75',   '75% Laden'),
  ('laden_50',   '50% Laden'),
  ('laden_0',    'Empty (0% Laden)'),
  ('average',    'Average Laden')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. HAUL DEFINITIONS (for freight / air)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_haul_definitions (
  id            SMALLSERIAL PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  label         TEXT NOT NULL,
  min_km        NUMERIC,
  max_km        NUMERIC,
  description   TEXT
);
INSERT INTO public.dim_haul_definitions (code, label, min_km, max_km, description) VALUES
  ('domestic',   'Domestic',              NULL,  NULL, 'Within same country'),
  ('short_haul', 'Short-Haul',           0,     3700, 'Flights/freight up to ~3,700 km'),
  ('long_haul',  'Long-Haul',            3700,  NULL, 'Flights/freight above 3,700 km'),
  ('local',      'Local',                NULL,  50,   'Road freight local distribution'),
  ('regional',   'Regional',             50,    300,  'Road freight regional'),
  ('national',   'National',             300,   NULL, 'Road freight national / trunking')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. COUNTRIES / REGIONS  (for international electricity, hotels etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_countries (
  id           SMALLSERIAL PRIMARY KEY,
  iso2         CHAR(2) NOT NULL UNIQUE,
  iso3         CHAR(3),
  name         TEXT NOT NULL,
  region_group TEXT   -- 'UK', 'Europe', 'North America', 'Asia', etc.
);
INSERT INTO public.dim_countries (iso2, iso3, name, region_group) VALUES
  ('GB', 'GBR', 'United Kingdom',    'UK'),
  ('US', 'USA', 'United States',     'North America'),
  ('CA', 'CAN', 'Canada',            'North America'),
  ('DE', 'DEU', 'Germany',           'Europe'),
  ('FR', 'FRA', 'France',            'Europe'),
  ('NL', 'NLD', 'Netherlands',       'Europe'),
  ('BE', 'BEL', 'Belgium',           'Europe'),
  ('SE', 'SWE', 'Sweden',            'Europe'),
  ('NO', 'NOR', 'Norway',            'Europe'),
  ('AU', 'AUS', 'Australia',         'Oceania'),
  ('CN', 'CHN', 'China',             'Asia'),
  ('JP', 'JPN', 'Japan',             'Asia'),
  ('IN', 'IND', 'India',             'Asia'),
  ('ZA', 'ZAF', 'South Africa',      'Africa'),
  ('BR', 'BRA', 'Brazil',            'South America')
ON CONFLICT (iso2) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. ELECTRICITY MARKET SEGMENTS  (residual mix, supplier mix, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_market_segments (
  id    SMALLSERIAL PRIMARY KEY,
  code  TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  notes TEXT
);
INSERT INTO public.dim_market_segments (code, label, notes) VALUES
  ('location_based',  'Location-Based',          'Grid average – location-based method'),
  ('market_based',    'Market-Based (Residual)',  'Residual mix – market-based method'),
  ('renewable_tariff','Renewable Energy Tariff',  'Supplier-specific renewable tariff'),
  ('ppa',             'Power Purchase Agreement', 'Direct PPA (contractual instrument'),
  ('rec',             'Renewable Energy Certificate','REC / REGO backed supply')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 11. WASTE TREATMENT TYPES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dim_waste_treatments (
  id    SMALLSERIAL PRIMARY KEY,
  code  TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  notes TEXT
);
INSERT INTO public.dim_waste_treatments (code, label, notes) VALUES
  ('landfill',           'Landfill',                         NULL),
  ('open_loop_recycling','Open-Loop Recycling',              'Average recycling, credit approach'),
  ('closed_loop_recycling','Closed-Loop Recycling',          'Closed-loop material recycling'),
  ('combustion_ner',     'Combustion (with Energy Recovery)','Energy-from-waste with NER'),
  ('combustion_no_er',   'Combustion (no Energy Recovery)',  'Energy-from-waste no recovery'),
  ('composting',         'Composting',                       NULL),
  ('anaerobic_digestion','Anaerobic Digestion',              NULL),
  ('reuse',              'Reuse',                            NULL),
  ('waste_water',        'Waste Water Treatment',            NULL)
ON CONFLICT (code) DO NOTHING;

-- ===========================================================================
-- CORE TABLE: EMISSION_FACTORS
-- One row per unique combination of activity × unit × gas-type from DEFRA 2025
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.emission_factors (
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Classification
  scope_id          SMALLINT    NOT NULL REFERENCES public.dim_scopes(id),
  category_id       SMALLINT    NOT NULL REFERENCES public.dim_ghg_categories(id),
  activity_id       UUID        REFERENCES public.dim_activities(id),
  activity_label    TEXT        NOT NULL,   -- denormalised for fast UI queries

  -- Dimension FK (nullable – only relevant ones populated)
  fuel_id           SMALLINT    REFERENCES public.dim_fuels(id),
  vehicle_type_id   SMALLINT    REFERENCES public.dim_vehicle_types(id),
  hgv_laden_id      SMALLINT    REFERENCES public.dim_hgv_laden(id),
  haul_id           SMALLINT    REFERENCES public.dim_haul_definitions(id),
  country_id        SMALLINT    REFERENCES public.dim_countries(id),
  market_segment_id SMALLINT    REFERENCES public.dim_market_segments(id),
  waste_treatment_id SMALLINT   REFERENCES public.dim_waste_treatments(id),

  -- Input unit
  unit_id           SMALLINT    NOT NULL REFERENCES public.dim_units(id),

  -- GHG values (kg per unit_id)
  kg_co2e           NUMERIC(18,8) NOT NULL,   -- total CO₂e (GWP AR5 by default)
  kg_co2            NUMERIC(18,8),             -- CO₂ component
  kg_ch4            NUMERIC(18,8),             -- CH₄ component (as CO₂e)
  kg_n2o            NUMERIC(18,8),             -- N₂O component (as CO₂e)
  kg_biogenic_co2   NUMERIC(18,8),             -- biogenic CO₂ (outside of scopes)

  -- WtT / upstream components
  kg_co2e_wtt       NUMERIC(18,8),             -- Well-to-Tank uplift factor
  kg_co2e_ttw       NUMERIC(18,8),             -- Tank-to-Wheel (combustion only)

  -- Metadata
  emission_type     TEXT NOT NULL DEFAULT 'combustion'
                    CHECK (emission_type IN (
                      'combustion','wtt','lifecycle','electricity',
                      'refrigerant','waste','transport','hotel','homeworking','other'
                    )),
  gwp_standard      TEXT NOT NULL DEFAULT 'AR5'
                    CHECK (gwp_standard IN ('AR4','AR5','AR6')),
  source_sheet      TEXT NOT NULL,             -- exact Excel sheet name
  source_row_ref    TEXT,                      -- row / table reference inside sheet
  data_quality      TEXT NOT NULL DEFAULT 'High'
                    CHECK (data_quality IN ('High','Medium','Low')),
  notes             TEXT,
  valid_year        SMALLINT NOT NULL DEFAULT 2025,
  is_wtt_factor     BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.emission_factors IS
  'Normalised emission factors from UK Government GHG Conversion Factors 2025 (DEFRA/DESNZ). '
  'Each row is one unique factor.  kg_co2e = total lifecycle CO₂ equivalent per unit.';

COMMENT ON COLUMN public.emission_factors.kg_co2e IS 'Total GHG intensity in kg CO₂e per unit (AR5 GWP100 unless gwp_standard differs).';
COMMENT ON COLUMN public.emission_factors.kg_co2   IS 'CO₂ component of kg_co2e.';
COMMENT ON COLUMN public.emission_factors.kg_ch4   IS 'CH₄ component expressed as kg CO₂e.';
COMMENT ON COLUMN public.emission_factors.kg_n2o   IS 'N₂O component expressed as kg CO₂e.';
COMMENT ON COLUMN public.emission_factors.kg_co2e_wtt IS 'Well-to-Tank upstream factor (Scope 3 WtT).';
COMMENT ON COLUMN public.emission_factors.source_sheet IS 'Source Excel sheet from ghg-conversion-factors-2025-full-set.xlsx.';

-- Enable RLS
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read emission factors"
  ON public.emission_factors FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage emission factors"
  ON public.emission_factors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anon read (needed for public factor browsing)
CREATE POLICY "Anon can read emission factors"
  ON public.emission_factors FOR SELECT TO anon
  USING (true);

-- ===========================================================================
-- INDEXES
-- ===========================================================================
CREATE INDEX idx_ef_scope       ON public.emission_factors(scope_id);
CREATE INDEX idx_ef_category    ON public.emission_factors(category_id);
CREATE INDEX idx_ef_unit        ON public.emission_factors(unit_id);
CREATE INDEX idx_ef_fuel        ON public.emission_factors(fuel_id) WHERE fuel_id IS NOT NULL;
CREATE INDEX idx_ef_vehicle     ON public.emission_factors(vehicle_type_id) WHERE vehicle_type_id IS NOT NULL;
CREATE INDEX idx_ef_country     ON public.emission_factors(country_id) WHERE country_id IS NOT NULL;
CREATE INDEX idx_ef_year        ON public.emission_factors(valid_year);
CREATE INDEX idx_ef_sheet       ON public.emission_factors(source_sheet);
CREATE INDEX idx_ef_activity    ON public.emission_factors(activity_label);
CREATE INDEX idx_ef_emission_type ON public.emission_factors(emission_type);

-- Full-text search index for auditors
CREATE INDEX idx_ef_fts ON public.emission_factors
  USING gin(to_tsvector('english', activity_label || ' ' || COALESCE(notes,'')));

-- Composite – most common UI drill-down
CREATE INDEX idx_ef_scope_category_unit
  ON public.emission_factors(scope_id, category_id, unit_id);

-- ===========================================================================
-- UPDATED_AT TRIGGER
-- ===========================================================================
CREATE TRIGGER trg_ef_updated_at
  BEFORE UPDATE ON public.emission_factors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================================
-- FUNCTION: calculate_co2e
-- Returns total kgCO2e = activity_value × factor.kg_co2e
-- Optionally returns WtT-inclusive total when include_wtt = true
-- ===========================================================================
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
  kg_co2e_combined  NUMERIC,   -- combustion + WtT
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
  -- Fetch factor row
  SELECT ef.* INTO v_factor
  FROM   public.emission_factors ef
  WHERE  ef.id = factor_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Emission factor not found: %', factor_id;
  END IF;

  -- Unit code
  SELECT u.code INTO v_unit
  FROM   public.dim_units u
  WHERE  u.id = v_factor.unit_id;

  RETURN QUERY SELECT
    ROUND(activity_value * v_factor.kg_co2e,                                            6) AS kg_co2e_total,
    ROUND(activity_value * COALESCE(v_factor.kg_co2, 0),                               6) AS kg_co2_total,
    ROUND(activity_value * COALESCE(v_factor.kg_ch4, 0),                               6) AS kg_ch4_total,
    ROUND(activity_value * COALESCE(v_factor.kg_n2o, 0),                               6) AS kg_n2o_total,
    ROUND(activity_value * COALESCE(v_factor.kg_co2e_wtt, 0),                          6) AS kg_co2e_wtt_total,
    ROUND(activity_value * (v_factor.kg_co2e + COALESCE(v_factor.kg_co2e_wtt, 0)),     6) AS kg_co2e_combined,
    v_factor.activity_label                                                                AS factor_label,
    v_unit                                                                                 AS unit_code,
    v_factor.source_sheet                                                                  AS source_sheet;
END;
$$;

COMMENT ON FUNCTION public.calculate_co2e IS
  'Calculates total kgCO2e emissions for a given activity volume and DEFRA 2025 factor. '
  'Set include_wtt=true to receive well-to-tank upstream totals.';

-- ===========================================================================
-- FUNCTION: calculate_co2e_batch (for bulk calculation in one call)
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.calculate_co2e_batch(
  entries JSONB   -- [{factor_id, activity_value}, ...]
)
RETURNS TABLE(
  factor_id         UUID,
  activity_value    NUMERIC,
  kg_co2e_total     NUMERIC,
  kg_co2e_combined  NUMERIC,
  factor_label      TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry     JSONB;
  v_fid     UUID;
  v_val     NUMERIC;
  v_result  RECORD;
BEGIN
  FOR entry IN SELECT jsonb_array_elements(entries)
  LOOP
    v_fid := (entry->>'factor_id')::UUID;
    v_val := (entry->>'activity_value')::NUMERIC;
    SELECT * INTO v_result FROM public.calculate_co2e(v_val, v_fid);
    RETURN QUERY SELECT v_fid, v_val,
      v_result.kg_co2e_total,
      v_result.kg_co2e_combined,
      v_result.factor_label;
  END LOOP;
END;
$$;

-- ===========================================================================
-- VIEWS
-- ===========================================================================

-- Auditor-friendly flat view
CREATE OR REPLACE VIEW public.vw_emission_factors_full AS
SELECT
  ef.id,
  s.code                AS scope_code,
  s.label               AS scope_label,
  gc.code               AS category_code,
  gc.label              AS category_label,
  ef.activity_label,
  f.label               AS fuel,
  vt.label              AS vehicle_type,
  hl.label              AS hgv_laden_status,
  hd.label              AS haul,
  c.name                AS country,
  ms.label              AS market_segment,
  wt.label              AS waste_treatment,
  u.code                AS unit,
  ef.kg_co2e,
  ef.kg_co2,
  ef.kg_ch4,
  ef.kg_n2o,
  ef.kg_biogenic_co2,
  ef.kg_co2e_wtt,
  ef.kg_co2e_ttw,
  ef.emission_type,
  ef.gwp_standard,
  ef.data_quality,
  ef.source_sheet,
  ef.source_row_ref,
  ef.notes,
  ef.valid_year,
  ef.is_wtt_factor,
  ef.created_at
FROM public.emission_factors ef
JOIN public.dim_scopes              s   ON s.id  = ef.scope_id
JOIN public.dim_ghg_categories      gc  ON gc.id = ef.category_id
JOIN public.dim_units               u   ON u.id  = ef.unit_id
LEFT JOIN public.dim_fuels          f   ON f.id  = ef.fuel_id
LEFT JOIN public.dim_vehicle_types  vt  ON vt.id = ef.vehicle_type_id
LEFT JOIN public.dim_hgv_laden      hl  ON hl.id = ef.hgv_laden_id
LEFT JOIN public.dim_haul_definitions hd ON hd.id = ef.haul_id
LEFT JOIN public.dim_countries      c   ON c.id  = ef.country_id
LEFT JOIN public.dim_market_segments ms ON ms.id = ef.market_segment_id
LEFT JOIN public.dim_waste_treatments wt ON wt.id = ef.waste_treatment_id;

COMMENT ON VIEW public.vw_emission_factors_full IS
  'Denormalised audit view joining all dimension tables – use for reports and exports.';

-- Summary by scope + category
CREATE OR REPLACE VIEW public.vw_factors_by_scope AS
SELECT
  s.label              AS scope,
  gc.label             AS category,
  COUNT(*)             AS factor_count,
  MIN(ef.kg_co2e)      AS min_kg_co2e,
  MAX(ef.kg_co2e)      AS max_kg_co2e,
  ROUND(AVG(ef.kg_co2e),6) AS avg_kg_co2e,
  ef.unit_id,
  u.code               AS unit
FROM public.emission_factors ef
JOIN public.dim_scopes         s  ON s.id  = ef.scope_id
JOIN public.dim_ghg_categories gc ON gc.id = ef.category_id
JOIN public.dim_units          u  ON u.id  = ef.unit_id
GROUP BY s.label, gc.label, ef.unit_id, u.code
ORDER BY s.label, gc.label;

-- Electricity factors view
CREATE OR REPLACE VIEW public.vw_electricity_factors AS
SELECT
  ef.id,
  ef.activity_label,
  c.name                AS country,
  ms.label              AS market_segment,
  ef.kg_co2e            AS kg_co2e_per_kwh,
  ef.valid_year,
  ef.source_sheet
FROM public.emission_factors ef
JOIN public.dim_ghg_categories gc ON gc.id = ef.category_id
LEFT JOIN public.dim_countries      c  ON c.id  = ef.country_id
LEFT JOIN public.dim_market_segments ms ON ms.id = ef.market_segment_id
WHERE gc.code IN ('purchased_electricity', 'purchased_elec_mb');

COMMENT ON VIEW public.vw_electricity_factors IS
  'Electricity grid emission factors – both location-based and market-based.';
