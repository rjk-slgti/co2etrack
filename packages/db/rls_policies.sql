-- CCUS Platform: Supabase Row-Level Security (RLS) Policies
-- Standard: ISO 27001 Multi-tenant Isolation

-- 1. Profiles linkage (auth.users -> organizations)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    full_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Organization Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 3. Chemical Markers (Reference Data)
ALTER TABLE chemical_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view markers"
ON chemical_markers FOR SELECT
TO authenticated
USING (true);

-- 4. Capture Batches (The Core Asset)
ALTER TABLE capture_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emitters can manage their own batches"
ON capture_batches FOR ALL
TO authenticated
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 5. Sensor Logs (IoT Data)
-- TimescaleDB hypertables also support RLS
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their organization's batches"
ON sensor_logs FOR SELECT
TO authenticated
USING (batch_id IN (
    SELECT id FROM capture_batches 
    WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
));

-- 6. MRV Certificates (Public Proof)
ALTER TABLE mrv_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificates are visible to everyone (Public Proof)"
ON mrv_certificates FOR SELECT
USING (status = 'Issued');

CREATE POLICY "Verifiers can manage certificates"
ON mrv_certificates FOR ALL
TO authenticated
USING (verifier_org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
