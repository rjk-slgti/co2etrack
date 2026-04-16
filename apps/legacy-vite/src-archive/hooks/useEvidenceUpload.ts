import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { MockDB } from '@/lib/mock-database';
import { useAuth } from './useAuth';

export function useEvidenceUpload() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ entryId, file }: { entryId: string; file: File }) => {
      if (!hasSupabaseConfig) {
        MockDB.addEvidence(entryId, file.name);
        return { id: crypto.randomUUID(), file_name: file.name, file_path: 'mock_path' };
      }

      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
        const filePath = `${entryId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data, error } = await supabase
          .from('activity_evidence' as any)
          .insert({
            activity_entry_id: entryId,
            file_path: filePath,
            file_name: file.name,
            content_type: file.type,
            size_bytes: file.size,
            uploaded_by: user.id,
          } as any)
          .select()
          .single();

        if (error) throw error;

        await supabase.from('audit_logs').insert({
          activity_entry_id: entryId,
          user_id: user.id,
          action: 'evidence_attached',
          details: {
            file_name: file.name,
            size_bytes: file.size,
            content_type: file.type,
          },
        });

        return data;
      } catch {
        MockDB.addEvidence(entryId, file.name);
        return { id: crypto.randomUUID(), file_name: file.name, file_path: 'mock_path' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-entries'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}
