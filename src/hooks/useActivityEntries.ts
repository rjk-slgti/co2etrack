import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { MockDB } from '@/lib/mock-database';
import { useAuth } from './useAuth';

interface CreateEntryInput {
  organization_id: string;
  scope: string;
  scope_category?: string;
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
  converted_quantity?: number;
  converted_unit?: string;
  factor_id?: string;
  factor_value_id?: string;
  emission_kgco2e?: number;
  emission_co2?: number;
  emission_ch4?: number;
  emission_n2o?: number;
  location_based_emission?: number;
  market_based_emission?: number;
  data_quality?: string;
  is_assumed_factor?: boolean;
  notes?: string;
  reporting_period_id?: string;
  status?: string;
  validation_status?: string;
  approval_status?: string;
  source_channel?: string;
  source_document_ref?: string;
  confidence_score?: number;
  site_name?: string;
  supplier_name?: string;
  entry_date?: string;
}

interface WorkflowUpdate {
  id: string;
  organization_id?: string;
  status?: string;
  validation_status?: string;
  approval_status?: string;
  notes?: string;
  confidence_score?: number;
  reviewed_at?: string;
  approved_at?: string;
}

export function useActivityEntries(organizationId?: string) {
  return useQuery({
    queryKey: ['activity-entries', organizationId],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        const entries = MockDB.getEntries();
        return organizationId
          ? entries.filter((entry: any) => entry.organization_id === organizationId)
          : entries;
      }

      try {
        let query = supabase
          .from('activity_entries')
          .select('*, emission_factor_headers(*), activity_evidence(*)')
          .order('entry_date', { ascending: false });

        if (organizationId) {
          query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      } catch {
        const entries = MockDB.getEntries();
        return organizationId
          ? entries.filter((entry: any) => entry.organization_id === organizationId)
          : entries;
      }
    },
  });
}

export function useCreateActivityEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: CreateEntryInput) => {
      if (!user && hasSupabaseConfig) {
        throw new Error('Not authenticated');
      }

      if (!hasSupabaseConfig) {
        return MockDB.saveEntry({
          ...entry,
          user_id: user?.id ?? 'demo-user',
        });
      }

      try {
        const { data, error } = await supabase
          .from('activity_entries')
          .insert([
            {
              ...entry,
              user_id: user?.id,
              status: entry.status ?? 'draft',
              validation_status: entry.validation_status ?? 'pending',
              approval_status: entry.approval_status ?? 'pending',
              source_channel: entry.source_channel ?? 'manual',
            },
          ] as any)
          .select('*, emission_factor_headers(*), activity_evidence(*)')
          .single();

        if (error) throw error;

        return data;
      } catch {
        return MockDB.saveEntry({
          ...entry,
          user_id: user?.id ?? 'demo-user',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-entries'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useUpdateActivityEntryWorkflow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (update: WorkflowUpdate) => {
      if (!hasSupabaseConfig) {
        return MockDB.updateEntry(update.id, update as Record<string, unknown>);
      }

      try {
        const { data, error } = await supabase
          .from('activity_entries')
          .update({
            status: update.status,
            validation_status: update.validation_status,
            approval_status: update.approval_status,
            notes: update.notes,
            confidence_score: update.confidence_score,
            reviewed_at: update.reviewed_at,
            approved_at: update.approved_at,
          } as any)
          .eq('id', update.id)
          .select('*, emission_factor_headers(*), activity_evidence(*)')
          .single();

        if (error) throw error;

        return data;
      } catch {
        return MockDB.updateEntry(update.id, update as Record<string, unknown>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-entries'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        return MockDB.getAuditLogs();
      }

      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        return data ?? [];
      } catch {
        return MockDB.getAuditLogs();
      }
    },
  });
}
