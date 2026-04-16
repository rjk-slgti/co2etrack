import { type ReactNode } from 'react';
import { Building2, Globe2, Palette, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizationCatalog } from '@/hooks/useOrganizationCatalog';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { REPORT_LANGUAGES, ROLE_OPTIONS, STANDARD_OPTIONS } from '@/lib/constants';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useWorkspaceSettings();
  const { data: catalog } = useOrganizationCatalog();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-none bg-primary/10 text-primary">Settings and governance</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Configure the workspace for multi-company, role-based carbon auditing.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Define your reporting defaults, organization branding, languages, and workflow roles from one control panel.
          </p>
        </div>
        <button type="button" className="text-sm font-medium text-primary underline-offset-4 hover:underline" onClick={resetSettings}>
          Reset to demo defaults
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization profile
            </CardTitle>
            <CardDescription>These values drive report branding, factor selection, and audit defaults.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Organization">
              <Select
                value={settings.selectedOrganizationId}
                onValueChange={(value) => {
                  const organization = (catalog?.organizations ?? []).find((item) => item.id === value);
                  updateSettings({
                    selectedOrganizationId: value,
                    organizationName: organization?.name ?? settings.organizationName,
                    organizationCountry: organization?.country ?? settings.organizationCountry,
                    industry: organization?.industry ?? settings.industry,
                    reportingCurrency: organization?.reporting_currency ?? settings.reportingCurrency,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(catalog?.organizations ?? []).map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Display name">
              <Input value={settings.organizationName} onChange={(event) => updateSettings({ organizationName: event.target.value })} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Country">
                <Input value={settings.organizationCountry} onChange={(event) => updateSettings({ organizationCountry: event.target.value.toUpperCase() })} />
              </Field>
              <Field label="Industry">
                <Input value={settings.industry} onChange={(event) => updateSettings({ industry: event.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Reporting currency">
                <Input value={settings.reportingCurrency} onChange={(event) => updateSettings({ reportingCurrency: event.target.value.toUpperCase() })} />
              </Field>
              <Field label="Boundary approach">
                <Input value={settings.boundaryApproach} onChange={(event) => updateSettings({ boundaryApproach: event.target.value })} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary" />
              Reporting defaults
            </CardTitle>
            <CardDescription>Used by the audit wizard, calculations, and report generator.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Primary standard">
              <Select value={settings.primaryStandard} onValueChange={(value) => updateSettings({ primaryStandard: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_OPTIONS.map((standard) => (
                    <SelectItem key={standard} value={standard}>
                      {standard}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Default language">
                <Select value={settings.defaultLanguage} onValueChange={(value) => updateSettings({ defaultLanguage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="GWP set">
                <Input value={settings.gwpSet} onChange={(event) => updateSettings({ gwpSet: event.target.value.toUpperCase() })} />
              </Field>
            </div>
            <Field label="Benchmark sector">
              <Input value={settings.benchmarkSector} onChange={(event) => updateSettings({ benchmarkSector: event.target.value })} />
            </Field>
            <Field label="Secondary standards">
              <Input
                value={settings.secondaryStandards.join(', ')}
                onChange={(event) =>
                  updateSettings({
                    secondaryStandards: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="ISO 14064-1, CDP, GRI 305"
              />
            </Field>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Branding and report look
            </CardTitle>
            <CardDescription>These values are applied to the exportable report templates.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Report title">
              <Input value={settings.reportTitle} onChange={(event) => updateSettings({ reportTitle: event.target.value })} />
            </Field>
            <Field label="Logo URL">
              <Input value={settings.logoUrl} onChange={(event) => updateSettings({ logoUrl: event.target.value })} placeholder="https://example.com/logo.png" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary brand color">
                <div className="flex gap-3">
                  <Input value={settings.brandPrimary} onChange={(event) => updateSettings({ brandPrimary: event.target.value })} />
                  <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: settings.brandPrimary }} />
                </div>
              </Field>
              <Field label="Secondary brand color">
                <div className="flex gap-3">
                  <Input value={settings.brandSecondary} onChange={(event) => updateSettings({ brandSecondary: event.target.value })} />
                  <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: settings.brandSecondary }} />
                </div>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Workflow roles
            </CardTitle>
            <CardDescription>Recommended access levels for enterprise carbon audit workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ROLE_OPTIONS.map((role) => (
              <div key={role.value} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{role.label}</p>
                  <Badge variant="outline">{role.value}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {role.value === 'admin' && 'Full configuration, factor governance, and organization management access.'}
                  {role.value === 'auditor' && 'Can validate activity data, clear findings, and approve audit steps.'}
                  {role.value === 'approver' && 'Final sign-off role for publishing the reporting pack.'}
                  {role.value === 'viewer' && 'Read-only access to dashboards, reports, and audit evidence.'}
                  {role.value === 'data_entry' && 'Can collect activity data, upload evidence, and submit records for review.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
