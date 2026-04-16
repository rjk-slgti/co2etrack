import { useLocalStorageState } from './useLocalStorageState';
import { DEFAULT_WORKSPACE_SETTINGS, type WorkspaceSettings } from '@/lib/workspace-settings';

export function useWorkspaceSettings() {
  const [settings, setSettings] = useLocalStorageState<WorkspaceSettings>(
    'co2etrack-workspace-settings',
    DEFAULT_WORKSPACE_SETTINGS
  );

  return {
    settings,
    setSettings,
    updateSettings: (updates: Partial<WorkspaceSettings>) =>
      setSettings((current) => ({ ...current, ...updates })),
    resetSettings: () => setSettings(DEFAULT_WORKSPACE_SETTINGS),
  };
}
