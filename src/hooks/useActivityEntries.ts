import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MockDB } from '@/lib/mock-database';
import { useAuth } from './useAuth';

export function useActivityEntries(organizationId?: string) {
  return useQuery({
    queryKey: ['activity-entries', organizationId],
    queryFn: async () => {
      try {
        let query = supabase.from('activity_entries').select('*');
        if (organizationId) query = query.eq('organization_id', organizationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (e) {
        console.log("Fallback to MockDB GET");
        const entries = MockDB.getEntries();
        let filtered = entries;
        if (organizationId) filtered = filtered.filter((e: any) => e.organization_id === organizationId);
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
    }) => {
      if (!user) throw new Error('Not authenticated');
      let data;
      try {
        const { data: dbData, error } = await supabase
          .from('activity_entries')
          .insert([{
            activity_type: entry.activity_type,
            category: entry.category,
            converted_quantity: entry.converted_quantity,
            converted_unit: entry.converted_unit,
            data_quality: entry.data_quality,
            emission_ch4: entry.emission_ch4,
            emission_co2: entry.emission_co2,
            emission_kgco2e: entry.emission_kgco2e,
            emission_n2o: entry.emission_n2o,
            factor_id: entry.factor_id,
            factor_value_id: entry.factor_value_id,
            is_assumed_factor: entry.is_assumed_factor,
            location_based_emission: entry.location_based_emission,
            market_based_emission: entry.market_based_emission,
            notes: entry.notes,
            organization_id: entry.organization_id,
            quantity: entry.quantity,
            reporting_period_id: entry.reporting_period_id,
            scope: entry.scope,
            scope_category: entry.scope_category,
            unit: entry.unit,
            user_id: user.id,
          }])
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
