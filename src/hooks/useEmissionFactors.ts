import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_HEADERS, MOCK_VALUES } from '@/lib/mock-database';

export function useEmissionFactorHeaders(category?: string) {
  return useQuery({
    queryKey: ['emission-factor-headers', category],
    queryFn: async () => {
      try {
        let query = supabase.from('emission_factor_headers').select('*');
        if (category) query = query.eq('category', category);
        const { data, error } = await query.order('category').order('activity_type');
        
        if (error || !data || data.length === 0) {
          console.log("Fallback to Mock Headers");
          return category ? MOCK_HEADERS.filter(h => h.category === category) : MOCK_HEADERS;
        }
        
        return data;
      } catch (e) {
        return category ? MOCK_HEADERS.filter(h => h.category === category) : MOCK_HEADERS;
      }
    },
  });
}

export function useEmissionFactorValues(factorId?: string) {
  return useQuery({
    queryKey: ['emission-factor-values', factorId],
    queryFn: async () => {
      try {
        let query = supabase.from('emission_factor_values').select('*, emission_factor_headers(*)');
        if (factorId) query = query.eq('factor_id', factorId);
        const { data, error } = await query;
        
        if (error || !data || data.length === 0) {
          const mocked = factorId ? MOCK_VALUES.filter(v => v.factor_id === factorId) : MOCK_VALUES;
          return mocked.map(v => ({ ...v, emission_factor_headers: MOCK_HEADERS.find(h => h.id === v.factor_id) }));
        }
        
        return data;
      } catch (e) {
        const mocked = factorId ? MOCK_VALUES.filter(v => v.factor_id === factorId) : MOCK_VALUES;
        return mocked.map(v => ({ ...v, emission_factor_headers: MOCK_HEADERS.find(h => h.id === v.factor_id) }));
      }
    },
    enabled: !!factorId || factorId === undefined,
  });
}

export function useFactorsForActivity(category: string, activityType: string) {
  return useQuery({
    queryKey: ['factors-for-activity', category, activityType],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('emission_factor_values')
          .select('*, emission_factor_headers!inner(*)')
          .eq('emission_factor_headers.category', category)
          .eq('emission_factor_headers.activity_type', activityType);
          
        if (error || !data || data.length === 0) {
          const headerIds = MOCK_HEADERS.filter(h => h.category === category && h.activity_type === activityType).map(h => h.id);
          const mocked = MOCK_VALUES.filter(v => headerIds.includes(v.factor_id));
          return mocked.map(v => ({ ...v, emission_factor_headers: MOCK_HEADERS.find(h => h.id === v.factor_id) }));
        }
        return data;
      } catch (e) {
        const headerIds = MOCK_HEADERS.filter(h => h.category === category && h.activity_type === activityType).map(h => h.id);
        const mocked = MOCK_VALUES.filter(v => headerIds.includes(v.factor_id));
        return mocked.map(v => ({ ...v, emission_factor_headers: MOCK_HEADERS.find(h => h.id === v.factor_id) }));
      }
    },
    enabled: !!category && !!activityType,
  });
}
