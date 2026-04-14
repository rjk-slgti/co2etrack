import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEmissionFactorHeaders(category?: string) {
  return useQuery({
    queryKey: ['emission-factor-headers', category],
    queryFn: async () => {
      let query = supabase.from('emission_factor_headers').select('*');
      if (category) query = query.eq('category', category);
      const { data, error } = await query.order('category').order('activity_type');
      if (error) throw error;
      return data;
    },
  });
}

export function useEmissionFactorValues(factorId?: string) {
  return useQuery({
    queryKey: ['emission-factor-values', factorId],
    queryFn: async () => {
      let query = supabase.from('emission_factor_values').select('*, emission_factor_headers(*)');
      if (factorId) query = query.eq('factor_id', factorId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!factorId || factorId === undefined,
  });
}

export function useFactorsForActivity(category: string, activityType: string) {
  return useQuery({
    queryKey: ['factors-for-activity', category, activityType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emission_factor_values')
        .select('*, emission_factor_headers!inner(*)')
        .eq('emission_factor_headers.category', category)
        .eq('emission_factor_headers.activity_type', activityType);
      if (error) throw error;
      return data;
    },
    enabled: !!category && !!activityType,
  });
}
