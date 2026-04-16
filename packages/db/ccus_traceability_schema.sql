-- CO2etrack CCUS Rebuild: Physical-Digital Traceability Schema
-- Standard: ISO 14064-2/Verra VCS/EU ETS

CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- Organizations & RBAC
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Emitter', 'Transporter', 'Verifier', 'Regulator', 'Buyer')),
    hq_location TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chemical Markers Registry
CREATE TABLE IF NOT EXISTS chemical_markers (
    id TEXT PRIMARY KEY, -- Marker Code (e.g., ALPHA-01)
    compound_name TEXT NOT NULL,
    detection_threshold_ppm NUMERIC NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- CO2 Batches (Capture Events)
CREATE TABLE IF NOT EXISTS capture_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    mass_tonnes NUMERIC NOT NULL,
    purity_pct NUMERIC NOT NULL,
    uncertainty_pct NUMERIC NOT NULL,
    marker_id TEXT REFERENCES chemical_markers(id),
    marker_concentration_ppm NUMERIC,
    capture_timestamp TIMESTAMPTZ DEFAULT now(),
    location_gps TEXT,
    status TEXT DEFAULT 'Captured'
);

-- Custody Transitions (Traceability Chain)
CREATE TABLE IF NOT EXISTS custody_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES capture_batches(id),
    from_org_id UUID REFERENCES organizations(id),
    to_org_id UUID REFERENCES organizations(id),
    transition_type TEXT NOT NULL, -- e.g., 'Truck-to-Barge'
    re_detected_marker_ppm NUMERIC,
    transition_timestamp TIMESTAMPTZ DEFAULT now(),
    gps_verification TEXT,
    digital_signature TEXT
);

-- Timeseries Data (IoT Dashboard)
CREATE TABLE IF NOT EXISTS sensor_logs (
    timestamp TIMESTAMPTZ NOT NULL,
    sensor_id TEXT NOT NULL,
    batch_id UUID REFERENCES capture_batches(id),
    flow_rate_m3h NUMERIC,
    pressure_bar NUMERIC,
    temp_c NUMERIC,
    purity_pct NUMERIC
);
SELECT create_hypertable('sensor_logs', 'timestamp', if_not_exists => TRUE);

-- ANOMALY FLAGS (Fraud & Error Detection)
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES capture_batches(id),
    type TEXT NOT NULL, -- mass_imbalance, purity_drop, marker_mismatch
    severity TEXT NOT NULL, -- warning, critical
    description TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- MRV CERTIFICATES (The Final Asset)
CREATE TABLE IF NOT EXISTS mrv_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES capture_batches(id) UNIQUE,
    verifier_org_id UUID REFERENCES organizations(id),
    issuance_date TIMESTAMPTZ DEFAULT NOW(),
    net_tonnes_certified NUMERIC NOT NULL,
    uncertainty_p95 NUMERIC NOT NULL,
    assurance_grade TEXT, -- AAA, AA, A
    registry_hash TEXT UNIQUE, -- sha256 of the provenance chain
    status TEXT DEFAULT 'Draft'
);