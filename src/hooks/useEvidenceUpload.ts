import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function useEvidenceUpload() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ entryId, file }: { entryId: string; file: File }) => {
      if (!user) throw new Error('Not authenticated');
      // Evidence upload is a placeholder — storage bucket and table not yet configured
      console.log('Evidence upload placeholder for entry:', entryId, file.name);
      return { id: crypto.randomUUID(), file_name: file.name };
    },
  });
}
