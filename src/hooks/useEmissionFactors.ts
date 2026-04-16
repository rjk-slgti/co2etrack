import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { MOCK_HEADERS, MOCK_VALUES, MockDB } from '@/lib/mock-database';

function withHeaders(values: any[]) {
  return values.map((value) => ({
    ...value,
    emission_factor_headers: MOCK_HEADERS.find((header) => header.id === value.factor_id),
  }));
}

export function useEmissionFactorHeaders(category?: string) {
  return useQuery({
    queryKey: ['emission-factor-headers', category],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        return category ? MOCK_HEADERS.filter((header) => header.category === category) : MOCK_HEADERS;
      }

      try {
        let query = supabase.from('emission_factor_headers').select('*').order('category').order('activity_type');
        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) {
          return category ? MOCK_HEADERS.filter((header) => header.category === category) : MOCK_HEADERS;
        }

        return data;
      } catch {
        return category ? MOCK_HEADERS.filter((header) => header.category === category) : MOCK_HEADERS;
      }
    },
  });
}

export function useEmissionFactorValues(factorId?: string) {
  return useQuery({
    queryKey: ['emission-factor-values', factorId],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        const values = factorId ? MOCK_VALUES.filter((value) => value.factor_id === factorId) : MOCK_VALUES;
        return withHeaders(values);
      }

      try {
        let query = supabase.from('emission_factor_values').select('*, emission_factor_headers(*)');
        if (factorId) {
          query = query.eq('factor_id', factorId);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) {
          const values = factorId ? MOCK_VALUES.filter((value) => value.factor_id === factorId) : MOCK_VALUES;
          return withHeaders(values);
        }

        return data;
      } catch {
        const values = factorId ? MOCK_VALUES.filter((value) => value.factor_id === factorId) : MOCK_VALUES;
        return withHeaders(values);
      }
    },
    enabled: factorId !== '',
  });
}

export function useFactorsForActivity(category: string, activityType: string) {
  return useQuery({
    queryKey: ['factors-for-activity', category, activityType],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        const headerIds = MOCK_HEADERS.filter(
          (header) => header.category === category && header.activity_type === activityType
        ).map((header) => header.id);
        return withHeaders(MOCK_VALUES.filter((value) => headerIds.includes(value.factor_id)));
      }

      try {
        const { data, error } = await supabase
          .from('emission_factor_values')
          .select('*, emission_factor_headers!inner(*)')
          .eq('emission_factor_headers.category', category)
          .eq('emission_factor_headers.activity_type', activityType);

        if (error) throw error;
        if (data && data.length > 0) return data;

        const headerIds = MOCK_HEADERS.filter(
          (header) => header.category === category && header.activity_type === activityType
        ).map((header) => header.id);
        return withHeaders(MOCK_VALUES.filter((value) => headerIds.includes(value.factor_id)));
      } catch {
        const headerIds = MOCK_HEADERS.filter(
          (header) => header.category === category && header.activity_type === activityType
        ).map((header) => header.id);
        return withHeaders(MOCK_VALUES.filter((value) => headerIds.includes(value.factor_id)));
      }
    },
    enabled: Boolean(category && activityType),
  });
}

export function useFactorLibrarySnapshot() {
  return useQuery({
    queryKey: ['factor-library-snapshot'],
    queryFn: async () => {
      const customFactors = MockDB.getCustomFactors();
      return {
        officialCount: MOCK_HEADERS.length,
        customCount: customFactors.length,
        sources: [...new Set([...MOCK_HEADERS.map((header) => header.source), ...customFactors.map((factor: any) => factor.source)])],
      };
    },
  });
}
