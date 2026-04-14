import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MockDB } from '@/lib/mock-database';
import { useAuth } from './useAuth';

export function useActivityEntries(organizationId?: string, status?: 'draft' | 'pending_audit' | 'verified' | 'rejected') {
  return useQuery({
    queryKey: ['activity-entries', organizationId, status],
      try {
        let query = supabase.from('activity_entries').select('*, emission_factor_headers(category, activity_type, source, source_version, region), activity_evidence(*)');
        if (organizationId) query = query.eq('organization_id', organizationId);
        if (status) query = query.eq('status', status);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (e) {
        console.log("Fallback to MockDB GET");
        const entries = MockDB.getEntries();
        let filtered = entries;
        if (organizationId) filtered = filtered.filter((e: any) => e.organization_id === organizationId);
        if (status) filtered = filtered.filter((e: any) => e.status === status);
        return filtered;
      }
    },
  });
}

export function useCreateActivityEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: {
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
      status?: 'draft' | 'pending_audit';
    }) => {
      if (!user) throw new Error('Not authenticated');
      let data;
      try {
        const { data: dbData, error } = await supabase
          .from('activity_entries')
          .insert({ ...entry, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        data = dbData;

        // Audit log
        await supabase.from('audit_logs').insert({
          organization_id: entry.organization_id,
          activity_entry_id: data.id,
          user_id: user.id,
          action: 'create_entry',
          factor_id: entry.factor_id,
          factor_source: undefined,
          details: { scope: entry.scope, category: entry.category, quantity: entry.quantity, unit: entry.unit },
        });
      } catch (e) {
        console.log("Fallback to MockDB SAVE");
        data = MockDB.saveEntry({ ...entry, user_id: user.id });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-entries'] });
    },
  });
}

export function useUpdateEntryStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ entryId, status, orgId }: { entryId: string, status: 'draft' | 'pending_audit' | 'verified' | 'rejected', orgId: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      let data;
      try {
        const { data: dbData, error } = await supabase
          .from('activity_entries')
          .update({ status })
          .eq('id', entryId)
          .select()
          .single();
          
        if (error) throw error;
        data = dbData;

        await supabase.from('audit_logs').insert({
          organization_id: orgId,
          activity_entry_id: entryId,
          user_id: user.id,
          action: `status_changed_to_${status}`,
          details: { new_status: status },
        });
      } catch (e) {
        console.log("Fallback to MockDB UPDATE");
        data = MockDB.updateStatus(entryId, status);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-entries'] });
    },
  });
}
