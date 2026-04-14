-- Sample data for emission factor headers and values to populate the UI

-- 1. Insert some Emission Factor Headers
-- We use gen_random_uuid() to create records or predefined UUIDs if we want to reference them 
-- Let's use predefined UUIDs so we can reliably link them to values.

-- Header 1: Diesel (Fuel)
INSERT INTO public.emission_factor_headers (id, category, activity_type, region, source, source_version, valid_from, valid_to, is_locked)
VALUES ('11111111-1111-1111-1111-111111111111', 'Fuel', 'Diesel', 'GLOBAL', 'DEFRA', '2023', '2023-01-01', '2024-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- Header 2: Petrol (Fuel)
INSERT INTO public.emission_factor_headers (id, category, activity_type, region, source, source_version, valid_from, valid_to, is_locked)
VALUES ('22222222-2222-2222-2222-222222222222', 'Fuel', 'Petrol', 'GLOBAL', 'DEFRA', '2023', '2023-01-01', '2024-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- Header 3: Grid Electricity (Electricity)
INSERT INTO public.emission_factor_headers (id, category, activity_type, region, source, source_version, valid_from, valid_to, is_locked)
VALUES ('33333333-3333-3333-3333-333333333333', 'Electricity', 'Grid Electricity', 'US', 'IEA', '2022', '2022-01-01', '2025-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- Header 4: Commercial Waste (Waste)
INSERT INTO public.emission_factor_headers (id, category, activity_type, region, source, source_version, valid_from, valid_to, is_locked)
VALUES ('44444444-4444-4444-4444-444444444444', 'Waste', 'Commercial Waste (Landfill)', 'GLOBAL', 'DEFRA', '2023', '2023-01-01', '2024-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert corresponding Emission Factor Values

-- Values for Diesel
INSERT INTO public.emission_factor_values (id, factor_id, unit_input, unit_standard, emission_factor, emission_type, gwp_set, data_quality)
VALUES ('11111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'L', 'L', 2.68697, 'Direct/TTW', 'AR5', 'High')
ON CONFLICT (id) DO NOTHING;

-- Values for Petrol
INSERT INTO public.emission_factor_values (id, factor_id, unit_input, unit_standard, emission_factor, emission_type, gwp_set, data_quality)
VALUES ('22222222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'L', 'L', 2.31495, 'Direct/TTW', 'AR5', 'High')
ON CONFLICT (id) DO NOTHING;

-- Values for Grid Electricity
INSERT INTO public.emission_factor_values (id, factor_id, unit_input, unit_standard, emission_factor, emission_type, gwp_set, data_quality)
VALUES ('33333333-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'kWh', 'kWh', 0.385, 'Indirect/Electricity', 'AR5', 'High')
ON CONFLICT (id) DO NOTHING;

-- Values for Commercial Waste
INSERT INTO public.emission_factor_values (id, factor_id, unit_input, unit_standard, emission_factor, emission_type, gwp_set, data_quality)
VALUES ('44444444-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'kg', 'kg', 0.450, 'Lifecycle/LCA', 'AR5', 'Medium')
ON CONFLICT (id) DO NOTHING;
