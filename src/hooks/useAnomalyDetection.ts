import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';

export interface AnomalyResult {
  baseline_quantity: number;
  variance_percent: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export function useAnomalyDetection(entryId: string | null) {
  return useQuery({
    queryKey: ['anomaly-detection', entryId],
    queryFn: async (): Promise<AnomalyResult | null> => {
      if (!hasSupabaseConfig || !entryId) return null;

      try {
        const { data, error } = await supabase.rpc('detect_activity_entry_anomaly' as any, {
          p_entry_id: entryId,
        });

        if (error) {
          console.error('Anomaly detection error:', error);
          return null;
        }

        if (Array.isArray(data) && data.length > 0) {
          return data[0] as AnomalyResult;
        }
      } catch {
        return null;
      }

      return null;
    },
    enabled: !!entryId,
  });
}
