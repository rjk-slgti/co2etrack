-- =============================================================================
-- CO2eTrack: DEFRA UK GHG Conversion Factors 2025 — Seed Data
-- Migration: 20260416000002_ghg2025_seed.sql
-- Source: ghg-conversion-factors-2025-full-set.xlsx
-- All kg_co2e values are per the stated unit, GWP AR5 unless noted.
-- Columns: (scope_id, category_id, activity_label, fuel_id, vehicle_type_id,
--           hgv_laden_id, haul_id, country_id, market_segment_id,
--           waste_treatment_id, unit_id,
--           kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt, kg_co2e_ttw,
--           emission_type, gwp_standard, source_sheet, source_row_ref,
--           data_quality, notes, valid_year)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: resolve dimension codes → ids
-- We use a DO block with temp table to avoid repeated sub-selects
-- ---------------------------------------------------------------------------

-- Scopes:  1=scope1  2=scope2_lb  3=scope2_mb  4=scope3  5=oos
-- Categories fetched by code below

-- ============================================================
-- SHEET: Fuels
-- Unit: litre (liquid fuels) / kWh (gas) / kg (solid fuels)
-- Scope 1 — Stationary + Mobile Combustion (kg per stated unit)
-- ============================================================

-- NATURAL GAS  (kWh gross CV)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Natural Gas – Gross CV',
  (SELECT id FROM public.dim_fuels WHERE code='natural_gas'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.18293, 0.18148, 0.00098, 0.00047, 0.02878,
  'combustion','AR5','Fuels','High',2025;

-- NATURAL GAS  (kWh net CV)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Natural Gas – Net CV',
  (SELECT id FROM public.dim_fuels WHERE code='natural_gas'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.20269, 0.20107, 0.00109, 0.00053, 0.03193,
  'combustion','AR5','Fuels','High',2025;

-- NATURAL GAS (per m3)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Natural Gas – per m³',
  (SELECT id FROM public.dim_fuels WHERE code='natural_gas'),
  (SELECT id FROM public.dim_units WHERE code='m3'),
  2.03397, 2.01612, 0.01216, 0.00570, 0.35408,
  'combustion','AR5','Fuels','High',2025;

-- LPG (litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'LPG – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='lpg'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  1.55540, 1.54937, 0.00386, 0.00218, 0.16592,
  'combustion','AR5','Fuels','High',2025;

-- DIESEL (litre) – combustion only (TTW)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt, kg_co2e_ttw,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Diesel (100% mineral) – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='diesel'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  2.51060, 2.50596, 0.00131, 0.00334, 0.60700, 2.51060,
  'combustion','AR5','Fuels','High',2025,
  'Tank-to-Wheel only. Add WtT factor (0.607 kg CO2e/litre) for Scope 3 WtT total.';

-- PETROL (litre) – combustion only (TTW)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt, kg_co2e_ttw,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Petrol (100% mineral) – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='petrol'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  2.15258, 2.14887, 0.00137, 0.00234, 0.58600, 2.15258,
  'combustion','AR5','Fuels','High',2025,
  'Tank-to-Wheel only. Add WtT factor (0.586 kg CO2e/litre) for Scope 3 WtT total.';

-- AVIATION TURBINE FUEL (litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Aviation Turbine Fuel (Jet A-1) – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='aviation_turbine_fuel'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  2.54038, 2.53530, 0.00152, 0.00356, 0.53600,
  'combustion','AR5','Fuels','High',2025;

-- KEROSENE (litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Burning Oil / Kerosene – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='kerosene'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  2.52074, 2.51537, 0.00167, 0.00370, 0.52100,
  'combustion','AR5','Fuels','High',2025;

-- GAS OIL / RED DIESEL (litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Gas Oil (Red Diesel) – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='gas_oil'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  2.75931, 2.75354, 0.00183, 0.00394, 0.61700,
  'combustion','AR5','Fuels','High',2025;

-- COAL – Industrial (per tonne)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Coal (Industrial) – per tonne',
  (SELECT id FROM public.dim_fuels WHERE code='coal_industrial'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  2423.00, 2417.00, 3.60, 2.40, 145.00,
  'combustion','AR5','Fuels','High',2025;

-- WOOD PELLETS – Biomass (per tonne) — biogenic CO2 outside scopes
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_biogenic_co2, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT
  1,
  (SELECT id FROM public.dim_ghg_categories WHERE code='fuels_combustion'),
  'Wood Pellets (Biomass) – per tonne',
  (SELECT id FROM public.dim_fuels WHERE code='biomass_wood_pellets'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  29.00, 0.00, 15.00, 14.00, 1821.00, 135.80,
  'combustion','AR5','Fuels','High',2025,
  'kg_co2e excludes biogenic CO2 (1821 kg/t). Biogenic CO2 reported as outside-of-scopes per GHG Protocol.';

-- ============================================================
-- SHEET: UK Electricity
-- ============================================================

-- UK GRID – Location-Based (per kWh)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT
  2,
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  'UK Electricity – Grid – Location-Based',
  (SELECT id FROM public.dim_countries WHERE iso2='GB'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.20493, 0.19800, 0.00480, 0.00213,
  'electricity','AR5','UK Electricity','High',2025,
  'DESNZ 2025 provisional. Includes generation and T&D losses.';

-- UK GRID – Transmission & Distribution losses (per kWh)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT
  4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='wtt_electricity'),
  'UK Electricity – T&D Losses (Scope 3 WtT)',
  (SELECT id FROM public.dim_countries WHERE iso2='GB'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.01878,
  'wtt','AR5','UK Electricity','High',2025,
  'Transmission and distribution loss factor for Scope 3 WtT reporting.';

-- UK ELECTRICITY – Well-to-Tank (generation upstream, per kWh)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, unit_id,
   kg_co2e, is_wtt_factor,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT
  4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='wtt_electricity'),
  'UK Electricity – WtT (Upstream) per kWh',
  (SELECT id FROM public.dim_countries WHERE iso2='GB'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.01878, true,
  'wtt','AR5','UK Electricity','High',2025,
  'Well-to-tank upstream factor for UK grid electricity per kWh consumed.';

-- ============================================================
-- SHEET: Passenger vehicles (km-based, per vehicle km)
-- ============================================================

-- AVERAGE CAR (all fuels)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT
  4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Average – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_average'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.16671, 0.16238, 0.00263, 0.00170, 0.03712,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR PETROL – SMALL
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Petrol – Small – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_petrol_small'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.14861, 0.14486, 0.00234, 0.00141, 0.03310,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR PETROL – MEDIUM
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Petrol – Medium – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_petrol_medium'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.19073, 0.18584, 0.00301, 0.00188, 0.04249,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR PETROL – LARGE
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Petrol – Large – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_petrol_large'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.27723, 0.27021, 0.00437, 0.00265, 0.06172,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR DIESEL – SMALL
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Diesel – Small – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_diesel_small'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.13770, 0.13559, 0.00089, 0.00122, 0.03325,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR DIESEL – MEDIUM
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Diesel – Medium – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_diesel_medium'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.17035, 0.16774, 0.00110, 0.00151, 0.04115,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR DIESEL – LARGE
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Diesel – Large – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_diesel_large'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.21614, 0.21283, 0.00140, 0.00192, 0.05223,
  'transport','AR5','Passenger vehicles','High',2025;

-- CAR BEV – SMALL
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Battery Electric – Small – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_bev_small'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.02752, 0.02662, 0.00063, 0.00028,
  'transport','AR5','Passenger vehicles','High',2025,
  'Uses UK grid location-based electricity factor 2025.';

-- CAR BEV – MEDIUM
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Battery Electric – Medium – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_bev_medium'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.04234, 0.04093, 0.00096, 0.00045,
  'transport','AR5','Passenger vehicles','High',2025,
  'Uses UK grid location-based electricity factor 2025.';

-- CAR BEV – LARGE
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Car – Battery Electric – Large – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='car_bev_large'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.06023, 0.05824, 0.00137, 0.00062,
  'transport','AR5','Passenger vehicles','High',2025,
  'Uses UK grid location-based electricity factor 2025.';

-- MOTORCYCLE – AVERAGE
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Motorcycle – Average – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='motorcycle_average'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.11370, 0.10942, 0.00285, 0.00143, 0.02530,
  'transport','AR5','Passenger vehicles','High',2025;

-- NATIONAL RAIL
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Rail – National Rail – per passenger-km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='rail_national'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.03549, 0.03432, 0.00082, 0.00035,
  'transport','AR5','Passenger vehicles','High',2025,
  'UK National Rail average including traction electricity and diesel.';

-- LONDON UNDERGROUND
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Rail – London Underground – per passenger-km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='rail_london_tube'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.02807,
  'transport','AR5','Passenger vehicles','High',2025;

-- ============================================================
-- SHEET: Delivery vehicles  (vans & HGVs)
-- ============================================================

-- VAN DIESEL – AVERAGE (per km)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='freight_transport'),
  'Van – Diesel – Average – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='van_diesel_average'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.20808, 0.20481, 0.00135, 0.00192, 0.05024,
  'transport','AR5','Delivery vehicles','High',2025;

-- VAN BEV – AVERAGE (per km)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='freight_transport'),
  'Van – Battery Electric – Average – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='van_bev_average'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.07540, 0.07289, 0.00172, 0.00079,
  'transport','AR5','Delivery vehicles','High',2025,
  'UK grid location-based factor. Use market-based for renewable electricity contracts.';

-- HGV RIGID – AVERAGE – AVERAGE LADEN (per km)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, hgv_laden_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='freight_transport'),
  'HGV – Rigid – Average – Average Laden – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='hgv_rigid_average'),
  (SELECT id FROM public.dim_hgv_laden WHERE code='average'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.62764, 0.61803, 0.00418, 0.00543, 0.15168,
  'transport','AR5','Delivery vehicles','High',2025;

-- HGV ARTIC – AVERAGE – AVERAGE LADEN (per km)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, hgv_laden_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='freight_transport'),
  'HGV – Articulated – Average – Average Laden – per km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='hgv_artic_average'),
  (SELECT id FROM public.dim_hgv_laden WHERE code='average'),
  (SELECT id FROM public.dim_units WHERE code='km'),
  0.81895, 0.80643, 0.00545, 0.00707, 0.19795,
  'transport','AR5','Delivery vehicles','High',2025;

-- HGV ALL AVERAGE – per tonne-km
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, hgv_laden_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='freight_transport'),
  'HGV – All – Average – per tonne-km',
  (SELECT id FROM public.dim_vehicle_types WHERE code='hgv_average_all'),
  (SELECT id FROM public.dim_hgv_laden WHERE code='average'),
  (SELECT id FROM public.dim_units WHERE code='tonne_km'),
  0.10050, 0.09897, 0.00067, 0.00086, 0.02428,
  'transport','AR5','Delivery vehicles','High',2025;

-- ============================================================
-- SHEET: Business travel – Air
-- (Outside of Scopes for passenger flights or Scope 3 for freight)
-- ============================================================

-- DOMESTIC FLIGHT – ECONOMY (with radiative forcing)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, haul_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Flight – Domestic – Economy – per passenger-km (with RF)',
  (SELECT id FROM public.dim_vehicle_types WHERE code='flight_domestic'),
  (SELECT id FROM public.dim_haul_definitions WHERE code='domestic'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.24510, 0.11990, 0.00024, 0.00536, 0.02020,
  'transport','AR5','Business travel- air','High',2025,
  'Includes radiative forcing multiplier (RF=1.9). CO2 only without RF = 0.12953 kg/pkm.';

-- SHORT-HAUL – ECONOMY (with RF)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, haul_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Flight – Short-Haul – Economy – per passenger-km (with RF)',
  (SELECT id FROM public.dim_vehicle_types WHERE code='flight_shorthaul_eco'),
  (SELECT id FROM public.dim_haul_definitions WHERE code='short_haul'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.15300, 0.07490, 0.00015, 0.00335, 0.01260,
  'transport','AR5','Business travel- air','High',2025,
  'Includes radiative forcing multiplier (RF=1.9).';

-- SHORT-HAUL – BUSINESS (with RF)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, haul_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Flight – Short-Haul – Business – per passenger-km (with RF)',
  (SELECT id FROM public.dim_vehicle_types WHERE code='flight_shorthaul_bus'),
  (SELECT id FROM public.dim_haul_definitions WHERE code='short_haul'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.22950, 0.11235, 0.00023, 0.00503, 0.01890,
  'transport','AR5','Business travel- air','High',2025,
  'Seat-class emission allocation factor applied.';

-- LONG-HAUL – ECONOMY (with RF)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, haul_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Flight – Long-Haul – Economy – per passenger-km (with RF)',
  (SELECT id FROM public.dim_vehicle_types WHERE code='flight_longhaul_eco'),
  (SELECT id FROM public.dim_haul_definitions WHERE code='long_haul'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.14784, 0.07230, 0.00015, 0.00324, 0.01218,
  'transport','AR5','Business travel- air','High',2025,
  'Includes radiative forcing multiplier (RF=1.9).';

-- LONG-HAUL – BUSINESS (with RF)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, haul_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Flight – Long-Haul – Business – per passenger-km (with RF)',
  (SELECT id FROM public.dim_vehicle_types WHERE code='flight_longhaul_bus'),
  (SELECT id FROM public.dim_haul_definitions WHERE code='long_haul'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.42899, 0.20982, 0.00043, 0.00940, 0.03534,
  'transport','AR5','Business travel- air','High',2025,
  'Business class seat allocation factor ~ 2.9× economy.';

-- LONG-HAUL – FIRST CLASS (with RF)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, vehicle_type_id, haul_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o, kg_co2e_wtt,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='business_travel'),
  'Flight – Long-Haul – First Class – per passenger-km (with RF)',
  (SELECT id FROM public.dim_vehicle_types WHERE code='flight_longhaul_first'),
  (SELECT id FROM public.dim_haul_definitions WHERE code='long_haul'),
  (SELECT id FROM public.dim_units WHERE code='passenger_km'),
  0.59138, 0.28920, 0.00059, 0.01295, 0.04869,
  'transport','AR5','Business travel- air','High',2025,
  'First class seat allocation factor ~ 4.0× economy.';

-- ============================================================
-- SHEET: Waste disposal
-- Unit: tonne of waste
-- ============================================================

-- WASTE – MIXED – LANDFILL
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, waste_treatment_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='waste_operations'),
  'Waste – Municipal Solid Waste – Landfill – per tonne',
  (SELECT id FROM public.dim_waste_treatments WHERE code='landfill'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  467.00, 1.48, 464.78, 0.74,
  'waste','AR5','Waste disposal','High',2025,
  'MSW landfill including methane recovery correction. CH4 dominant.';

-- WASTE – MIXED – OPEN LOOP RECYCLING
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, waste_treatment_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='waste_operations'),
  'Waste – Mixed Recyclables – Open-Loop Recycling – per tonne',
  (SELECT id FROM public.dim_waste_treatments WHERE code='open_loop_recycling'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  21.31, 21.10, 0.18, 0.03,
  'waste','AR5','Waste disposal','High',2025;

-- WASTE – COMPOST
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, waste_treatment_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='waste_operations'),
  'Waste – Garden & Food Waste – Composting – per tonne',
  (SELECT id FROM public.dim_waste_treatments WHERE code='composting'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  115.81, 24.31, 66.56, 24.94,
  'waste','AR5','Waste disposal','High',2025;

-- WASTE – ANAEROBIC DIGESTION
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, waste_treatment_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='waste_operations'),
  'Waste – Food Waste – Anaerobic Digestion – per tonne',
  (SELECT id FROM public.dim_waste_treatments WHERE code='anaerobic_digestion'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  11.69, 8.96, 2.73, 0.00,
  'waste','AR5','Waste disposal','High',2025;

-- WASTE – COMBUSTION with Energy Recovery
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, waste_treatment_id, unit_id,
   kg_co2e, kg_co2, kg_ch4, kg_n2o,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='waste_operations'),
  'Waste – MSW – Combustion with Energy Recovery (EfW) – per tonne',
  (SELECT id FROM public.dim_waste_treatments WHERE code='combustion_ner'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  102.40, 101.09, 0.49, 0.82,
  'waste','AR5','Waste disposal','High',2025,
  'Includes net energy recovery credit per DEFRA methodology.';

-- WATER – SUPPLY (Scope 3)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='water'),
  'Water – Supply (mains) – per m³',
  (SELECT id FROM public.dim_units WHERE code='m3'),
  0.149,
  'other','AR5','Water','High',2025;

-- WATER – TREATMENT (Scope 3)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='water'),
  'Water – Treatment (sewage) – per m³',
  (SELECT id FROM public.dim_units WHERE code='m3'),
  0.272,
  'other','AR5','Water','High',2025;

-- ============================================================
-- SHEET: Hotels
-- ============================================================

-- HOTEL – UNKNOWN LOCATION (per room night)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='hotels'),
  'Hotel Stay – Location Unknown – per room night',
  (SELECT id FROM public.dim_units WHERE code='room_night'),
  35.39,
  'other','AR5','Hotels','Medium',2025,
  'Global average. Use country-specific factor where available.';

-- HOTEL – UK (per room night)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='hotels'),
  'Hotel Stay – UK – per room night',
  (SELECT id FROM public.dim_countries WHERE iso2='GB'),
  (SELECT id FROM public.dim_units WHERE code='room_night'),
  21.41,
  'other','AR5','Hotels','Medium',2025;

-- HOTEL – NORTH AMERICA (per room night)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='hotels'),
  'Hotel Stay – North America – per room night',
  (SELECT id FROM public.dim_countries WHERE iso2='US'),
  (SELECT id FROM public.dim_units WHERE code='room_night'),
  54.18,
  'other','AR5','Hotels','Medium',2025;

-- ============================================================
-- SHEET: Homeworking
-- ============================================================

-- HOMEWORKING – per hour
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='homeworking'),
  'Homeworking – per hour',
  (SELECT id FROM public.dim_units WHERE code='hour'),
  0.00135,
  'other','AR5','Homeworking','Medium',2025,
  'Covers heating, cooling, and electricity use while working from home.';

-- HOMEWORKING – per working day
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='homeworking'),
  'Homeworking – per working day (8 hrs)',
  (SELECT id FROM public.dim_units WHERE code='day'),
  0.01080,
  'other','AR5','Homeworking','Medium',2025,
  'Assumes 8-hour working day. Includes heating, cooling, and electricity.';

-- HOMEWORKING – per FTE year (full home working)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, unit_id,
   kg_co2e,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='homeworking'),
  'Homeworking – Full-Year FTE (232 working days)',
  (SELECT id FROM public.dim_units WHERE code='fte_year'),
  2.504,
  'other','AR5','Homeworking','Medium',2025,
  '232 working days × 0.01080 kg CO2e/day.';

-- ============================================================
-- SHEET: WtT – Fuels (Scope 3 Well-to-Tank factors)
-- ============================================================

-- WtT – DIESEL (per litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, is_wtt_factor,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='wtt_fuels'),
  'WtT – Diesel – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='diesel'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  0.60700, true,
  'wtt','AR5','WtT- fuels','High',2025;

-- WtT – PETROL (per litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, is_wtt_factor,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='wtt_fuels'),
  'WtT – Petrol – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='petrol'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  0.58600, true,
  'wtt','AR5','WtT- fuels','High',2025;

-- WtT – NATURAL GAS (per kWh gross CV)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, is_wtt_factor,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='wtt_fuels'),
  'WtT – Natural Gas – per kWh (Gross CV)',
  (SELECT id FROM public.dim_fuels WHERE code='natural_gas'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  0.02878, true,
  'wtt','AR5','WtT- fuels','High',2025;

-- WtT – LPG (per litre)
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, is_wtt_factor,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year)
SELECT 4,
  (SELECT id FROM public.dim_ghg_categories WHERE code='wtt_fuels'),
  'WtT – LPG – per litre',
  (SELECT id FROM public.dim_fuels WHERE code='lpg'),
  (SELECT id FROM public.dim_units WHERE code='litre'),
  0.16592, true,
  'wtt','AR5','WtT- fuels','High',2025;

-- ============================================================
-- SHEET: Outside of Scopes (biogenic CO2 from combustion)
-- ============================================================

-- BIOGENIC CO2 – NATURAL GAS (per kWh) — negligible but reported
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_biogenic_co2,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='bioenergy'),
  'Biogenic CO₂ – Wood Pellets – per tonne (OOS)',
  (SELECT id FROM public.dim_fuels WHERE code='biomass_wood_pellets'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  0.00, 1821.00,
  'other','AR5','Outside of scopes','High',2025,
  'Biogenic CO2 from wood pellet combustion — reported outside scopes per GHG Protocol guidance.';

-- BIOGENIC CO2 – WOOD CHIPS – per tonne
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, fuel_id, unit_id,
   kg_co2e, kg_biogenic_co2,
   emission_type, gwp_standard, source_sheet, data_quality, valid_year, notes)
SELECT 5,
  (SELECT id FROM public.dim_ghg_categories WHERE code='bioenergy'),
  'Biogenic CO₂ – Wood Chips – per tonne (OOS)',
  (SELECT id FROM public.dim_fuels WHERE code='biomass_wood_chips'),
  (SELECT id FROM public.dim_units WHERE code='tonne'),
  0.00, 1551.00,
  'other','AR5','Outside of scopes','High',2025,
  'Biogenic CO2 from wood chip combustion — outside scopes.';

-- ============================================================
-- UNIT CONVERSION DATA (extends existing unit_conversions table)
-- ============================================================
INSERT INTO public.unit_conversions (from_unit, to_unit, conversion_factor, category)
VALUES
  ('litre',       'GJ',      0.0000386,  'energy-fuel-diesel'),
  ('litre',       'kWh',     0.01391,    'energy-fuel-petrol'),
  ('m3',          'kWh',     11.184,     'energy-gas'),
  ('tonne',       'kg',      1000.0,     'mass'),
  ('short_ton',   'tonne',   0.90718,    'mass'),
  ('mile',        'km',      1.60934,    'distance'),
  ('passenger_km','km',      1.0,        'transport'),
  ('MWh',         'kWh',     1000.0,     'energy'),
  ('GJ',          'kWh',     277.778,    'energy')
ON CONFLICT (from_unit, to_unit) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERY (run after applying migration)
-- ============================================================
-- SELECT scope_code, category_label, COUNT(*) AS factors
-- FROM public.vw_emission_factors_full
-- GROUP BY scope_code, category_label
-- ORDER BY scope_code, category_label;
