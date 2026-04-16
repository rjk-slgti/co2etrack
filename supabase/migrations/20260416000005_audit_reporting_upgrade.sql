-- =============================================================================
-- CO2eTrack: Carbon Auditing and Reporting Upgrade
-- Migration: 20260416000005_audit_reporting_upgrade.sql
-- Adds audit workflow, custom factors, compliance tracking, report jobs,
-- and richer activity entry metadata without breaking existing data.
-- =============================================================================

DO $$
BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'approver';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.audit_project_status AS ENUM (
    'planning',
    'data_collection',
    'validation',
    'verification',
    'approval',
    'reported',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.checklist_status AS ENUM ('todo', 'pass', 'warning', 'fail', 'na');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.finding_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_job_format AS ENUM ('pdf', 'excel', 'bundle');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS brand_primary TEXT NOT NULL DEFAULT '#0f5f4b',
  ADD COLUMN IF NOT EXISTS brand_secondary TEXT NOT NULL DEFAULT '#146c94',
  ADD COLUMN IF NOT EXISTS reporting_standard TEXT NOT NULL DEFAULT 'GHG Protocol Corporate',
  ADD COLUMN IF NOT EXISTS default_language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

CREATE TABLE IF NOT EXISTS public.audit_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporting_period_id UUID REFERENCES public.reporting_periods(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status public.audit_project_status NOT NULL DEFAULT 'data_collection',
  boundary_approach TEXT NOT NULL DEFAULT 'operational_control',
  standards TEXT[] NOT NULL DEFAULT ARRAY['GHG Protocol Corporate', 'ISO 14064-1'],
  auditor_id UUID REFERENCES auth.users(id),
  approver_id UUID REFERENCES auth.users(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_close_date DATE,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('Scope 1', 'Scope 2', 'Scope 3')),
  category TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  emission_factor NUMERIC(18,8) NOT NULL CHECK (emission_factor >= 0),
  source TEXT NOT NULL DEFAULT 'Organization Specific',
  source_reference TEXT,
  gwp_set TEXT NOT NULL DEFAULT 'AR6' CHECK (gwp_set IN ('AR4', 'AR5', 'AR6')),
  data_quality TEXT NOT NULL DEFAULT 'Medium' CHECK (data_quality IN ('High', 'Medium', 'Low')),
  approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_project_id UUID NOT NULL REFERENCES public.audit_projects(id) ON DELETE CASCADE,
  standard_code TEXT NOT NULL,
  item_code TEXT NOT NULL,
  requirement TEXT NOT NULL,
  guidance TEXT,
  status public.checklist_status NOT NULL DEFAULT 'todo',
  owner_id UUID REFERENCES auth.users(id),
  evidence_activity_entry_id UUID REFERENCES public.activity_entries(id) ON DELETE SET NULL,
  due_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (audit_project_id, item_code)
);

CREATE TABLE IF NOT EXISTS public.audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_project_id UUID NOT NULL REFERENCES public.audit_projects(id) ON DELETE CASCADE,
  activity_entry_id UUID REFERENCES public.activity_entries(id) ON DELETE SET NULL,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('anomaly', 'data_gap', 'control', 'recommendation')),
  priority public.finding_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  confidence_score NUMERIC(5,2),
  created_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_project_id UUID REFERENCES public.audit_projects(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id),
  format public.report_job_format NOT NULL,
  template_name TEXT NOT NULL DEFAULT 'standard-carbon-audit-report',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  file_path TEXT,
  report_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.factor_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  rows_processed INTEGER NOT NULL DEFAULT 0,
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  rows_updated INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.activity_entries
  ADD COLUMN IF NOT EXISTS audit_project_id UUID REFERENCES public.audit_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_document_ref TEXT,
  ADD COLUMN IF NOT EXISTS source_channel TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'under_review', 'validated', 'rejected')),
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'not_required' CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ADD COLUMN IF NOT EXISTS site_name TEXT,
  ADD COLUMN IF NOT EXISTS supplier_name TEXT,
  ADD COLUMN IF NOT EXISTS activity_month DATE;

ALTER TABLE public.audit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factor_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_projects_org_status ON public.audit_projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_custom_emission_factors_org_category ON public.custom_emission_factors(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_checklist_project_status ON public.compliance_checklist_items(audit_project_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_findings_project_status ON public.audit_findings(audit_project_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_report_jobs_org_status ON public.report_jobs(organization_id, status, format);
CREATE INDEX IF NOT EXISTS idx_factor_sync_runs_status ON public.factor_sync_runs(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entries_audit_project ON public.activity_entries(audit_project_id);
CREATE INDEX IF NOT EXISTS idx_activity_entries_validation_status ON public.activity_entries(validation_status, approval_status, status);
CREATE INDEX IF NOT EXISTS idx_activity_entries_activity_month ON public.activity_entries(activity_month);

CREATE OR REPLACE FUNCTION public.can_manage_audit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'auditor')
    OR public.has_role(_user_id, 'approver');
$$;

CREATE OR REPLACE FUNCTION public.log_activity_entry_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gwp_set TEXT;
BEGIN
  SELECT efv.gwp_set
  INTO v_gwp_set
  FROM public.emission_factor_values efv
  WHERE efv.id = NEW.factor_value_id;

  INSERT INTO public.audit_logs (
    organization_id,
    activity_entry_id,
    user_id,
    action,
    factor_id,
    factor_source,
    factor_version,
    gwp_set,
    details
  )
  VALUES (
    NEW.organization_id,
    NEW.id,
    COALESCE(auth.uid(), NEW.user_id),
    CASE WHEN TG_OP = 'INSERT' THEN 'activity_entry_created' ELSE 'activity_entry_updated' END,
    NEW.factor_id,
    NEW.source_channel,
    NULL,
    COALESCE(v_gwp_set, 'AR6'),
    jsonb_build_object(
      'status', NEW.status,
      'validation_status', NEW.validation_status,
      'approval_status', NEW.approval_status,
      'confidence_score', NEW.confidence_score,
      'quantity', NEW.quantity,
      'unit', NEW.unit,
      'emission_kgco2e', NEW.emission_kgco2e
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_activity_entry_change ON public.activity_entries;

CREATE TRIGGER trg_log_activity_entry_change
  AFTER INSERT OR UPDATE ON public.activity_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity_entry_change();

CREATE OR REPLACE VIEW public.vw_audit_project_summary AS
SELECT
  ap.id,
  ap.organization_id,
  ap.reporting_period_id,
  ap.name,
  ap.status,
  ap.boundary_approach,
  COUNT(ae.id) AS entry_count,
  COUNT(ae.id) FILTER (WHERE ae.status = 'verified') AS verified_entry_count,
  COUNT(ae.id) FILTER (WHERE ae.status = 'pending_audit') AS pending_entry_count,
  COALESCE(SUM(ae.emission_kgco2e), 0) AS total_emission_kgco2e,
  COUNT(af.id) FILTER (WHERE af.status = 'open') AS open_finding_count,
  ap.created_at,
  ap.updated_at
FROM public.audit_projects ap
LEFT JOIN public.activity_entries ae ON ae.audit_project_id = ap.id
LEFT JOIN public.audit_findings af ON af.audit_project_id = ap.id
GROUP BY ap.id;

CREATE OR REPLACE FUNCTION public.detect_activity_entry_anomaly(p_entry_id UUID)
RETURNS TABLE (
  baseline_quantity NUMERIC,
  variance_percent NUMERIC,
  severity TEXT,
  message TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH target_entry AS (
    SELECT *
    FROM public.activity_entries
    WHERE id = p_entry_id
  ),
  baseline AS (
    SELECT AVG(ae.quantity)::NUMERIC AS avg_quantity
    FROM public.activity_entries ae
    JOIN target_entry te
      ON ae.organization_id = te.organization_id
     AND ae.category = te.category
     AND ae.activity_type = te.activity_type
     AND ae.id <> te.id
  )
  SELECT
    COALESCE(b.avg_quantity, 0) AS baseline_quantity,
    CASE
      WHEN COALESCE(b.avg_quantity, 0) = 0 THEN 0
      ELSE ROUND(((te.quantity - b.avg_quantity) / b.avg_quantity) * 100, 2)
    END AS variance_percent,
    CASE
      WHEN COALESCE(b.avg_quantity, 0) = 0 THEN 'low'
      WHEN ABS(((te.quantity - b.avg_quantity) / b.avg_quantity) * 100) >= 35 THEN 'high'
      WHEN ABS(((te.quantity - b.avg_quantity) / b.avg_quantity) * 100) >= 20 THEN 'medium'
      ELSE 'low'
    END AS severity,
    CASE
      WHEN COALESCE(b.avg_quantity, 0) = 0 THEN 'No historical baseline is available yet.'
      ELSE 'Compare this record against recent activity before approval.'
    END AS message
  FROM target_entry te
  CROSS JOIN baseline b;
$$;

DROP POLICY IF EXISTS "Authenticated users can read audit projects" ON public.audit_projects;
CREATE POLICY "Authenticated users can read audit projects"
  ON public.audit_projects FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Audit managers can manage audit projects" ON public.audit_projects;
CREATE POLICY "Audit managers can manage audit projects"
  ON public.audit_projects FOR ALL TO authenticated
  USING (public.can_manage_audit(auth.uid()))
  WITH CHECK (public.can_manage_audit(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read custom factors" ON public.custom_emission_factors;
CREATE POLICY "Authenticated users can read custom factors"
  ON public.custom_emission_factors FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Data teams can create custom factors" ON public.custom_emission_factors;
CREATE POLICY "Data teams can create custom factors"
  ON public.custom_emission_factors FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'auditor')
    OR public.has_role(auth.uid(), 'data_entry')
  );

DROP POLICY IF EXISTS "Audit managers can update custom factors" ON public.custom_emission_factors;
CREATE POLICY "Audit managers can update custom factors"
  ON public.custom_emission_factors FOR UPDATE TO authenticated
  USING (public.can_manage_audit(auth.uid()))
  WITH CHECK (public.can_manage_audit(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read checklist items" ON public.compliance_checklist_items;
CREATE POLICY "Authenticated users can read checklist items"
  ON public.compliance_checklist_items FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Audit managers can manage checklist items" ON public.compliance_checklist_items;
CREATE POLICY "Audit managers can manage checklist items"
  ON public.compliance_checklist_items FOR ALL TO authenticated
  USING (public.can_manage_audit(auth.uid()))
  WITH CHECK (public.can_manage_audit(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read audit findings" ON public.audit_findings;
CREATE POLICY "Authenticated users can read audit findings"
  ON public.audit_findings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Audit managers can manage audit findings" ON public.audit_findings;
CREATE POLICY "Audit managers can manage audit findings"
  ON public.audit_findings FOR ALL TO authenticated
  USING (public.can_manage_audit(auth.uid()))
  WITH CHECK (public.can_manage_audit(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read report jobs" ON public.report_jobs;
CREATE POLICY "Authenticated users can read report jobs"
  ON public.report_jobs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Audit managers can manage report jobs" ON public.report_jobs;
CREATE POLICY "Audit managers can manage report jobs"
  ON public.report_jobs FOR ALL TO authenticated
  USING (public.can_manage_audit(auth.uid()))
  WITH CHECK (public.can_manage_audit(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read factor sync runs" ON public.factor_sync_runs;
CREATE POLICY "Authenticated users can read factor sync runs"
  ON public.factor_sync_runs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage factor sync runs" ON public.factor_sync_runs;
CREATE POLICY "Admins can manage factor sync runs"
  ON public.factor_sync_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_audit_projects_updated_at ON public.audit_projects;
CREATE TRIGGER update_audit_projects_updated_at
  BEFORE UPDATE ON public.audit_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_emission_factors_updated_at ON public.custom_emission_factors;
CREATE TRIGGER update_custom_emission_factors_updated_at
  BEFORE UPDATE ON public.custom_emission_factors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_checklist_items_updated_at ON public.compliance_checklist_items;
CREATE TRIGGER update_compliance_checklist_items_updated_at
  BEFORE UPDATE ON public.compliance_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_audit_findings_updated_at ON public.audit_findings;
CREATE TRIGGER update_audit_findings_updated_at
  BEFORE UPDATE ON public.audit_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
