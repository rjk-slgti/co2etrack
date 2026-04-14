import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MockDB } from '@/lib/mock-database';
import { useAuth } from './useAuth';

export function useEvidenceUpload() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ entryId, file }: { entryId: string; file: File }) => {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${entryId}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      try {
        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Create activity_evidence record
        const { data, error: dbError } = await supabase
          .from('activity_evidence')
          .insert({
            activity_entry_id: entryId,
            file_name: file.name,
            file_path: filePath,
            content_type: file.type,
            size_bytes: file.size,
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return data;
      } catch (e) {
        console.log("Fallback to MockDB UPLOAD EVIDENCE");
        return MockDB.addEvidence(entryId, file.name);
      }
    },
  });
}
