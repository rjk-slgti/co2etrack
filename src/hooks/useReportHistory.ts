import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { useWorkspaceSettings } from './useWorkspaceSettings';

export interface ReportJobRecord {
  id: string;
  organization_id: string;
  template_name: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  report_options: any;
  storage_path?: string;
  created_at: string;
  completed_at?: string;
}

export function useReportHistory() {
  const { settings } = useWorkspaceSettings();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['report-history', settings.selectedOrganizationId],
    queryFn: async () => {
      if (!hasSupabaseConfig) return [] as ReportJobRecord[];
      
      const { data, error } = await supabase
        .from('report_jobs' as any)
        .select('*')
        .eq('organization_id', settings.selectedOrganizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReportJobRecord[];
    },
    enabled: !!settings.selectedOrganizationId,
  });

  const createJob = useMutation({
    mutationFn: async (job: Partial<ReportJobRecord>) => {
      if (!hasSupabaseConfig) return;
      
      const { data, error } = await supabase
        .from('report_jobs' as any)
        .insert([{ ...job, organization_id: settings.selectedOrganizationId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-history'] });
    },
  });

  return {
    jobs: query.data ?? [],
    isLoading: query.isLoading,
    createJob,
  };
}
