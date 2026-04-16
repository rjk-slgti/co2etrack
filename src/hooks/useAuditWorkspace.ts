import { useMemo } from 'react';
import { useActivityEntries } from './useActivityEntries';
import { useWorkspaceSettings } from './useWorkspaceSettings';
import { buildWorkspaceSummary } from '@/lib/audit-analytics';

export function useAuditWorkspace() {
  const { settings } = useWorkspaceSettings();
  const entriesQuery = useActivityEntries(settings.selectedOrganizationId);

  const entries = useMemo(() => (entriesQuery.data ?? []) as any[], [entriesQuery.data]);
  const summary = useMemo(() => buildWorkspaceSummary(entries), [entries]);

  return {
    ...entriesQuery,
    entries,
    summary,
    settings,
  };
}
