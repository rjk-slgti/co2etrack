-- Create entry_status enum
CREATE TYPE public.entry_status AS ENUM ('draft', 'pending_audit', 'verified', 'rejected');

-- Add status column to activity_entries
ALTER TABLE public.activity_entries ADD COLUMN status public.entry_status NOT NULL DEFAULT 'draft';

-- Create activity_evidence table
CREATE TABLE public.activity_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_entry_id UUID NOT NULL REFERENCES public.activity_entries(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_evidence ENABLE ROW LEVEL SECURITY;

-- Activity Evidence RLS
CREATE POLICY "Users can insert evidence for their own entries"
  ON public.activity_evidence FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activity_entries
      WHERE id = activity_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read evidence for their org entries"
  ON public.activity_evidence FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.activity_entries
      WHERE id = activity_entry_id AND (
        user_id = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'auditor')
      )
    )
  );

-- Update RLS for activity_entries to enforce locking
-- Drop the existing user update policy
DROP POLICY IF EXISTS "Users can update own entries" ON public.activity_entries;

-- Re-create it with locking logic (can only update if draft or rejected)
CREATE POLICY "Users can update own entries in draft or rejected state"
  ON public.activity_entries FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() AND 
    status IN ('draft', 'rejected')
  );

-- Allow auditors and admins to update the status of entries
CREATE POLICY "Auditors can verify or reject entries"
  ON public.activity_entries FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'auditor') AND
    status = 'pending_audit'
  );

-- Create Storage bucket for evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS (Users can upload, read their own, and auditors can read)
CREATE POLICY "Users can upload evidence" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence');
CREATE POLICY "Users and auditors can read evidence" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'evidence');
