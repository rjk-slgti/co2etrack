import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useActivityEntries(organizationId?: string) {
  return useQuery({
    queryKey: ['activity-entries', organizationId],
    queryFn: async () => {
      let query = supabase.from('activity_entries').select('*, emission_factor_headers(category, activity_type, source, source_version, region)');
      if (organizationId) query = query.eq('organization_id', organizationId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
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
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('activity_entries')
        .insert({ ...entry, user_id: user.id })
        .select()
        .single();
      if (error) throw error;

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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-entries'] });
    },
  });
}
