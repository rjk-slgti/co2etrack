import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'auditor' | 'data_entry' | 'viewer';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<AppRole> => {
      if (!user) return 'viewer';
      if (!hasSupabaseConfig) return 'admin'; // Demo mode

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        return (data?.role as AppRole) ?? 'viewer';
      } catch (err) {
        console.error('Error fetching user role:', err);
        return 'viewer';
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
