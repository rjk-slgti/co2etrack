-- =============================================================================
-- CO2eTrack: Reporting History & Job Tracking
-- Migration: 20260416000007_report_history.sql
-- Tracks generated reports, assurance packs, and their settings.
-- =============================================================================

-- Table for tracking generated reports
CREATE TABLE IF NOT EXISTS public.report_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.audit_projects(id) ON DELETE SET NULL,
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    template_name TEXT DEFAULT 'Standard GHG Inventory',
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    report_options JSONB DEFAULT '{}'::jsonb,
    storage_path TEXT, -- URL to the file in Supabase Storage if persisted
    
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.report_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's report history"
ON public.report_jobs FOR SELECT
USING (
    organization_id IN (
        SELECT id FROM public.organizations 
        WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can create report jobs for their organization"
ON public.report_jobs FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT id FROM public.organizations 
        WHERE owner_id = auth.uid()
    )
);

-- Indexing
CREATE INDEX idx_report_jobs_org ON public.report_jobs(organization_id);
CREATE INDEX idx_report_jobs_created ON public.report_jobs(created_at DESC);
