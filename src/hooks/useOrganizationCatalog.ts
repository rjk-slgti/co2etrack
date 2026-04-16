import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { DEMO_ORGANIZATIONS, DEMO_REPORTING_PERIODS } from '@/lib/demo-data';

export function useOrganizationCatalog() {
  return useQuery({
    queryKey: ['organization-catalog'],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        return { organizations: DEMO_ORGANIZATIONS, reportingPeriods: DEMO_REPORTING_PERIODS };
      }

      try {
        const [{ data: organizations, error: organizationsError }, { data: reportingPeriods, error: periodsError }] =
          await Promise.all([
            supabase.from('organizations').select('*').order('name'),
            supabase.from('reporting_periods').select('*').order('start_date', { ascending: false }),
          ]);

        if (organizationsError) throw organizationsError;
        if (periodsError) throw periodsError;

        return {
          organizations: organizations && organizations.length > 0 ? organizations : DEMO_ORGANIZATIONS,
          reportingPeriods:
            reportingPeriods && reportingPeriods.length > 0 ? reportingPeriods : DEMO_REPORTING_PERIODS,
        };
      } catch {
        return { organizations: DEMO_ORGANIZATIONS, reportingPeriods: DEMO_REPORTING_PERIODS };
      }
    },
  });
}
