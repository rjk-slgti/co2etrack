import { useMemo } from 'react';
import { useActivityEntries } from './useActivityEntries';
import { useWorkspaceSettings } from './useWorkspaceSettings';
import { useOrganizationCatalog } from './useOrganizationCatalog';
import { buildWorkspaceSummary } from '@/lib/audit-analytics';

export function useAuditWorkspace() {
  const { settings } = useWorkspaceSettings();
  const entriesQuery = useActivityEntries(settings.selectedOrganizationId);
  const { data: catalog } = useOrganizationCatalog();

  const organization = useMemo(() => {
    return catalog?.organizations.find((org) => org.id === settings.selectedOrganizationId);
  }, [catalog?.organizations, settings.selectedOrganizationId]);

  const entries = useMemo(() => (entriesQuery.data ?? []) as any[], [entriesQuery.data]);
  
  const summary = useMemo(() => {
    return buildWorkspaceSummary(entries, organization);
  }, [entries, organization]);

  return {
    ...entriesQuery,
    entries,
    summary,
    settings,
    organization,
  };
}
