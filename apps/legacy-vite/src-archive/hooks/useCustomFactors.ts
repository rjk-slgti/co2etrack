import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { MockDB } from '@/lib/mock-database';
import { useAuth } from './useAuth';

interface CustomFactorInput {
  organization_id: string;
  scope: string;
  category: string;
  activity_type: string;
  unit: string;
  emission_factor: number;
  source: string;
  source_reference?: string;
  gwp_set: string;
  data_quality: string;
  notes?: string;
}

export function useCustomFactors(organizationId?: string) {
  return useQuery({
    queryKey: ['custom-factors', organizationId],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        const factors = MockDB.getCustomFactors();
        return organizationId
          ? factors.filter((factor: any) => factor.organization_id === organizationId)
          : factors;
      }

      try {
        let query = supabase.from('custom_emission_factors' as any).select('*').order('created_at', {
          ascending: false,
        });

        if (organizationId) {
          query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      } catch {
        const factors = MockDB.getCustomFactors();
        return organizationId
          ? factors.filter((factor: any) => factor.organization_id === organizationId)
          : factors;
      }
    },
  });
}

export function useCreateCustomFactor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (factor: CustomFactorInput) => {
      if (!user && hasSupabaseConfig) {
        throw new Error('Not authenticated');
      }

      if (!hasSupabaseConfig) {
        return MockDB.saveCustomFactor(factor);
      }

      try {
        const { data, error } = await supabase
          .from('custom_emission_factors' as any)
          .insert({
            ...factor,
            created_by: user?.id,
            approval_status: 'approved',
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from('audit_logs').insert({
          organization_id: factor.organization_id,
          user_id: user?.id,
          action: 'custom_factor_created',
          details: {
            activity_type: factor.activity_type,
            category: factor.category,
            emission_factor: factor.emission_factor,
            unit: factor.unit,
          },
        });

        return data;
      } catch {
        return MockDB.saveCustomFactor(factor);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-factors'] });
    },
  });
}
